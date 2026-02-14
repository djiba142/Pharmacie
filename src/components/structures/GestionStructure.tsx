import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useUserLevel } from '@/hooks/useUserLevel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Package, Plus, Search, AlertTriangle, ArrowUpDown, TrendingDown, TrendingUp,
  Minus, BarChart3, Thermometer,
} from 'lucide-react';

interface GestionStructureProps {
  typeStructure: string;
  titre: string;
  description: string;
  icon: React.ReactNode;
}

type StockEntry = {
  medicament_id: string;
  lot_id: string;
  quantite: number;
  type: 'ENTREE' | 'SORTIE' | 'AJUSTEMENT';
  commentaire: string;
};

const emptyEntry: StockEntry = {
  medicament_id: '', lot_id: '', quantite: 0, type: 'ENTREE', commentaire: '',
};

export default function GestionStructure({ typeStructure, titre, description, icon }: GestionStructureProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { level, entityId } = useUserLevel();
  const [search, setSearch] = useState('');
  const [showEntry, setShowEntry] = useState(false);
  const [entry, setEntry] = useState<StockEntry>(emptyEntry);

  // Fetch structures of this type
  const { data: structures = [], isLoading: loadingStructures } = useQuery({
    queryKey: ['structures', typeStructure],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .eq('type', typeStructure)
        .eq('is_active', true)
        .order('nom');
      if (error) throw error;
      return data;
    },
  });

  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);

  useEffect(() => {
    if (structures.length > 0 && !selectedStructureId) {
      // Auto-select user's entity or first structure
      const userStructure = entityId ? structures.find((s: any) => s.id === entityId) : null;
      setSelectedStructureId(userStructure?.id || structures[0]?.id || null);
    }
  }, [structures, entityId, selectedStructureId]);

  // Fetch stocks for selected structure
  const { data: stocks = [], isLoading: loadingStocks } = useQuery({
    queryKey: ['structure-stocks', selectedStructureId],
    queryFn: async () => {
      if (!selectedStructureId) return [];
      const { data, error } = await supabase
        .from('stocks')
        .select('*, lots!inner(*, medicaments!inner(*))')
        .eq('entite_id', selectedStructureId)
        .order('quantite_actuelle', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedStructureId,
  });

  // Fetch medicaments for dropdown
  const { data: medicaments = [] } = useQuery({
    queryKey: ['medicaments-list'],
    queryFn: async () => {
      const { data } = await supabase.from('medicaments').select('id, dci, nom_commercial').eq('is_active', true).order('dci');
      return data || [];
    },
  });

  // Fetch lots for selected medicament
  const { data: lots = [] } = useQuery({
    queryKey: ['lots-for-med', entry.medicament_id],
    queryFn: async () => {
      if (!entry.medicament_id) return [];
      const { data } = await supabase
        .from('lots')
        .select('id, numero_lot, date_peremption, quantite_initiale')
        .eq('medicament_id', entry.medicament_id)
        .eq('statut', 'DISPONIBLE')
        .order('date_peremption');
      return data || [];
    },
    enabled: !!entry.medicament_id,
  });

  // Recent movements
  const { data: mouvements = [] } = useQuery({
    queryKey: ['structure-mouvements', selectedStructureId],
    queryFn: async () => {
      if (!selectedStructureId) return [];
      const { data } = await supabase
        .from('mouvements_stock')
        .select('*, stocks!inner(entite_id, lots!inner(medicaments!inner(dci)))')
        .eq('stocks.entite_id', selectedStructureId)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!selectedStructureId,
  });

  // Realtime stock updates
  useEffect(() => {
    if (!selectedStructureId) return;
    const channel = supabase
      .channel(`stocks-${selectedStructureId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stocks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['structure-stocks', selectedStructureId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mouvements_stock' }, () => {
        queryClient.invalidateQueries({ queryKey: ['structure-mouvements', selectedStructureId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedStructureId, queryClient]);

  // Stock entry mutation
  const entryMutation = useMutation({
    mutationFn: async (e: StockEntry) => {
      // Find or create stock record
      let stockId: string;
      const { data: existing } = await supabase
        .from('stocks')
        .select('id, quantite_actuelle')
        .eq('entite_id', selectedStructureId!)
        .eq('lot_id', e.lot_id)
        .maybeSingle();

      if (existing) {
        stockId = existing.id;
        const newQty = e.type === 'ENTREE'
          ? existing.quantite_actuelle + e.quantite
          : e.type === 'SORTIE'
            ? Math.max(0, existing.quantite_actuelle - e.quantite)
            : e.quantite;
        
        const updates: any = {
          quantite_actuelle: newQty,
          derniere_maj: new Date().toISOString(),
        };
        if (e.type === 'ENTREE') updates.derniere_entree = new Date().toISOString();
        if (e.type === 'SORTIE') updates.derniere_sortie = new Date().toISOString();

        const { error } = await supabase.from('stocks').update(updates).eq('id', stockId);
        if (error) throw error;
      } else {
        const { data: newStock, error } = await supabase
          .from('stocks')
          .insert({
            entite_id: selectedStructureId!,
            entite_type: typeStructure,
            lot_id: e.lot_id,
            quantite_actuelle: e.type === 'ENTREE' ? e.quantite : 0,
            derniere_entree: e.type === 'ENTREE' ? new Date().toISOString() : null,
          })
          .select('id')
          .single();
        if (error) throw error;
        stockId = newStock.id;
      }

      // Record movement
      const { error: mvtError } = await supabase.from('mouvements_stock').insert({
        stock_id: stockId,
        type: e.type,
        quantite: e.quantite,
        commentaire: e.commentaire || null,
        effectue_par: user?.user_id || null,
      });
      if (mvtError) throw mvtError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structure-stocks', selectedStructureId] });
      queryClient.invalidateQueries({ queryKey: ['structure-mouvements', selectedStructureId] });
      setShowEntry(false);
      setEntry(emptyEntry);
      toast({ title: 'Mouvement enregistré', description: 'Le stock a été mis à jour en temps réel.' });
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  // Stats
  const totalItems = stocks.length;
  const alertCount = stocks.filter((s: any) => s.quantite_actuelle <= s.seuil_alerte && s.quantite_actuelle > s.seuil_minimal).length;
  const criticalCount = stocks.filter((s: any) => s.quantite_actuelle <= s.seuil_minimal).length;
  const expiredCount = stocks.filter((s: any) => new Date(s.lots?.date_peremption) < new Date()).length;

  const filteredStocks = stocks.filter((s: any) => {
    const dci = s.lots?.medicaments?.dci || '';
    return dci.toLowerCase().includes(search.toLowerCase());
  });

  const getStockStatus = (s: any) => {
    const exp = new Date(s.lots?.date_peremption);
    if (exp < new Date()) return { label: 'Périmé', className: 'bg-destructive/10 text-destructive border-destructive/20' };
    if (s.quantite_actuelle <= s.seuil_minimal) return { label: 'Critique', className: 'bg-destructive/10 text-destructive border-destructive/20' };
    if (s.quantite_actuelle <= s.seuil_alerte) return { label: 'Alerte', className: 'bg-warning/10 text-warning border-warning/20' };
    return { label: 'Normal', className: 'bg-success/10 text-success border-success/20' };
  };

  const selectedStructure = structures.find((s: any) => s.id === selectedStructureId);

  if (loadingStructures) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{titre}</h1>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <Button onClick={() => { setEntry(emptyEntry); setShowEntry(true); }} disabled={!selectedStructureId}>
          <Plus className="h-4 w-4 mr-2" /> Saisie stock
        </Button>
      </div>

      {/* Structure selector */}
      {structures.length > 1 && (
        <Select value={selectedStructureId || ''} onValueChange={setSelectedStructureId}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Sélectionner une structure" />
          </SelectTrigger>
          <SelectContent>
            {structures.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>{s.nom} — {s.commune || s.type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {structures.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-display font-semibold">Aucune structure de type "{typeStructure}" trouvée</p>
          <p className="text-sm mt-2">Créez d'abord une structure dans les paramètres</p>
        </CardContent></Card>
      )}

      {selectedStructureId && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="stat-card"><CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
                <div><p className="text-xs text-muted-foreground">Produits</p><p className="text-xl font-display font-bold">{totalItems}</p></div>
              </div>
            </CardContent></Card>
            <Card className="stat-card"><CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-warning" /></div>
                <div><p className="text-xs text-muted-foreground">Alerte</p><p className="text-xl font-display font-bold text-warning">{alertCount}</p></div>
              </div>
            </CardContent></Card>
            <Card className="stat-card"><CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-destructive" /></div>
                <div><p className="text-xs text-muted-foreground">Critique</p><p className="text-xl font-display font-bold text-destructive">{criticalCount}</p></div>
              </div>
            </CardContent></Card>
            <Card className="stat-card"><CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><Thermometer className="h-5 w-5 text-destructive" /></div>
                <div><p className="text-xs text-muted-foreground">Périmés</p><p className="text-xl font-display font-bold text-destructive">{expiredCount}</p></div>
              </div>
            </CardContent></Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un médicament..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>

          {/* Stock table */}
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Médicament</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Seuil alerte</TableHead>
                <TableHead>Péremption</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Dernière MAJ</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {loadingStocks ? (
                  <TableRow><TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ) : filteredStocks.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucun stock enregistré</TableCell></TableRow>
                ) : filteredStocks.map((s: any) => {
                  const status = getStockStatus(s);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-sm">{s.lots?.medicaments?.dci || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs">{s.lots?.numero_lot}</TableCell>
                      <TableCell className="font-display font-bold">{s.quantite_actuelle}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.seuil_alerte}</TableCell>
                      <TableCell className="text-xs">{new Date(s.lots?.date_peremption).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell><Badge variant="outline" className={status.className}>{status.label}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.derniere_maj ? new Date(s.derniere_maj).toLocaleDateString('fr-FR') : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent></Card>

          {/* Recent movements */}
          {mouvements.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Derniers mouvements</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Médicament</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Commentaire</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {mouvements.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs">{new Date(m.created_at).toLocaleString('fr-FR')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            m.type === 'ENTREE' ? 'bg-success/10 text-success border-success/20' :
                            m.type === 'SORTIE' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-info/10 text-info border-info/20'
                          }>
                            {m.type === 'ENTREE' && <TrendingUp className="h-3 w-3 mr-1" />}
                            {m.type === 'SORTIE' && <TrendingDown className="h-3 w-3 mr-1" />}
                            {m.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{m.stocks?.lots?.medicaments?.dci || '—'}</TableCell>
                        <TableCell className="font-mono font-medium">{m.quantite}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.commentaire || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Stock entry dialog */}
      <Dialog open={showEntry} onOpenChange={setShowEntry}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Saisie de stock</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type de mouvement</Label>
              <Select value={entry.type} onValueChange={(v: any) => setEntry({ ...entry, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTREE">Entrée</SelectItem>
                  <SelectItem value="SORTIE">Sortie</SelectItem>
                  <SelectItem value="AJUSTEMENT">Ajustement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Médicament *</Label>
              <Select value={entry.medicament_id} onValueChange={(v) => setEntry({ ...entry, medicament_id: v, lot_id: '' })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un médicament" /></SelectTrigger>
                <SelectContent>
                  {medicaments.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.dci} {m.nom_commercial ? `(${m.nom_commercial})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {entry.medicament_id && (
              <div className="space-y-2">
                <Label>Lot *</Label>
                <Select value={entry.lot_id} onValueChange={(v) => setEntry({ ...entry, lot_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un lot" /></SelectTrigger>
                  <SelectContent>
                    {lots.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.numero_lot} — Exp: {new Date(l.date_peremption).toLocaleDateString('fr-FR')}
                      </SelectItem>
                    ))}
                    {lots.length === 0 && <SelectItem value="none" disabled>Aucun lot disponible</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Quantité *</Label>
              <Input type="number" min={1} value={entry.quantite || ''} onChange={e => setEntry({ ...entry, quantite: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Commentaire</Label>
              <Input value={entry.commentaire} onChange={e => setEntry({ ...entry, commentaire: e.target.value })} placeholder="Motif du mouvement..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEntry(false)}>Annuler</Button>
            <Button
              onClick={() => entryMutation.mutate(entry)}
              disabled={!entry.medicament_id || !entry.lot_id || !entry.quantite || entryMutation.isPending}
            >
              {entryMutation.isPending ? 'Enregistrement...' : 'Valider'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
