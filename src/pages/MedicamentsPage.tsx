import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Pill, Plus, Search, Filter, Eye, Edit, ArrowUpDown, Download } from 'lucide-react';

const CATEGORIES = ['ESSENTIEL', 'GENERIQUE', 'SPECIALITE', 'VACCIN', 'CONSOMMABLE'];
const FORMES = ['Comprimé', 'Gélule', 'Sirop', 'Injectable', 'Pommade', 'Suppositoire', 'Collyre', 'Perfusion', 'Poudre', 'Solution'];

interface MedForm {
  dci: string; nom_commercial: string; dosage: string; forme_pharmaceutique: string;
  conditionnement: string; classe_therapeutique: string; categorie: string;
  code_national: string; amm_code: string; prix_unitaire_pcg: string; prix_public_indicatif: string;
  necessite_chaine_froid: boolean; temperature_stockage_min: string; temperature_stockage_max: string;
}

const emptyForm: MedForm = {
  dci: '', nom_commercial: '', dosage: '', forme_pharmaceutique: '', conditionnement: '',
  classe_therapeutique: '', categorie: 'ESSENTIEL', code_national: '', amm_code: '',
  prix_unitaire_pcg: '', prix_public_indicatif: '', necessite_chaine_froid: false,
  temperature_stockage_min: '', temperature_stockage_max: '',
};

