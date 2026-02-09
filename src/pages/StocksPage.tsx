import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Package, Search, Filter, Download, Plus, AlertTriangle, ArrowUpDown, Eye, Edit, TrendingDown, TrendingUp, BarChart3,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Demo data
const DEMO_STOCKS = [
  { id: '1', medicament: 'Paracétamol 500mg', dci: 'Paracétamol', forme: 'Comprimé', lot: 'LOT-2025-001', peremption: '2027-03-15', quantite: 2500, seuil_alerte: 500, seuil_minimal: 100, entite: 'PCG', zone: 'A1', derniere_entree: '2026-01-15', categorie: 'Antalgique' },
  { id: '2', medicament: 'Amoxicilline 500mg', dci: 'Amoxicilline', forme: 'Gélule', lot: 'LOT-2025-002', peremption: '2026-08-20', quantite: 80, seuil_alerte: 200, seuil_minimal: 50, entite: 'DRS Conakry', zone: 'B2', derniere_entree: '2025-12-10', categorie: 'Antibiotique' },
  { id: '3', medicament: 'Artéméther + Luméfantrine 20/120mg', dci: 'Artéméther', forme: 'Comprimé', lot: 'LOT-2025-003', peremption: '2026-04-10', quantite: 30, seuil_alerte: 100, seuil_minimal: 20, entite: 'Hôpital Donka', zone: 'C1', derniere_entree: '2025-11-20', categorie: 'Antipaludéen' },
  { id: '4', medicament: 'Ibuprofène 400mg', dci: 'Ibuprofène', forme: 'Comprimé', lot: 'LOT-2025-004', peremption: '2027-12-01', quantite: 5000, seuil_alerte: 800, seuil_minimal: 200, entite: 'PCG', zone: 'A2', derniere_entree: '2026-02-01', categorie: 'Antalgique' },
  { id: '5', medicament: 'Ciprofloxacine 500mg', dci: 'Ciprofloxacine', forme: 'Comprimé', lot: 'LOT-2025-005', peremption: '2026-06-15', quantite: 150, seuil_alerte: 300, seuil_minimal: 80, entite: 'DRS Kindia', zone: 'B1', derniere_entree: '2025-10-05', categorie: 'Antibiotique' },
  { id: '6', medicament: 'Métronidazole 500mg', dci: 'Métronidazole', forme: 'Comprimé', lot: 'LOT-2025-006', peremption: '2026-03-01', quantite: 8, seuil_alerte: 50, seuil_minimal: 10, entite: 'CS Ratoma', zone: 'D1', derniere_entree: '2025-09-20', categorie: 'Antibiotique' },
  { id: '7', medicament: 'SRO - Sels de Réhydratation', dci: 'SRO', forme: 'Sachet', lot: 'LOT-2025-007', peremption: '2028-01-01', quantite: 8000, seuil_alerte: 1000, seuil_minimal: 300, entite: 'PCG', zone: 'A3', derniere_entree: '2026-02-05', categorie: 'Réhydratation' },
  { id: '8', medicament: 'Quinine 300mg', dci: 'Quinine', forme: 'Comprimé', lot: 'LOT-2025-008', peremption: '2026-05-20', quantite: 45, seuil_alerte: 100, seuil_minimal: 25, entite: 'DPS Dubréka', zone: 'C2', derniere_entree: '2025-08-15', categorie: 'Antipaludéen' },
  { id: '9', medicament: 'Fer + Acide folique', dci: 'Fer/Folate', forme: 'Comprimé', lot: 'LOT-2025-009', peremption: '2027-06-30', quantite: 3200, seuil_alerte: 500, seuil_minimal: 150, entite: 'DRS Boké', zone: 'B3', derniere_entree: '2026-01-20', categorie: 'Supplément' },
  { id: '10', medicament: 'Vitamine A 200 000 UI', dci: 'Vitamine A', forme: 'Capsule', lot: 'LOT-2025-010', peremption: '2026-02-28', quantite: 5, seuil_alerte: 100, seuil_minimal: 20, entite: 'CS Matam', zone: 'D2', derniere_entree: '2025-07-10', categorie: 'Supplément' },
];

type StockStatus = 'OK' | 'ALERTE' | 'CRITIQUE' | 'PERIME';

function getStatus(stock: typeof DEMO_STOCKS[0]): StockStatus {
  const now = new Date();
  const peremption = new Date(stock.peremption);
  if (peremption < now) return 'PERIME';
  if (stock.quantite <= stock.seuil_minimal) return 'CRITIQUE';
  if (stock.quantite <= stock.seuil_alerte) return 'ALERTE';
  return 'OK';
}

