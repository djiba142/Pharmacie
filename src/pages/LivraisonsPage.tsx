import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Truck, Search, Filter, Eye, MapPin, CheckCircle, Package, Navigation, Clock
} from 'lucide-react';

// --- CONFIGURATION LEAFLET ---
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

// Icône Camion (Couleurs vives pour bien ressortir sur le fond blanc)
const createTruckIcon = (status: string) => {
  // Bleu vif pour "En cours", Vert foncé pour "Livré"
  const color = status === 'EN_COURS' ? '#2563eb' : '#059669';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8">
      <path d="M10 17h4V5H2v12h3"></path>
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"></path>
      <path d="M14 17h1"></path>
      <circle cx="7.5" cy="17.5" r="2.5"></circle>
      <circle cx="17.5" cy="17.5" r="2.5"></circle>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'bg-transparent',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

// Coordonnées GPS exactes des agences (fournies par l'utilisateur)
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Conakry': { lat: 9.545984, lng: -13.671068 }, // Siège - Dixinn Mosquée
  'Kankan': { lat: 10.367947, lng: -9.305960 }, // Pharmacie Centrale Kankan
  'Mamou': { lat: 10.3759, lng: -12.0909 }, // Quartier Petel 2
  'N\'Zérékoré': { lat: 7.7562, lng: -8.8179 }, // Agence régionale
  'Nzérékoré': { lat: 7.7562, lng: -8.8179 }, // Alias
  // Autres agences (coordonnées centres urbains)
  'Kindia': { lat: 10.0568, lng: -12.8646 },
  'Boké': { lat: 10.9424, lng: -14.2918 },
  'Labé': { lat: 11.3180, lng: -12.2895 },
  'Faranah': { lat: 10.0405, lng: -10.7408 },
};

