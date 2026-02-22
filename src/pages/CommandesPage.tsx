import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUserLevel } from '@/hooks/useUserLevel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart, Plus, Search, Filter, Eye, CheckCircle, XCircle, Clock,
  ArrowRight, Send, Truck, Package, Building2
} from 'lucide-react';
import { useEffect } from 'react';

interface Medicament {
  id: string;
  dci: string;
  dosage: string | null;
  forme_pharmaceutique: string | null;
}

const STATUTS = {
  BROUILLON: { label: 'Brouillon', className: 'bg-muted text-muted-foreground border-border', icon: Clock },
  SOUMISE: { label: 'Soumise', className: 'bg-info/10 text-info border-info/20', icon: Send },
  VALIDEE_DPS: { label: 'Validée DPS', className: 'bg-primary/10 text-primary border-primary/20', icon: CheckCircle },
  VALIDEE_DRS: { label: 'Validée DRS', className: 'bg-primary/10 text-primary border-primary/20', icon: CheckCircle },
  APPROUVEE_PCG: { label: 'Approuvée PCG', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  EN_PREPARATION: { label: 'En préparation', className: 'bg-warning/10 text-warning border-warning/20', icon: Package },
  EXPEDIEE: { label: 'Expédiée', className: 'bg-info/10 text-info border-info/20', icon: Truck },
  LIVREE: { label: 'Livrée', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  ANNULEE: { label: 'Annulée', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
};

type StatutKey = keyof typeof STATUTS;

// Workflow: who can validate to which status
const WORKFLOW: Record<string, { from: StatutKey[]; to: StatutKey; roles: string[] }[]> = {
  soumettre: [{ from: ['BROUILLON'], to: 'SOUMISE', roles: ['*'] }],
  valider_dps: [{ from: ['SOUMISE'], to: 'VALIDEE_DPS', roles: ['ADMIN_DPS', 'DPS_DIR', 'DPS_ADJ', 'DPS_RESP_PHARMA'] }],
  valider_drs: [{ from: ['VALIDEE_DPS'], to: 'VALIDEE_DRS', roles: ['ADMIN_DRS', 'DRS_DIR', 'DRS_ADJ', 'DRS_RESP_PHARMA'] }],
  approuver_pcg: [{ from: ['VALIDEE_DRS', 'SOUMISE'], to: 'APPROUVEE_PCG', roles: ['SUPER_ADMIN', 'ADMIN_CENTRAL', 'PCG_DIR', 'PCG_ADJ', 'PCG_DIR_ACHATS'] }],
  preparer: [{ from: ['APPROUVEE_PCG'], to: 'EN_PREPARATION', roles: ['SUPER_ADMIN', 'ADMIN_CENTRAL', 'PCG_DIR_STOCK', 'PCG_DIR_DISTRIB'] }],
  expedier: [{ from: ['EN_PREPARATION'], to: 'EXPEDIEE', roles: ['SUPER_ADMIN', 'ADMIN_CENTRAL', 'PCG_DIR_DISTRIB', 'LIVREUR_PCG', 'LIVREUR_DRS'] }],
  livrer: [{ from: ['EXPEDIEE'], to: 'LIVREE', roles: ['*'] }],
  annuler: [{ from: ['BROUILLON', 'SOUMISE'], to: 'ANNULEE', roles: ['*'] }],
};

function getAvailableActions(statut: StatutKey, role?: string) {
  const actions: { action: string; label: string; to: StatutKey; variant: 'default' | 'destructive' | 'outline' }[] = [];
  for (const [action, rules] of Object.entries(WORKFLOW)) {
    for (const rule of rules) {
      if (rule.from.includes(statut) && (rule.roles.includes('*') || (role && rule.roles.includes(role)))) {
        const labels: Record<string, string> = {
          soumettre: 'Soumettre', valider_dps: 'Valider (DPS)', valider_drs: 'Valider (DRS)',
          approuver_pcg: 'Approuver (PCG)', preparer: 'Préparer', expedier: 'Expédier',
          livrer: 'Confirmer réception', annuler: 'Annuler',
        };
        actions.push({
          action, label: labels[action] || action, to: rule.to,
          variant: action === 'annuler' ? 'destructive' : 'default',
        });
      }
    }
  }
  return actions;
}

export default function CommandesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { level, entityId } = useUserLevel();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newPriorite, setNewPriorite] = useState('NORMALE');
  const [newDateLivraison, setNewDateLivraison] = useState('');
  const [lignes, setLignes] = useState<{ medicament_id: string; quantite: number }[]>([]);
  const [supplier, setSupplier] = useState<{ id: string; type: string; nom: string } | null>(null);

  // Fetch commandes
  const { data: commandes = [], isLoading } = useQuery({
    queryKey: ['commandes', level, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch medicaments with available stock for the current entity
  const { data: medicaments = [] } = useQuery({
    queryKey: ['medicaments-with-stock', entityId],
    queryFn: async () => {
      // Fetch medicaments
      const { data: meds, error: mErr } = await supabase
        .from('medicaments')
        .select('id, dci, dosage, forme_pharmaceutique')
        .eq('is_active', true);
      if (mErr) throw mErr;

      // Fetch current stock levels for this entity
      const { data: stockData } = await supabase
        .from('stocks')
        .select('lot_id, quantite_actuelle, lots(medicament_id)')
        .eq('entite_id', entityId);

      // Aggregate stock by medicament
      const stockMap: Record<string, number> = {};
      interface StockItem { lot_id: string; quantite_actuelle: number; lots: { medicament_id: string } | null };
      (stockData as unknown as StockItem[] || []).forEach((s) => {
        const mid = s.lots?.medicament_id;
        if (mid) stockMap[mid] = (stockMap[mid] || 0) + s.quantite_actuelle;
      });

      return (meds as any as Medicament[] || []).map(m => ({
        ...m,
        stock_actuel: stockMap[m.id] || 0
      }));
    },
  });

  // Fetch current user's region and potential suppliers
  const { data: procurementInfo } = useQuery({
    queryKey: ['procurement-info', entityId, level],
    queryFn: async () => {
      if (!entityId) return null;

      let region = '';
      let defaultSupplier = null;

      // 1. Identify region
      if (level === 'peripheral') {
        const { data: str } = await supabase.from('structures').select('nom, dps_id').eq('id', entityId).single();
        if (str?.dps_id) {
          const { data: dps } = await supabase.from('dps').select('prefecture, drs_id').eq('id', str.dps_id).single();
          if (dps?.drs_id) {
            const { data: drs } = await supabase.from('drs').select('region').eq('id', dps.drs_id).single();
            region = drs?.region || '';
          }
        }
      } else if (level === 'prefectoral') {
        const { data: dps } = await supabase.from('dps').select('prefecture, drs_id').eq('id', entityId).single();
        if (dps?.drs_id) {
          const { data: drs } = await supabase.from('drs').select('region').eq('id', dps.drs_id).single();
          region = drs?.region || '';
        }
      } else if (level === 'regional') {
        const { data: drs } = await supabase.from('drs').select('region').eq('id', entityId).single();
        region = drs?.region || '';
      }

      // 2. Identify PCG Agencies based on region
      const { data: pcgAgencies } = await supabase.from('drs').select('id, nom, region').ilike('nom', '%PCG%');
      const { data: pcgCentrale } = await supabase.from('drs').select('id, nom, region').ilike('nom', '%Siège%').maybeSingle();

      const normalizedRegion = region.trim().toLowerCase();

      if (normalizedRegion.includes('conakry')) {
        // Conakry picks PCG Centrale
        defaultSupplier = pcgCentrale || (pcgAgencies?.find(a => a.region.toLowerCase().includes('conakry'))) || null;
      } else if (normalizedRegion.includes('kankan')) {
        // Kankan picks PCG Kankan
        defaultSupplier = pcgAgencies?.find(a => a.nom.toLowerCase().includes('kankan')) || null;
      } else {
        // Default to regional agency if matches, otherwise central
        defaultSupplier = pcgAgencies?.find(a => a.region.toLowerCase() === normalizedRegion) || pcgCentrale || null;
      }

      return { region, defaultSupplier, allSuppliers: pcgAgencies || [] };
    },
    enabled: !!entityId,
  });

  // Set default supplier when info is loaded
  useEffect(() => {
    if (procurementInfo?.defaultSupplier && !supplier) {
      setSupplier({
        id: procurementInfo.defaultSupplier.id,
        type: 'DRS',
        nom: procurementInfo.defaultSupplier.nom
      });
    }
  }, [procurementInfo, supplier]);

  // Create commande mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const numero = `CMD-${Date.now().toString(36).toUpperCase()}`;
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      const { data: cmd, error } = await supabase.from('commandes').insert({
        numero_commande: numero,
        entite_demandeur_id: entityId || crypto.randomUUID(),
        entite_demandeur_type: level === 'national' ? 'PCG' : level === 'regional' ? 'DRS' : level === 'prefectoral' ? 'DPS' : 'STRUCTURE',
        entite_fournisseur_id: supplier?.id || null,
        entite_fournisseur_type: supplier?.type || 'DRS',
        commentaire: newComment || null,
        priorite: newPriorite,
        date_livraison_souhaitee: newDateLivraison || null,
        created_by: userId,
      }).select().single();
      if (error) throw error;

      // Insert lignes
      if (lignes.length > 0 && cmd) {
        const { error: lErr } = await supabase.from('lignes_commande').insert(
          lignes.map((l) => ({ commande_id: cmd.id, medicament_id: l.medicament_id, quantite_demandee: l.quantite }))
        );
        if (lErr) throw lErr;
      }
      return cmd;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      setShowCreate(false);
      setNewComment('');
      setLignes([]);
      toast({ title: 'Commande créée', description: 'La commande a été enregistrée avec succès.' });
    },
    onError: (e: Error) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: string }) => {
      const { data: session } = await supabase.auth.getSession();
      const updates: Record<string, unknown> = { statut };
      if (['VALIDEE_DPS', 'VALIDEE_DRS', 'APPROUVEE_PCG'].includes(statut)) {
        updates.validated_by = session.session?.user.id;
        updates.date_validation = new Date().toISOString();
      }
      const { error } = await supabase.from('commandes').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      toast({ title: 'Statut mis à jour' });
    },
    onError: (e: Error) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  // Fetch lignes for detail
  const { data: detailLignes = [] } = useQuery({
    queryKey: ['commande-lignes', selectedCommande],
    queryFn: async () => {
      if (!selectedCommande) return [];
      const { data, error } = await supabase
        .from('lignes_commande')
        .select('*, medicaments(dci, dosage, forme_pharmaceutique)')
        .eq('commande_id', selectedCommande);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCommande,
  });

  interface CommandeItem {
    id: string;
    numero_commande: string;
    statut: string;
    priorite: string;
    date_commande: string;
    date_livraison_souhaitee?: string;
    date_validation?: string;
    commentaire?: string;
  }

  const filtered = (commandes as unknown as CommandeItem[]).filter((c) => {
    const matchSearch = c.numero_commande.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const detail = (commandes as unknown as CommandeItem[]).find((c) => c.id === selectedCommande);
  const detailActions = detail ? getAvailableActions(detail.statut as StatutKey, user?.role) : [];

  const addLigne = () => {
    if (medicaments.length > 0) {
      setLignes([...lignes, { medicament_id: medicaments[0].id, quantite: 1 }]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const counts = {
    total: commandes.length,
    en_cours: commandes.filter((c: any) => !['LIVREE', 'ANNULEE'].includes(c.statut)).length,
    livrees: commandes.filter((c: any) => c.statut === 'LIVREE').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestion des Commandes</h1>
          <p className="text-sm text-muted-foreground mt-1">Workflow de validation multi-niveaux</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle commande
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="stat-card"><CardContent className="p-0">
          <p className="text-xs text-muted-foreground">Total commandes</p>
          <p className="text-2xl font-display font-bold mt-1">{counts.total}</p>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <p className="text-xs text-muted-foreground">En cours</p>
          <p className="text-2xl font-display font-bold mt-1 text-warning">{counts.en_cours}</p>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <p className="text-xs text-muted-foreground">Livrées</p>
          <p className="text-2xl font-display font-bold mt-1 text-success">{counts.livrees}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par N° commande..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(STATUTS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Commande</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Livraison souhaitée</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cmd) => {
                const cfg = STATUTS[cmd.statut as StatutKey] || STATUTS.BROUILLON;
                return (
                  <TableRow key={cmd.id}>
                    <TableCell className="font-mono text-sm font-medium">{cmd.numero_commande}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cmd.priorite === 'URGENTE' ? 'destructive' : 'secondary'} className="text-xs">
                        {cmd.priorite}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(cmd.date_commande).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {cmd.date_livraison_souhaitee ? new Date(cmd.date_livraison_souhaitee).toLocaleDateString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedCommande(cmd.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucune commande trouvée</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display">Nouvelle commande — {procurementInfo?.region ? `Région ${procurementInfo.region}` : ''}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-6 py-4">
                {/* Section Fournisseur - Plus visible */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50 shadow-sm">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Fournisseur sélectionné
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Select
                        value={supplier?.id}
                        onValueChange={(val) => {
                          const s = procurementInfo?.allSuppliers?.find(x => x.id === val);
                          if (s) setSupplier({ id: s.id, type: 'DRS', nom: s.nom });
                        }}
                      >
                        <SelectTrigger className="bg-background border-primary/20 hover:border-primary/50 transition-colors">
                          <SelectValue placeholder="Choisir un fournisseur" />
                        </SelectTrigger>
                        <SelectContent>
                          {procurementInfo?.allSuppliers?.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>
                          ))}
                          {!procurementInfo?.allSuppliers?.length && (
                            <SelectItem value="none" disabled>Aucun fournisseur disponible</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-full sm:w-48">
                      <Select value={newPriorite} onValueChange={setNewPriorite}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NORMALE">Normale</SelectItem>
                          <SelectItem value="URGENTE">Urgente</SelectItem>
                          <SelectItem value="CRITIQUE">Critique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Le fournisseur est déterminé automatiquement selon votre région (PCG-Siège pour Conakry, PCG-Kankan pour Kankan).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date livraison souhaitée</Label>
                <Input type="date" value={newDateLivraison} onChange={(e) => setNewDateLivraison(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Commentaire</Label>
              <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Notez ici toute instruction spécifique..." className="h-20" />
            </div>

            <div className="space-y-3 py-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Produits sélectionnés</Label>
                  <p className="text-[10px] text-muted-foreground">Votre stock actuel est affiché pour chaque produit</p>
                </div>
                <Button variant="outline" size="sm" onClick={addLigne} className="h-8"><Plus className="h-3 w-3 mr-1" />Ajouter un item</Button>
              </div>

              <div className="max-h-[250px] overflow-y-auto space-y-3 pr-1">
                {lignes.map((l, i) => {
                  const selectedMed = medicaments.find(m => m.id === l.medicament_id);
                  return (
                    <div key={i} className="flex gap-3 items-start bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      <div className="flex-1 space-y-2">
                        <Select value={l.medicament_id} onValueChange={(v) => { const n = [...lignes]; n[i].medicament_id = v; setLignes(n); }}>
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {medicaments.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                <div className="flex items-center justify-between w-full min-w-[300px]">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground/30" />
                                    <div className="text-left">
                                      <p className="text-sm font-medium leading-none">{m.dci}</p>
                                      <p className="text-[10px] text-muted-foreground mt-1">{m.dosage || ''} — {m.forme_pharmaceutique || ''}</p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className={cn(
                                    "text-[10px] ml-auto",
                                    m.stock_actuel === 0 ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  )}>
                                    Stock: {m.stock_actuel}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedMed && (
                          <div className="flex items-center gap-2 px-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Stock actuel: {selectedMed.stock_actuel} disp.</span>
                            {selectedMed.stock_actuel < 50 && <Badge variant="secondary" className="text-[8px] h-3 px-1 bg-amber-100 text-amber-700">Stock Faible</Badge>}
                          </div>
                        )}
                      </div>

                      <div className="w-24 space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Quantité</Label>
                        <Input
                          type="number"
                          className="h-10 font-bold"
                          min={1}
                          value={l.quantite}
                          onChange={(e) => { const n = [...lignes]; n[i].quantite = parseInt(e.target.value) || 1; setLignes(n); }}
                        />
                      </div>

                      <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive mt-6" onClick={() => setLignes(lignes.filter((_, j) => j !== i))}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || lignes.length === 0}>
              {createMutation.isPending ? 'Création...' : 'Créer la commande'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCommande} onOpenChange={() => setSelectedCommande(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display">Détail de la commande</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">N° Commande</p><p className="font-mono font-medium">{detail.numero_commande}</p></div>
                <div><p className="text-muted-foreground text-xs">Statut</p><Badge variant="outline" className={STATUTS[detail.statut as StatutKey]?.className}>{STATUTS[detail.statut as StatutKey]?.label}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Priorité</p><p>{detail.priorite}</p></div>
                <div><p className="text-muted-foreground text-xs">Date commande</p><p>{new Date(detail.date_commande).toLocaleDateString('fr-FR')}</p></div>
                <div><p className="text-muted-foreground text-xs">Livraison souhaitée</p><p>{detail.date_livraison_souhaitee ? new Date(detail.date_livraison_souhaitee).toLocaleDateString('fr-FR') : '—'}</p></div>
                {detail.date_validation && <div><p className="text-muted-foreground text-xs">Date validation</p><p>{new Date(detail.date_validation).toLocaleDateString('fr-FR')}</p></div>}
              </div>
              {detail.commentaire && <div className="text-sm"><p className="text-muted-foreground text-xs mb-1">Commentaire</p><p className="bg-muted p-3 rounded-lg">{detail.commentaire}</p></div>}

              {/* Lignes */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Lignes de commande</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Médicament</TableHead>
                      <TableHead>Qté demandée</TableHead>
                      <TableHead>Qté approuvée</TableHead>
                      <TableHead>Qté livrée</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailLignes.map((l: any) => (
                      <TableRow key={l.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-muted border flex items-center justify-center overflow-hidden shrink-0">
                              <Package className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                            <span className="text-sm font-medium">{l.medicaments?.dci} {l.medicaments?.dosage || ''}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{l.quantite_demandee}</TableCell>
                        <TableCell>{l.quantite_approuvee || '—'}</TableCell>
                        <TableCell>{l.quantite_livree || '—'}</TableCell>
                      </TableRow>
                    ))}
                    {detailLignes.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Aucune ligne</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Workflow actions */}
              {detailActions.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  {detailActions.map((a) => (
                    <Button
                      key={a.action}
                      variant={a.variant}
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ id: detail.id, statut: a.to })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" /> {a.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