const statusConfig: Record<StockStatus, { label: string; className: string }> = {
  OK: { label: 'En stock', className: 'bg-success/10 text-success border-success/20' },
  ALERTE: { label: 'Alerte', className: 'bg-warning/10 text-warning border-warning/20' },
  CRITIQUE: { label: 'Critique', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  PERIME: { label: 'Périmé', className: 'bg-muted text-muted-foreground border-border' },
};

const StocksPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categorieFilter, setCategorieFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('medicament');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [adjustDialog, setAdjustDialog] = useState<string | null>(null);
  const [detailDialog, setDetailDialog] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustMotif, setAdjustMotif] = useState('');
  const { toast } = useToast();

  const categories = [...new Set(DEMO_STOCKS.map(s => s.categorie))];

  const filteredStocks = useMemo(() => {
    let result = DEMO_STOCKS.filter(s => {
      const matchSearch = s.medicament.toLowerCase().includes(search.toLowerCase()) || s.dci.toLowerCase().includes(search.toLowerCase()) || s.lot.toLowerCase().includes(search.toLowerCase());
      const status = getStatus(s);
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      const matchCat = categorieFilter === 'all' || s.categorie === categorieFilter;
      return matchSearch && matchStatus && matchCat;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'medicament') cmp = a.medicament.localeCompare(b.medicament);
      else if (sortBy === 'quantite') cmp = a.quantite - b.quantite;
      else if (sortBy === 'peremption') cmp = a.peremption.localeCompare(b.peremption);
      else if (sortBy === 'status') cmp = getStatus(a).localeCompare(getStatus(b));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [search, statusFilter, categorieFilter, sortBy, sortDir]);

  const counts = useMemo(() => {
    const c = { OK: 0, ALERTE: 0, CRITIQUE: 0, PERIME: 0 };
    DEMO_STOCKS.forEach(s => c[getStatus(s)]++);
    return c;
  }, []);

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const handleAdjust = () => {
    toast({ title: 'Stock ajusté', description: `Quantité modifiée de ${adjustQty} unités. Motif: ${adjustMotif}` });
    setAdjustDialog(null);
    setAdjustQty('');
    setAdjustMotif('');
  };

  const detailStock = DEMO_STOCKS.find(s => s.id === detailDialog);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestion des Stocks</h1>
          <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble des stocks pharmaceutiques</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Exporter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" /> Nouveau mouvement
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En stock</p>
                <p className="text-xl font-display font-bold">{counts.OK}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">En alerte</p>
                <p className="text-xl font-display font-bold">{counts.ALERTE}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Critiques</p>
                <p className="text-xl font-display font-bold">{counts.CRITIQUE}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Périmés</p>
                <p className="text-xl font-display font-bold">{counts.PERIME}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par DCI, nom ou lot..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="OK">En stock</SelectItem>
                <SelectItem value="ALERTE">En alerte</SelectItem>
                <SelectItem value="CRITIQUE">Critique</SelectItem>
                <SelectItem value="PERIME">Périmé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categorieFilter} onValueChange={setCategorieFilter}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
              {filteredStocks.map(stock => {
                const status = getStatus(stock);
                const cfg = statusConfig[status];
                return (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{stock.medicament}</p>
                        <p className="text-xs text-muted-foreground">{stock.forme} — {stock.categorie}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{stock.lot}</TableCell>
                    <TableCell className="text-xs">{new Date(stock.peremption).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {status === 'CRITIQUE' && <TrendingDown className="h-3 w-3 text-destructive" />}
                        {status === 'OK' && <TrendingUp className="h-3 w-3 text-success" />}
                        <span className="font-semibold">{stock.quantite.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{stock.seuil_alerte}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{stock.entite}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailDialog(stock.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAdjustDialog(stock.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredStocks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    Aucun stock trouvé pour ces critères
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Détail du stock</DialogTitle>
          </DialogHeader>
          {detailStock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">Médicament</p><p className="font-medium">{detailStock.medicament}</p></div>
                <div><p className="text-muted-foreground text-xs">DCI</p><p className="font-medium">{detailStock.dci}</p></div>
                <div><p className="text-muted-foreground text-xs">Forme</p><p>{detailStock.forme}</p></div>
                <div><p className="text-muted-foreground text-xs">Catégorie</p><p>{detailStock.categorie}</p></div>
                <div><p className="text-muted-foreground text-xs">Lot</p><p className="font-mono">{detailStock.lot}</p></div>
                <div><p className="text-muted-foreground text-xs">Péremption</p><p>{new Date(detailStock.peremption).toLocaleDateString('fr-FR')}</p></div>
                <div><p className="text-muted-foreground text-xs">Quantité actuelle</p><p className="text-lg font-bold">{detailStock.quantite.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-xs">Seuil alerte / minimal</p><p>{detailStock.seuil_alerte} / {detailStock.seuil_minimal}</p></div>
                <div><p className="text-muted-foreground text-xs">Entité</p><p>{detailStock.entite}</p></div>
                <div><p className="text-muted-foreground text-xs">Zone</p><p>{detailStock.zone}</p></div>
                <div><p className="text-muted-foreground text-xs">Dernière entrée</p><p>{new Date(detailStock.derniere_entree).toLocaleDateString('fr-FR')}</p></div>
                <div><p className="text-muted-foreground text-xs">État</p><Badge variant="outline" className={statusConfig[getStatus(detailStock)].className}>{statusConfig[getStatus(detailStock)].label}</Badge></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={!!adjustDialog} onOpenChange={() => setAdjustDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Ajuster le stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Quantité (+ ou -)</Label>
              <Input type="number" placeholder="ex: -50 ou +100" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Motif *</Label>
              <Select value={adjustMotif} onValueChange={setAdjustMotif}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un motif" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventaire">Inventaire</SelectItem>
                  <SelectItem value="erreur_saisie">Erreur de saisie</SelectItem>
                  <SelectItem value="casse">Casse</SelectItem>
                  <SelectItem value="peremption">Péremption</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(null)}>Annuler</Button>
            <Button onClick={handleAdjust} disabled={!adjustQty || !adjustMotif}>Valider l'ajustement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StocksPage;
