import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, AlertTriangle, Building2, MapPinned } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ----------------------------------------------------------------------
// 1. CONFIGURATION DES ICÔNES
// ----------------------------------------------------------------------

// Fix pour les icônes Leaflet par défaut
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Interface des données
interface DrsData {
  id: string;
  nom?: string;
  code?: string;
  region: string;
  latitude?: number;
  longitude?: number;
}

// Interface pour les statistiques (simulées ou réelles)
interface RegionStats {
  stocks: number;
  alertes: number;
  commandes: number;
}

// ----------------------------------------------------------------------
// 2. COORDONNÉES ET DONNÉES GÉOGRAPHIQUES (CORRIGÉES)
// ----------------------------------------------------------------------

// Coordonnées GPS exactes fournies par l'utilisateur
const regionCoordinates: Record<string, { lat: number; lng: number; label: string }> = {
  // --- Siège & Agences Principales (GPS Précis) ---
  'conakry': {
    lat: 9.545984,
    lng: -13.671068,
    label: "Siège Social - Dixinn Mosquée, près Stade 28 Septembre"
  },
  'kankan': {
    lat: 10.367947,
    lng: -9.305960,
    label: "Pharmacie Centrale de Guinée Kankan"
  },

  // --- Agences Régionales (Localisation par quartier) ---
  'mamou': {
    lat: 10.3759, // Coordonnées centre-ville Mamou
    lng: -12.0909,
    label: "Agence Régionale - Quartier Petel 2, commune urbaine"
  },
  'nzerekore': {
    lat: 7.7562,
    lng: -8.8179,
    label: "Agence Régionale - À plus de 800 km de Conakry"
  },
  'n\'zérékoré': { // Alias pour compatibilité
    lat: 7.7562,
    lng: -8.8179,
    label: "Agence Régionale - À plus de 800 km de Conakry"
  },

  // --- Autres Agences (Centres urbains) ---
  'kindia': { lat: 10.0568, lng: -12.8646, label: "Agence Régionale Kindia" },
  'boke': { lat: 10.9424, lng: -14.2918, label: "Agence Régionale Boké" },
  'boké': { lat: 10.9424, lng: -14.2918, label: "Agence Régionale Boké" },
  'labe': { lat: 11.3180, lng: -12.2895, label: "Agence Régionale Labé" },
  'labé': { lat: 11.3180, lng: -12.2895, label: "Agence Régionale Labé" },
  'faranah': { lat: 10.0405, lng: -10.7408, label: "Agence Régionale Faranah" },
};

// Données simulées pour l'exemple (à connecter à votre API si disponible)
const mockStats: Record<string, RegionStats> = {
  'conakry': { stocks: 15450, alertes: 2, commandes: 310 },
  'kankan': { stocks: 5200, alertes: 4, commandes: 125 },
  'kindia': { stocks: 4100, alertes: 1, commandes: 98 },
  'mamou': { stocks: 2800, alertes: 5, commandes: 67 },
  'nzerekore': { stocks: 6300, alertes: 3, commandes: 145 },
  'n\'zérékoré': { stocks: 6300, alertes: 3, commandes: 145 },
  'boke': { stocks: 3500, alertes: 2, commandes: 88 },
  'boké': { stocks: 3500, alertes: 2, commandes: 88 },
  'labe': { stocks: 3100, alertes: 0, commandes: 72 },
  'labé': { stocks: 3100, alertes: 0, commandes: 72 },
  'faranah': { stocks: 1950, alertes: 6, commandes: 45 },
};

// ----------------------------------------------------------------------
// 3. COMPOSANTS UTILITAIRES
// ----------------------------------------------------------------------

// Générateur d'icônes SVG
const createCustomIcon = (hasAlerts: boolean) => {
  const color = hasAlerts ? '#ef4444' : '#0d9488'; // Rouge ou Teal
  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 26 16 26s16-17.2 16-26c0-8.8-7.2-16-16-16z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
      ${hasAlerts ? '<circle cx="26" cy="6" r="4" fill="#ef4444" stroke="white" stroke-width="1"/>' : ''}
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-wrapper',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42]
  });
};

// Composant pour adapter le zoom (FitBounds)
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      try {
        const bounds = L.latLngBounds(positions);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
      } catch (e) {
        console.warn("Erreur fitBounds:", e);
      }
    }
  }, [positions, map]);
  return null;
}

