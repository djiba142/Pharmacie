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
  Package, Search, Filter, Download, Plus, AlertTriangle, ArrowUpDown, Eye, Edit, TrendingDown, TrendingUp, BarChart3, QrCode, FileSpreadsheet, Upload, Pill
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRScannerDialog } from '@/components/ui/QRScannerDialog';
import * as XLSX from 'xlsx';

type StockStatus = 'OK' | 'ALERTE' | 'CRITIQUE' | 'PERIME';

interface StockItem {
  id: string;
  lot_id: string;
  entite_id: string;
  entite_type: string;
  quantite_actuelle: number;
  seuil_alerte: number;
  seuil_minimal: number;
  zone_stockage?: string;
  lots?: {
    id: string;
    numero_lot: string;
    date_peremption: string;
    medicaments?: {
      id: string;
      dci: string;
      dosage?: string;
      forme_pharmaceutique?: string;
      categorie?: string;
      classe_therapeutique?: string;
    }
  };
  medicament?: string;
  dosage?: string;
  forme?: string;
  categorie?: string;
  lot?: string;
  peremption?: string;
  entite_nom?: string;
}

function getStatus(stock: StockItem): StockStatus {
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
  const [isScannerOpen, setIsScannerOpen] = useState(false);
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
      (data || []).forEach((d) => { map[d.id] = d.nom; });
      return map;
    },
  });

  const stocks = (rawStocks as StockItem[]).map((s) => ({
    ...s,
    medicament: s.lots?.medicaments?.dci || 'N/A',
    dosage: s.lots?.medicaments?.dosage || '',
    forme: s.lots?.medicaments?.forme_pharmaceutique || '',
    categorie: s.lots?.medicaments?.classe_therapeutique || s.lots?.medicaments?.categorie || '',
    lot: s.lots?.numero_lot || '',
    peremption: s.lots?.date_peremption || '',
    entite_nom: drsMap[s.entite_id] || s.entite_type || '',
  }));

  const categories = [...new Set(stocks.map((s) => s.categorie).filter(Boolean))];

  const filteredStocks = useMemo(() => {
    const result = (stocks as StockItem[]).filter((s) => {
      const matchSearch = s.medicament.toLowerCase().includes(search.toLowerCase()) ||
        s.lot.toLowerCase().includes(search.toLowerCase());
      const status = getStatus(s);
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      return matchSearch && matchStatus;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'medicament') cmp = (a.medicament || '').localeCompare(b.medicament || '');
      else if (sortBy === 'quantite') cmp = a.quantite_actuelle - b.quantite_actuelle;
      else if (sortBy === 'peremption') cmp = (a.peremption || '').localeCompare(b.peremption || '');
      else if (sortBy === 'status') cmp = getStatus(a).localeCompare(getStatus(b));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [stocks, search, statusFilter, sortBy, sortDir]);

  const counts = useMemo(() => {
    const c = { OK: 0, ALERTE: 0, CRITIQUE: 0, PERIME: 0 };
    (stocks as StockItem[]).forEach((s) => c[getStatus(s)]++);
    return c;
  }, [stocks]);

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };
  const handleAdjust = async () => {
    if (!adjustDialog || !adjustQty || !adjustMotif) return;

    try {
      const stock = (stocks as StockItem[]).find((s) => s.id === adjustDialog);
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

      const { error: updateError } = await supabase
        .from('stocks')
        .update({ quantite_actuelle: newQuantity })
        .eq('id', adjustDialog);

      if (updateError) throw updateError;

      await supabase.from('mouvements_stock').insert({
        stock_id: adjustDialog,
        type: adjustment > 0 ? 'ENTREE' : 'SORTIE',
        quantite: Math.abs(adjustment),
        commentaire: adjustMotif,
      });

      toast({
        title: 'Stock ajusté',
        description: `Quantité ${adjustment > 0 ? 'augmentée' : 'diminuée'} de ${Math.abs(adjustment)} unités`
      });

      await queryClient.invalidateQueries({ queryKey: ['stocks-page'] });
      setAdjustDialog(null);
      setAdjustQty('');
      setAdjustMotif('');
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleBulkImport = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        console.log("Importing rows:", rows.length);
        toast({ title: 'Importation...', description: `Traitement de ${rows.length} lignes en cours.` });

        let successCount = 0;
        let skipCount = 0;

        for (const row of rows) {
          try {
            // Find medicament by DCI (Désignation)
            const designation = row['Désignation'];
            const lotNum = row['Lot'];
            if (!designation || !lotNum) {
              skipCount++;
              continue;
            }

            const { data: med } = await supabase
              .from('medicaments')
              .select('id')
              .ilike('dci', designation)
              .maybeSingle();

            if (!med) {
              console.warn(`Médicament non trouvé: ${designation}`);
              skipCount++;
              continue;
            }

            // Find or create lot
            const { data: lot, error: lotErr } = await supabase
              .from('lots')
              .select('id')
              .eq('medicament_id', med.id)
              .eq('numero_lot', lotNum)
              .maybeSingle();

            let targetLotId = lot?.id;

            if (!targetLotId) {
              const qty = parseInt(row['Quantité'] || '0');
              const { data: newLot, error: insErr } = await supabase
                .from('lots')
                .insert({
                  medicament_id: med.id,
                  numero_lot: lotNum,
                  date_fabrication: new Date().toISOString(),
                  date_peremption: row['Péremption'] ? new Date(row['Péremption']).toISOString() : new Date(Date.now() + 31536000000 * 2).toISOString(), // +2 ans par défaut
                  quantite_initiale: qty,
                })
                .select()
                .single();

              if (insErr) throw insErr;
              if (!newLot) throw new Error('Échec de création du lot');
              targetLotId = newLot.id;
            }

            // Update or Insert stock
            const qty = parseInt(row['Quantité'] || '0');
            const { data: existingStock } = await supabase
              .from('stocks')
              .select('id, quantite_actuelle')
              .eq('lot_id', targetLotId)
              .eq('entite_id', entityId)
              .maybeSingle();

            if (existingStock) {
              await supabase.from('stocks').update({ quantite_actuelle: qty }).eq('id', existingStock.id);
            } else {
              await supabase.from('stocks').insert({
                lot_id: targetLotId,
                entite_id: entityId,
                entite_type: level === 'regional' ? 'DRS' : (level === 'prefectoral' ? 'DPS' : 'STRUCTURE'),
                quantite_actuelle: qty,
                seuil_alerte: parseInt(row['Seuil Alerte'] || '10'),
                seuil_minimal: 5,
              });
            }
            successCount++;
          } catch (rowErr) {
            console.error("Error processing row:", row, rowErr);
            skipCount++;
          }
        }

        toast({
          title: 'Importation terminée',
          description: `${successCount} produits mis à jour, ${skipCount} erreurs/sauts.`
        });
        queryClient.invalidateQueries({ queryKey: ['stocks-page'] });
      };
      reader.readAsBinaryString(file);
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Erreur import', description: error.message, variant: 'destructive' });
    }
  };

  const handleExcelExport = () => {
    try {
      const data = filteredStocks.map(s => ({
        'Désignation': s.medicament,
        'Dosage': s.dosage,
        'Forme': s.forme,
        'Lot': s.lot,
        'Péremption': s.peremption ? new Date(s.peremption).toLocaleDateString('fr-FR') : 'N/A',
        'Quantité': s.quantite_actuelle,
        'Seuil Alerte': s.seuil_alerte,
        'État': getStatus(s),
        'Entité': s.entite_nom,
        'Zone': s.zone_stockage || 'N/A'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Stocks');
      XLSX.writeFile(wb, `stocks-livramed-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast({ title: 'Excel exporté', description: 'Le fichier a été généré avec succès.' });
    } catch (err: unknown) {
      const error = err as Error;
      toast({ title: 'Erreur export', description: error.message, variant: 'destructive' });
    }
  };

  const detailStock = (stocks as StockItem[]).find((s) => s.id === detailDialog);

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
          <Button variant="outline" size="sm" onClick={handleExcelExport}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Exporter Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => document.getElementById('import-excel')?.click()}>
            <Upload className="h-4 w-4 mr-2" /> Importer Stock
          </Button>
          <input
            type="file"
            id="import-excel"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBulkImport(file);
            }}
          />
          <Button size="sm" onClick={() => setCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nouveau mouvement
          </Button>
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
                <TableHead>Image</TableHead>
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
              {(filteredStocks as StockItem[]).map((stock) => {
                const status = getStatus(stock);
                const cfg = statusConfig[status];
                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-lg bg-slate-50 border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        <Pill className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    </TableCell>
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
