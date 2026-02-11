import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  ArrowRight, Send, Truck, Package,
} from 'lucide-react';

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

  // Fetch medicaments for create form
  const { data: medicaments = [] } = useQuery({
    queryKey: ['medicaments-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('medicaments').select('id, dci, dosage, forme_pharmaceutique').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

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
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: string }) => {
      const { data: session } = await supabase.auth.getSession();
      const updates: any = { statut };
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
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
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

  const filtered = commandes.filter((c: any) => {
    const matchSearch = c.numero_commande.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const detail = commandes.find((c: any) => c.id === selectedCommande);
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
              {filtered.map((cmd: any) => {
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Nouvelle commande</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select value={newPriorite} onValueChange={setNewPriorite}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMALE">Normale</SelectItem>
                    <SelectItem value="URGENTE">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date livraison souhaitée</Label>
                <Input type="date" value={newDateLivraison} onChange={(e) => setNewDateLivraison(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Commentaire</Label>
              <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Instructions spéciales..." />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lignes de commande</Label>
                <Button variant="outline" size="sm" onClick={addLigne}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
              </div>
              {lignes.map((l, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select value={l.medicament_id} onValueChange={(v) => { const n = [...lignes]; n[i].medicament_id = v; setLignes(n); }}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {medicaments.map((m: any) => (
                          <SelectItem key={m.id} value={m.id}>{m.dci} {m.dosage || ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input type="number" className="w-24" min={1} value={l.quantite} onChange={(e) => { const n = [...lignes]; n[i].quantite = parseInt(e.target.value) || 1; setLignes(n); }} />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => setLignes(lignes.filter((_, j) => j !== i))}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
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
                        <TableCell className="text-sm">{l.medicaments?.dci} {l.medicaments?.dosage || ''}</TableCell>
                        <TableCell className="font-semibold">{l.quantite_demandee}</TableCell>
                        <TableCell>{l.quantite_approuvee}</TableCell>
                        <TableCell>{l.quantite_livree}</TableCell>
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