// ----------------------------------------------------------------------
// 4. COMPOSANT PRINCIPAL
// ----------------------------------------------------------------------

export default function GuineaMap() {
  const [drsData, setDrsData] = useState<DrsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await supabase.from('drs').select('*');
      if (apiError) throw apiError;

      if (data && data.length > 0) {
        setDrsData(data as DrsData[]);
      } else {
        // Fallback si DB vide
        const fallbackData = Object.keys(regionCoordinates).map((key, index) => ({
          id: `static-${index}`,
          region: key.charAt(0).toUpperCase() + key.slice(1),
        }));
        // Dédoublonnage
        const uniqueRegions = fallbackData.filter((v, i, a) => a.findIndex(t => (t.region === v.region)) === i);
        setDrsData(uniqueRegions as DrsData[]);
      }
    } catch (err: any) {
      console.error("Erreur chargement carte:", err);
      setError("Erreur chargement données");
      // Mode secours
      const fallbackData = Object.keys(regionCoordinates)
        .filter(k => !k.includes('boke') && !k.includes('labe') && !k.includes('zere'))
        .map((key, index) => ({
          id: `fallback-${index}`,
          region: key.charAt(0).toUpperCase() + key.slice(1),
        }));
      setDrsData(fallbackData as DrsData[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fusion des données (DB + Coordonnées locales)
  const markers = useMemo(() => {
    return drsData.map(drs => {
      if (!drs || !drs.region) return null;
      const normalizedRegion = drs.region.trim().toLowerCase();

      // Priorité 1: Coordonnées DB, Priorité 2: Coordonnées Locales
      let lat = drs.latitude;
      let lng = drs.longitude;
      let label = "";

      if (!lat || !lng) {
        const coords = regionCoordinates[normalizedRegion];
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          label = coords.label;
        }
      }

      if (!lat || !lng) return null;

      const stats = mockStats[normalizedRegion] || { stocks: 0, alertes: 0, commandes: 0 };

      return { ...drs, lat, lng, stats, label };
    }).filter((m): m is NonNullable<typeof m> => m !== null);
  }, [drsData]);

  const positions: [number, number][] = markers.map(m => [m.lat, m.lng]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Chargement...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Carte Nationale des Agences
        </CardTitle>
        {error && <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Hors ligne</Badge>}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={loadData}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </CardHeader>

      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="h-[500px] rounded-lg overflow-hidden border relative z-0">
          <MapContainer
            center={[9.6, -13.6]}
            zoom={7}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
          >
            {/* Google Maps Layer (Plan propre) */}
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />

            <FitBounds positions={positions} />

            {markers.map((marker, index) => {
              const hasAlerts = marker.stats.alertes > 3;
              return (
                <Marker
                  key={`${marker.id}-${index}`}
                  position={[marker.lat, marker.lng]}
                  icon={createCustomIcon(hasAlerts)}
                >
                  <Popup>
                    <div className="p-1 min-w-[220px]">
                      <div className="flex flex-col mb-2 border-b pb-2">
                        <h4 className="font-display font-bold text-base text-primary flex items-center gap-2">
                          {marker.region}
                        </h4>
                        {/* Affichage de l'adresse spécifique si disponible */}
                        {marker.label && (
                          <div className="flex items-start gap-1.5 mt-1 text-xs text-muted-foreground bg-muted/40 p-1 rounded">
                            <MapPinned className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{marker.label}</span>
                          </div>
                        )}
                        {!marker.label && marker.code && (
                          <span className="text-[10px] text-muted-foreground font-mono mt-1">{marker.code}</span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-xs">Stocks disp.</span>
                          <span className="font-bold font-mono">{marker.stats.stocks.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground text-xs">Commandes</span>
                          <span className="font-medium">{marker.stats.commandes}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-muted-foreground text-xs">État du stock</span>
                          <Badge
                            variant={hasAlerts ? 'destructive' : 'outline'}
                            className={`text-[10px] h-5 ${!hasAlerts ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}`}
                          >
                            {hasAlerts ? 'Critique' : 'Normal'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur p-2.5 rounded-lg border shadow-lg z-[1000] text-xs space-y-2">
            <div className="font-semibold text-muted-foreground mb-1">État des Agences</div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#0d9488]" />
              <span>Stock Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
              <span>Alerte Stock ({'>'}3)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}