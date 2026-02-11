import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Truck, Search, Filter, Eye, MapPin, Clock, CheckCircle, Package, Navigation,
} from 'lucide-react';

const STATUTS_LIVRAISON = {
  PREPAREE: { label: 'Préparée', className: 'bg-muted text-muted-foreground border-border', icon: Package },
  EN_COURS: { label: 'En cours', className: 'bg-info/10 text-info border-info/20', icon: Truck },
  LIVREE: { label: 'Livrée', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  ANNULEE: { label: 'Annulée', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: Clock },
};

type LivraisonStatut = keyof typeof STATUTS_LIVRAISON;

// Simulated DRS positions for map
const drsPositions: Record<string, { x: number; y: number; name: string }> = {
  'Conakry': { x: 80, y: 230, name: 'Conakry' },
  'Kindia': { x: 130, y: 195, name: 'Kindia' },
  'Boké': { x: 75, y: 140, name: 'Boké' },
  'Mamou': { x: 180, y: 170, name: 'Mamou' },
  'Labé': { x: 165, y: 110, name: 'Labé' },
  'Faranah': { x: 260, y: 200, name: 'Faranah' },
  'Kankan': { x: 340, y: 165, name: 'Kankan' },
  'NZerekore': { x: 290, y: 280, name: "N'Zérékoré" },
};

export default function LivraisonsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLivraison, setSelectedLivraison] = useState<string | null>(null);

  // Fetch livraisons
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

  // Realtime subscription for GPS updates
  useEffect(() => {
    const channel = supabase
      .channel('livraisons-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livraisons' }, () => {
        queryClient.invalidateQueries({ queryKey: ['livraisons'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Update status
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

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Truck className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-display font-bold">{counts.total}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center"><Navigation className="h-5 w-5 text-info" /></div>
            <div><p className="text-xs text-muted-foreground">En cours</p><p className="text-xl font-display font-bold text-info">{counts.en_cours}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Livrées</p><p className="text-xl font-display font-bold text-success">{counts.livrees}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Package className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">Préparées</p><p className="text-xl font-display font-bold text-warning">{counts.preparees}</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Map - realtime tracking */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Carte des livraisons en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <svg viewBox="0 0 440 340" className="w-full h-auto max-h-72">
              {/* Guinea outline */}
              <path
                d="M60,80 L120,50 L180,45 L210,60 L250,55 L300,70 L370,90 L400,120 L390,160 L380,190 L360,220 L340,240 L320,260 L300,290 L270,310 L240,300 L210,290 L190,260 L160,240 L130,230 L100,240 L70,260 L50,240 L40,200 L45,160 L50,120 L60,80Z"
                fill="hsl(174, 55%, 95%)"
                stroke="hsl(174, 55%, 38%)"
                strokeWidth="1.5"
              />
              {/* DRS markers */}
              {Object.entries(drsPositions).map(([key, pos]) => (
                <g key={key}>
                  <circle cx={pos.x} cy={pos.y} r="6" fill="hsl(174, 55%, 38%)" stroke="white" strokeWidth="1.5" opacity="0.6" />
                  <text x={pos.x} y={pos.y - 10} textAnchor="middle" fontSize="8" fill="hsl(170, 30%, 30%)" fontFamily="Inter">{pos.name}</text>
                </g>
              ))}
              {/* Active deliveries as animated dots */}
              {enCours.map((l: any, i: number) => {
                // Simulate position between two points
                const keys = Object.keys(drsPositions);
                const fromKey = keys[i % keys.length];
                const toKey = keys[(i + 1) % keys.length];
                const from = drsPositions[fromKey];
                const to = drsPositions[toKey];
                const progress = 0.3 + (i * 0.15) % 0.6;
                const cx = from.x + (to.x - from.x) * progress;
                const cy = from.y + (to.y - from.y) * progress;
                return (
                  <g key={l.id} className="cursor-pointer" onClick={() => setSelectedLivraison(l.id)}>
                    <circle cx={cx} cy={cy} r="10" fill="hsl(210, 80%, 52%)" opacity="0.15">
                      <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={cx} cy={cy} r="5" fill="hsl(210, 80%, 52%)" stroke="white" strokeWidth="1.5" />
                    <text x={cx} y={cy - 10} textAnchor="middle" fontSize="7" fill="hsl(210, 80%, 40%)" fontWeight="600" fontFamily="Inter">
                      {l.numero_livraison.slice(-6)}
                    </text>
                    {/* Route line */}
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="hsl(210, 80%, 52%)" strokeWidth="1" strokeDasharray="4 3" opacity="0.3" />
                  </g>
                );
              })}
            </svg>
            {enCours.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground bg-card/80 backdrop-blur px-4 py-2 rounded-lg">Aucune livraison en cours</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
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

      {/* Table */}
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
                      {l.date_arrivee_reelle ? new Date(l.date_arrivee_reelle).toLocaleDateString('fr-FR') : l.date_arrivee_estimee ? `Est. ${new Date(l.date_arrivee_estimee).toLocaleDateString('fr-FR')}` : '—'}
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

      {/* Detail Dialog */}
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
                {detail.latitude_actuelle && <div><p className="text-muted-foreground text-xs">Position GPS</p><p className="font-mono text-xs">{detail.latitude_actuelle}, {detail.longitude_actuelle}</p></div>}
              </div>
              {detail.commentaire && <div className="text-sm bg-muted p-3 rounded-lg">{detail.commentaire}</div>}
              
              {/* Status actions */}
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
