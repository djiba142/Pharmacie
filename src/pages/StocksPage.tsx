import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserLevel } from '@/hooks/useUserLevel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package, Search, Filter, Download, Plus, AlertTriangle, ArrowUpDown, Eye, Edit, TrendingDown, TrendingUp, BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type StockStatus = 'OK' | 'ALERTE' | 'CRITIQUE' | 'PERIME';

function getStatus(stock: any): StockStatus {
  const now = new Date();
  const peremption = new Date(stock.lots?.date_peremption);
  if (peremption < now) return 'PERIME';
  if (stock.quantite_actuelle <= stock.seuil_minimal) return 'CRITIQUE';
  if (stock.quantite_actuelle <= stock.seuil_alerte) return 'ALERTE';
  return 'OK';
}

const statusConfig: Record<StockStatus, { label: string; className: string }> = {
  OK: { label: 'En stock', className: 'bg-success/10 text-success border-success/20' },
  ALERTE: { label: 'Alerte', className: 'bg-warning/10 text-warning border-warning/20' },
  CRITIQUE: { label: 'Critique', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  PERIME: { label: 'Périmé', className: 'bg-muted text-muted-foreground border-border' },
};

const StocksPage = () => {
  const { level, entityId } = useUserLevel();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('medicament');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [detailDialog, setDetailDialog] = useState<string | null>(null);
  const [adjustDialog, setAdjustDialog] = useState<string | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustMotif, setAdjustMotif] = useState('');
  const { toast } = useToast();

  // Fetch real stocks from Supabase
  const { data: rawStocks = [], isLoading } = useQuery({
    queryKey: ['stocks-page', level, entityId],
    queryFn: async () => {
      let query = supabase.from('stocks').select('*, lots!inner(*, medicaments!inner(*))');

      if (level === 'regional' && entityId) {
        query = query.eq('entite_type', 'DRS').eq('entite_id', entityId);
      } else if (level === 'prefectoral' && entityId) {
        query = query.eq('entite_type', 'DPS').eq('entite_id', entityId);
      } else if (level === 'peripheral' && entityId) {
        query = query.eq('entite_id', entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch DRS/DPS names for display
  const { data: drsMap = {} } = useQuery({
    queryKey: ['drs-names'],
    queryFn: async () => {
      const { data } = await supabase.from('drs').select('id, nom');
      const map: Record<string, string> = {};
      (data || []).forEach((d: any) => { map[d.id] = d.nom; });
      return map;
    },
  });

  const stocks = rawStocks.map((s: any) => ({
    ...s,
    medicament: s.lots?.medicaments?.dci || 'N/A',
    dosage: s.lots?.medicaments?.dosage || '',
    forme: s.lots?.medicaments?.forme_pharmaceutique || '',
    categorie: s.lots?.medicaments?.classe_therapeutique || s.lots?.medicaments?.categorie || '',
    lot: s.lots?.numero_lot || '',
    peremption: s.lots?.date_peremption || '',
    entite_nom: drsMap[s.entite_id] || s.entite_type || '',
  }));

  const categories = [...new Set(stocks.map((s: any) => s.categorie).filter(Boolean))];

  const filteredStocks = useMemo(() => {
    const result = stocks.filter((s: any) => {
      const matchSearch = s.medicament.toLowerCase().includes(search.toLowerCase()) ||
        s.lot.toLowerCase().includes(search.toLowerCase());
      const status = getStatus(s);
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchSearch && matchStatus;
    });

    result.sort((a: any, b: any) => {
      let cmp = 0;
      if (sortBy === 'medicament') cmp = a.medicament.localeCompare(b.medicament);
      else if (sortBy === 'quantite') cmp = a.quantite_actuelle - b.quantite_actuelle;
      else if (sortBy === 'peremption') cmp = a.peremption.localeCompare(b.peremption);
      else if (sortBy === 'status') cmp = getStatus(a).localeCompare(getStatus(b));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [stocks, search, statusFilter, sortBy, sortDir]);

  const counts = useMemo(() => {
    const c = { OK: 0, ALERTE: 0, CRITIQUE: 0, PERIME: 0 };
    stocks.forEach((s: any) => c[getStatus(s)]++);
    return c;
  }, [stocks]);

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleAdjust = async () => {
    if (!adjustDialog || !adjustQty || !adjustMotif) return;

    try {
      const stock = stocks.find((s: any) => s.id === adjustDialog);
      if (!stock) throw new Error('Stock introuvable');

      const adjustment = parseInt(adjustQty);
      const newQuantity = stock.quantite_actuelle + adjustment;

      if (newQuantity < 0) {
        toast({
          title: 'Erreur',
          description: 'La quantité ne peut pas être négative',
          variant: 'destructive'
        });
        return;
      }

      // Update stock quantity
      const { error: updateError } = await supabase
        .from('stocks')
        .update({ quantite_actuelle: newQuantity })
        .eq('id', adjustDialog);

      if (updateError) throw updateError;

      // Log the movement
      const { error: movementError } = await supabase
        .from('mouvements_stock')
        .insert({
          stock_id: adjustDialog,
          type: adjustment > 0 ? 'ENTREE' : 'SORTIE',
          quantite: Math.abs(adjustment),
          commentaire: adjustMotif,
        });

      if (movementError) console.warn('Movement log failed:', movementError);

      toast({
        title: 'Stock ajusté',
        description: `Quantité ${adjustment > 0 ? 'augmentée' : 'diminuée'} de ${Math.abs(adjustment)} unités`
      });

      // Refresh data smoothly without page reload
      await queryClient.invalidateQueries({ queryKey: ['stocks-page'] });

      setAdjustDialog(null);
      setAdjustQty('');
      setAdjustMotif('');
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const detailStock = stocks.find((s: any) => s.id === detailDialog);

  if (isLoading) {
    return <div className="space-y-4 animate-fade-in"><Skeleton className="h-8 w-64" /><div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div><Skeleton className="h-64 rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestion des Stocks</h1>
          <p className="text-sm text-muted-foreground mt-1">Données en temps réel — {stocks.length} entrée(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Exporter</Button>
          <Button size="sm" onClick={() => setCreateDialog(true)}><Plus className="h-4 w-4 mr-2" /> Nouveau mouvement</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><Package className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">En stock</p><p className="text-xl font-display font-bold">{counts.OK}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">En alerte</p><p className="text-xl font-display font-bold">{counts.ALERTE}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-xs text-muted-foreground">Critiques</p><p className="text-xl font-display font-bold">{counts.CRITIQUE}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><BarChart3 className="h-5 w-5 text-muted-foreground" /></div>
            <div><p className="text-xs text-muted-foreground">Périmés</p><p className="text-xl font-display font-bold">{counts.PERIME}</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par DCI ou lot..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="OK">En stock</SelectItem>
                <SelectItem value="ALERTE">En alerte</SelectItem>
                <SelectItem value="CRITIQUE">Critique</SelectItem>
                <SelectItem value="PERIME">Périmé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('medicament')}>
                  <div className="flex items-center gap-1">Médicament <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Péremption</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('quantite')}>
                  <div className="flex items-center gap-1">Quantité <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead>Seuil</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('status')}>
                  <div className="flex items-center gap-1">État <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead>Entité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.map((stock: any) => {
                const status = getStatus(stock);
                const cfg = statusConfig[status];
                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{stock.medicament} {stock.dosage}</p>
                        <p className="text-xs text-muted-foreground">{stock.forme} — {stock.categorie}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{stock.lot}</TableCell>
                    <TableCell className="text-xs">{stock.peremption ? new Date(stock.peremption).toLocaleDateString('fr-FR') : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {status === 'CRITIQUE' && <TrendingDown className="h-3 w-3 text-destructive" />}
                        {status === 'OK' && <TrendingUp className="h-3 w-3 text-success" />}
                        <span className="font-semibold">{stock.quantite_actuelle?.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{stock.seuil_alerte}</TableCell>
                    <TableCell><Badge variant="outline" className={cfg.className}>{cfg.label}</Badge></TableCell>
                    <TableCell className="text-xs">{stock.entite_nom}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailDialog(stock.id)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAdjustDialog(stock.id)}><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredStocks.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucun stock trouvé</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Détail du stock</DialogTitle></DialogHeader>
          {detailStock && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">Médicament</p><p className="font-medium">{detailStock.medicament} {detailStock.dosage}</p></div>
              <div><p className="text-muted-foreground text-xs">Forme</p><p>{detailStock.forme}</p></div>
              <div><p className="text-muted-foreground text-xs">Lot</p><p className="font-mono">{detailStock.lot}</p></div>
              <div><p className="text-muted-foreground text-xs">Péremption</p><p>{detailStock.peremption ? new Date(detailStock.peremption).toLocaleDateString('fr-FR') : '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">Quantité actuelle</p><p className="text-lg font-bold">{detailStock.quantite_actuelle?.toLocaleString()}</p></div>
              <div><p className="text-muted-foreground text-xs">Seuil alerte / minimal</p><p>{detailStock.seuil_alerte} / {detailStock.seuil_minimal}</p></div>
              <div><p className="text-muted-foreground text-xs">Entité</p><p>{detailStock.entite_nom}</p></div>
              <div><p className="text-muted-foreground text-xs">Zone</p><p>{detailStock.zone_stockage || '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">État</p><Badge variant="outline" className={statusConfig[getStatus(detailStock)].className}>{statusConfig[getStatus(detailStock)].label}</Badge></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={!!adjustDialog} onOpenChange={() => setAdjustDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Ajuster le stock</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Quantité (+ ou -)</Label><Input type="number" placeholder="ex: -50 ou +100" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} /></div>
            <div className="space-y-2"><Label>Motif *</Label><Textarea placeholder="Raison de l'ajustement..." value={adjustMotif} onChange={(e) => setAdjustMotif(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(null)}>Annuler</Button>
            <Button onClick={handleAdjust} disabled={!adjustQty || !adjustMotif}>Confirmer l'ajustement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Movement Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-display">Nouveau mouvement de stock</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-info/10 border border-info/20 rounded-lg p-3 text-sm text-info">
              <p className="font-medium">💡 Astuce</p>
              <p className="text-xs mt-1">Pour créer un nouveau mouvement de stock, utilisez plutôt les pages de gestion par structure (Pharmacie, Hôpital, Centre de Santé) qui offrent une interface complète.</p>
            </div>
            <div className="space-y-2">
              <Label>Accès rapide</Label>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start" onClick={() => { setCreateDialog(false); window.location.href = '/gestion-pharmacie'; }}>
                  📦 Gestion Pharmacie
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => { setCreateDialog(false); window.location.href = '/gestion-hopital'; }}>
                  🏥 Gestion Hôpital
                </Button>
                <Button variant="outline" className="justify-start" onClick={() => { setCreateDialog(false); window.location.href = '/gestion-centre-sante'; }}>
                  ⚕️ Gestion Centre de Santé
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StocksPage;