const STATUTS_LIVRAISON = {
  PREPAREE: { label: 'Préparée', className: 'bg-muted text-muted-foreground border-border', icon: Package },
  EN_COURS: { label: 'En cours', className: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
  LIVREE: { label: 'Livrée', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  ANNULEE: { label: 'Annulée', className: 'bg-red-100 text-red-700 border-red-200', icon: Clock },
};

type LivraisonStatut = keyof typeof STATUTS_LIVRAISON;

export default function LivraisonsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLivraison, setSelectedLivraison] = useState<string | null>(null);

  const { data: livraisons = [], isLoading } = useQuery({
    queryKey: ['livraisons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('livraisons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('livraisons-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livraisons' }, () => {
        queryClient.invalidateQueries({ queryKey: ['livraisons'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: string }) => {
      const updates: any = { statut };
      if (statut === 'EN_COURS') updates.date_depart = new Date().toISOString();
      if (statut === 'LIVREE') updates.date_arrivee_reelle = new Date().toISOString();
      const { error } = await supabase.from('livraisons').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['livraisons'] });
      toast({ title: 'Statut mis à jour' });
      setSelectedLivraison(null);
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const filtered = livraisons.filter((l: any) => {
    const matchSearch = l.numero_livraison.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const enCours = livraisons.filter((l: any) => l.statut === 'EN_COURS');
  const detail = livraisons.find((l: any) => l.id === selectedLivraison);

  const counts = {
    total: livraisons.length,
    en_cours: enCours.length,
    livrees: livraisons.filter((l: any) => l.statut === 'LIVREE').length,
    preparees: livraisons.filter((l: any) => l.statut === 'PREPAREE').length,
  };

  const mapMarkers = enCours.map((l: any) => {
    if (l.latitude_actuelle && l.longitude_actuelle) {
      return { ...l, lat: l.latitude_actuelle, lng: l.longitude_actuelle, isGps: true };
    }
    const dest = l.entite_destination_type || '';
    const foundCity = Object.keys(CITY_COORDINATES).find(city => dest.includes(city));
    if (foundCity) {
      return { ...l, ...CITY_COORDINATES[foundCity], isGps: false };
    }
    return null;
  }).filter(Boolean);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Suivi des Livraisons</h1>
        <p className="text-sm text-muted-foreground mt-1">Carte temps réel et suivi des expéditions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Truck className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{counts.total}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><Navigation className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-xs text-muted-foreground">En cours</p><p className="text-xl font-bold text-blue-600">{counts.en_cours}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-xs text-muted-foreground">Livrées</p><p className="text-xl font-bold text-green-600">{counts.livrees}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center"><Package className="h-5 w-5 text-orange-600" /></div>
          <div><p className="text-xs text-muted-foreground">Préparées</p><p className="text-xl font-bold text-orange-600">{counts.preparees}</p></div>
        </CardContent></Card>
      </div>

      {/* --- CARTE GOOGLE MAPS STYLE --- */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Carte des livraisons en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg overflow-hidden border z-0 relative">
            <MapContainer
              center={[10.5, -11.5]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              {/* --- CHANGEMENT ICI : Style Google Maps "Clean" --- */}
              <TileLayer
                attribution='&copy; Google Maps'
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              />

              {mapMarkers.map((l: any) => (
                <Marker
                  key={l.id}
                  position={[l.lat, l.lng]}
                  icon={createTruckIcon(l.statut)}
                  eventHandlers={{
                    click: () => setSelectedLivraison(l.id),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong className="block mb-1">{l.numero_livraison}</strong>
                      <span className="text-xs text-muted-foreground">Vers: {l.entite_destination_type}</span>
                      {l.isGps && <Badge variant="secondary" className="mt-1 text-[10px]">Signal GPS Actif</Badge>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {mapMarkers.length === 0 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[500]">
                <div className="bg-background/80 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium shadow-lg border">
                  Aucune livraison active sur la carte
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par N° livraison..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUTS_LIVRAISON).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Livraison</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Origine</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Départ</TableHead>
                <TableHead>Arrivée</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l: any) => {
                const cfg = STATUTS_LIVRAISON[l.statut as LivraisonStatut] || STATUTS_LIVRAISON.PREPAREE;
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-sm font-medium">{l.numero_livraison}</TableCell>
                    <TableCell><Badge variant="outline" className={cfg.className}>{cfg.label}</Badge></TableCell>
                    <TableCell className="text-xs">{l.entite_origine_type}</TableCell>
                    <TableCell className="text-xs">{l.entite_destination_type}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {l.date_depart ? new Date(l.date_depart).toLocaleDateString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {l.date_arrivee_reelle ? new Date(l.date_arrivee_reelle).toLocaleDateString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedLivraison(l.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucune livraison trouvée</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLivraison} onOpenChange={() => setSelectedLivraison(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Détail de la livraison</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">N° Livraison</p><p className="font-mono font-medium">{detail.numero_livraison}</p></div>
                <div><p className="text-muted-foreground text-xs">Statut</p><Badge variant="outline" className={STATUTS_LIVRAISON[detail.statut as LivraisonStatut]?.className}>{STATUTS_LIVRAISON[detail.statut as LivraisonStatut]?.label}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Origine</p><p>{detail.entite_origine_type}</p></div>
                <div><p className="text-muted-foreground text-xs">Destination</p><p>{detail.entite_destination_type}</p></div>
                {detail.date_depart && <div><p className="text-muted-foreground text-xs">Départ</p><p>{new Date(detail.date_depart).toLocaleString('fr-FR')}</p></div>}
                {detail.date_arrivee_reelle && <div><p className="text-muted-foreground text-xs">Arrivée</p><p>{new Date(detail.date_arrivee_reelle).toLocaleString('fr-FR')}</p></div>}

                {(detail.latitude_actuelle || detail.longitude_actuelle) && (
                  <div className="col-span-2 bg-muted/50 p-2 rounded flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-primary" />
                    <p className="font-mono text-xs">
                      GPS: {detail.latitude_actuelle || 'N/A'}, {detail.longitude_actuelle || 'N/A'}
                    </p>
                  </div>
                )}
              </div>

              {detail.commentaire && <div className="text-sm bg-muted p-3 rounded-lg">{detail.commentaire}</div>}

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {detail.statut === 'PREPAREE' && (
                  <Button size="sm" onClick={() => updateMutation.mutate({ id: detail.id, statut: 'EN_COURS' })} disabled={updateMutation.isPending}>
                    <Truck className="h-3 w-3 mr-1" /> Démarrer la livraison
                  </Button>
                )}
                {detail.statut === 'EN_COURS' && (
                  <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => updateMutation.mutate({ id: detail.id, statut: 'LIVREE' })} disabled={updateMutation.isPending}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Confirmer la livraison
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}