export default function MedicamentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MedForm>(emptyForm);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data: medicaments = [], isLoading } = useQuery({
    queryKey: ['medicaments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('medicaments').select('*').order('dci');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        dci: form.dci, nom_commercial: form.nom_commercial || null, dosage: form.dosage || null,
        forme_pharmaceutique: form.forme_pharmaceutique || null, conditionnement: form.conditionnement || null,
        classe_therapeutique: form.classe_therapeutique || null, categorie: form.categorie || null,
        code_national: form.code_national || null, amm_code: form.amm_code || null,
        prix_unitaire_pcg: form.prix_unitaire_pcg ? parseFloat(form.prix_unitaire_pcg) : null,
        prix_public_indicatif: form.prix_public_indicatif ? parseFloat(form.prix_public_indicatif) : null,
        necessite_chaine_froid: form.necessite_chaine_froid,
        temperature_stockage_min: form.temperature_stockage_min ? parseFloat(form.temperature_stockage_min) : null,
        temperature_stockage_max: form.temperature_stockage_max ? parseFloat(form.temperature_stockage_max) : null,
      };
      if (editId) {
        const { error } = await supabase.from('medicaments').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('medicaments').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicaments'] });
      setShowForm(false); setEditId(null); setForm(emptyForm);
      toast({ title: editId ? 'Médicament modifié' : 'Médicament ajouté' });
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('medicaments').update({ is_active: active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicaments'] });
      toast({ title: 'Statut mis à jour' });
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const openEdit = (med: any) => {
    setEditId(med.id);
    setForm({
      dci: med.dci || '', nom_commercial: med.nom_commercial || '', dosage: med.dosage || '',
      forme_pharmaceutique: med.forme_pharmaceutique || '', conditionnement: med.conditionnement || '',
      classe_therapeutique: med.classe_therapeutique || '', categorie: med.categorie || 'ESSENTIEL',
      code_national: med.code_national || '', amm_code: med.amm_code || '',
      prix_unitaire_pcg: med.prix_unitaire_pcg?.toString() || '', prix_public_indicatif: med.prix_public_indicatif?.toString() || '',
      necessite_chaine_froid: med.necessite_chaine_froid || false,
      temperature_stockage_min: med.temperature_stockage_min?.toString() || '', temperature_stockage_max: med.temperature_stockage_max?.toString() || '',
    });
    setShowForm(true);
  };

  const filtered = medicaments.filter((m: any) => {
    const matchSearch = `${m.dci} ${m.nom_commercial || ''} ${m.code_national || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || m.categorie === catFilter;
    return matchSearch && matchCat;
  });

  const detail = medicaments.find((m: any) => m.id === detailId);

  if (isLoading) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Médicaments</h1>
          <p className="text-sm text-muted-foreground mt-1">{medicaments.length} références enregistrées</p>
        </div>
        <Button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un médicament
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stat-card"><CardContent className="p-0">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-display font-bold mt-1">{medicaments.length}</p>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <p className="text-xs text-muted-foreground">Actifs</p>
          <p className="text-2xl font-display font-bold mt-1 text-success">{medicaments.filter((m: any) => m.is_active).length}</p>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <p className="text-xs text-muted-foreground">Chaîne du froid</p>
          <p className="text-2xl font-display font-bold mt-1 text-info">{medicaments.filter((m: any) => m.necessite_chaine_froid).length}</p>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <p className="text-xs text-muted-foreground">Catégories</p>
          <p className="text-2xl font-display font-bold mt-1">{new Set(medicaments.map((m: any) => m.categorie).filter(Boolean)).size}</p>
        </CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par DCI, nom commercial..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DCI</TableHead>
                <TableHead>Nom commercial</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Forme</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix PCG</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m: any) => (
                <TableRow key={m.id} className={!m.is_active ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{m.dci}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.nom_commercial || '—'}</TableCell>
                  <TableCell className="text-sm">{m.dosage || '—'}</TableCell>
                  <TableCell className="text-xs">{m.forme_pharmaceutique || '—'}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{m.categorie || '—'}</Badge></TableCell>
                  <TableCell className="text-sm font-mono">{m.prix_unitaire_pcg ? `${m.prix_unitaire_pcg.toLocaleString()} GNF` : '—'}</TableCell>
                  <TableCell>
                    <Switch checked={m.is_active} onCheckedChange={(v) => toggleActiveMutation.mutate({ id: m.id, active: v })} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailId(m.id)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucun médicament trouvé</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editId ? 'Modifier le médicament' : 'Ajouter un médicament'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>DCI *</Label><Input value={form.dci} onChange={e => setForm({...form, dci: e.target.value})} placeholder="Paracétamol" /></div>
              <div className="space-y-2"><Label>Nom commercial</Label><Input value={form.nom_commercial} onChange={e => setForm({...form, nom_commercial: e.target.value})} placeholder="Doliprane" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Dosage</Label><Input value={form.dosage} onChange={e => setForm({...form, dosage: e.target.value})} placeholder="500mg" /></div>
              <div className="space-y-2"><Label>Forme</Label>
                <Select value={form.forme_pharmaceutique} onValueChange={v => setForm({...form, forme_pharmaceutique: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{FORMES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Conditionnement</Label><Input value={form.conditionnement} onChange={e => setForm({...form, conditionnement: e.target.value})} placeholder="Boîte de 20" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Catégorie</Label>
                <Select value={form.categorie} onValueChange={v => setForm({...form, categorie: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Classe thérapeutique</Label><Input value={form.classe_therapeutique} onChange={e => setForm({...form, classe_therapeutique: e.target.value})} /></div>
              <div className="space-y-2"><Label>Code AMM</Label><Input value={form.amm_code} onChange={e => setForm({...form, amm_code: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Code national</Label><Input value={form.code_national} onChange={e => setForm({...form, code_national: e.target.value})} /></div>
              <div className="space-y-2"><Label>Prix PCG (GNF)</Label><Input type="number" value={form.prix_unitaire_pcg} onChange={e => setForm({...form, prix_unitaire_pcg: e.target.value})} /></div>
              <div className="space-y-2"><Label>Prix public (GNF)</Label><Input type="number" value={form.prix_public_indicatif} onChange={e => setForm({...form, prix_public_indicatif: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3 items-end">
              <div className="flex items-center gap-2"><Switch checked={form.necessite_chaine_froid} onCheckedChange={v => setForm({...form, necessite_chaine_froid: v})} /><Label>Chaîne du froid</Label></div>
              <div className="space-y-2"><Label>Temp. min (°C)</Label><Input type="number" value={form.temperature_stockage_min} onChange={e => setForm({...form, temperature_stockage_min: e.target.value})} /></div>
              <div className="space-y-2"><Label>Temp. max (°C)</Label><Input type="number" value={form.temperature_stockage_max} onChange={e => setForm({...form, temperature_stockage_max: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.dci || saveMutation.isPending}>
              {saveMutation.isPending ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Détail du médicament</DialogTitle></DialogHeader>
          {detail && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground text-xs">DCI</p><p className="font-medium">{detail.dci}</p></div>
              <div><p className="text-muted-foreground text-xs">Nom commercial</p><p>{detail.nom_commercial || '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">Dosage</p><p>{detail.dosage || '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">Forme</p><p>{detail.forme_pharmaceutique || '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">Catégorie</p><Badge variant="secondary">{detail.categorie || '—'}</Badge></div>
              <div><p className="text-muted-foreground text-xs">Classe</p><p>{detail.classe_therapeutique || '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">Code national</p><p className="font-mono">{detail.code_national || '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">AMM</p><p className="font-mono">{detail.amm_code || '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">Prix PCG</p><p className="font-mono">{detail.prix_unitaire_pcg ? `${detail.prix_unitaire_pcg.toLocaleString()} GNF` : '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">Prix public</p><p className="font-mono">{detail.prix_public_indicatif ? `${detail.prix_public_indicatif.toLocaleString()} GNF` : '—'}</p></div>
              <div><p className="text-muted-foreground text-xs">Chaîne du froid</p><p>{detail.necessite_chaine_froid ? '✅ Oui' : '❌ Non'}</p></div>
              <div><p className="text-muted-foreground text-xs">Actif</p><p>{detail.is_active ? '✅ Oui' : '❌ Non'}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
