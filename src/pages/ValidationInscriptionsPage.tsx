import { useState, useEffect } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Search, Eye, CheckCircle, XCircle, Clock, FileText, Users, ArrowRight, Shield,
} from 'lucide-react';

const STATUTS = {
  SOUMISE: { label: 'Soumise', className: 'bg-info/10 text-info border-info/20', icon: Clock },
  VALIDEE_DPS: { label: 'Validée DPS', className: 'bg-primary/10 text-primary border-primary/20', icon: CheckCircle },
  VALIDEE_DRS: { label: 'Validée DRS', className: 'bg-primary/10 text-primary border-primary/20', icon: CheckCircle },
  VALIDEE_PCG: { label: 'Validée PCG', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  REJETEE: { label: 'Rejetée', className: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
};

type StatutKey = keyof typeof STATUTS;

export default function ValidationInscriptionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { level } = useUserLevel();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const { data: demandes = [], isLoading } = useQuery({
    queryKey: ['validation-inscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demandes_inscription')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('demandes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes_inscription' }, () => {
        queryClient.invalidateQueries({ queryKey: ['validation-inscriptions'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const validateMutation = useMutation({
    mutationFn: async ({ id, nextStatut, field }: { id: string; nextStatut: string; field: string }) => {
      const { data: session } = await supabase.auth.getSession();
      const updates: any = { statut: nextStatut, [field]: session.session?.user.id, [`date_${field.replace('validated_by_', 'validation_')}`]: new Date().toISOString() };
      const { error } = await supabase.from('demandes_inscription').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-inscriptions'] });
      toast({ title: 'Demande validée' });
      setSelectedId(null);
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, motif }: { id: string; motif: string }) => {
      const { error } = await supabase.from('demandes_inscription').update({ statut: 'REJETEE', motif_rejet: motif }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['validation-inscriptions'] });
      toast({ title: 'Demande rejetée' });
      setShowReject(false); setRejectId(null); setRejectMotif('');
    },
    onError: (e: any) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const getActions = (statut: StatutKey) => {
    const actions: { label: string; nextStatut: string; field: string; allowedLevels: string[] }[] = [];
    if (statut === 'SOUMISE') actions.push({ label: 'Valider (DPS)', nextStatut: 'VALIDEE_DPS', field: 'validated_by_dps', allowedLevels: ['prefectoral', 'national'] });
    if (statut === 'VALIDEE_DPS') actions.push({ label: 'Valider (DRS)', nextStatut: 'VALIDEE_DRS', field: 'validated_by_drs', allowedLevels: ['regional', 'national'] });
    if (statut === 'VALIDEE_DRS') actions.push({ label: 'Valider (PCG)', nextStatut: 'VALIDEE_PCG', field: 'validated_by_pcg', allowedLevels: ['national'] });
    return actions.filter(a => a.allowedLevels.includes(level));
  };

  const detail = demandes.find((d: any) => d.id === selectedId);
  const filtered = demandes.filter((d: any) => {
    const matchSearch = d.numero_suivi.toLowerCase().includes(search.toLowerCase()) || d.nom_structure.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: demandes.length,
    en_attente: demandes.filter((d: any) => !['VALIDEE_PCG', 'REJETEE'].includes(d.statut)).length,
    validees: demandes.filter((d: any) => d.statut === 'VALIDEE_PCG').length,
    rejetees: demandes.filter((d: any) => d.statut === 'REJETEE').length,
  };

  if (isLoading) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Validation des inscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">Workflow DPS → DRS → PCG</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-display font-bold">{counts.total}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><Clock className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">En attente</p><p className="text-xl font-display font-bold text-warning">{counts.en_attente}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Validées</p><p className="text-xl font-display font-bold text-success">{counts.validees}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><XCircle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-xs text-muted-foreground">Rejetées</p><p className="text-xl font-display font-bold text-destructive">{counts.rejetees}</p></div>
          </div>
        </CardContent></Card>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par N° suivi ou nom..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>N° Suivi</TableHead><TableHead>Structure</TableHead><TableHead>Type</TableHead>
            <TableHead>Région</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered.map((d: any) => {
              const cfg = STATUTS[d.statut as StatutKey] || STATUTS.SOUMISE;
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-sm font-medium">{d.numero_suivi}</TableCell>
                  <TableCell className="font-medium text-sm">{d.nom_structure}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{d.type_structure}</Badge></TableCell>
                  <TableCell className="text-sm">{d.region}</TableCell>
                  <TableCell><Badge variant="outline" className={cfg.className}>{cfg.label}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedId(d.id)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucune demande</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Détail de la demande</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">N° Suivi</p><p className="font-mono font-medium">{detail.numero_suivi}</p></div>
                <div><p className="text-muted-foreground text-xs">Statut</p><Badge variant="outline" className={STATUTS[detail.statut as StatutKey]?.className}>{STATUTS[detail.statut as StatutKey]?.label}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Type</p><p>{detail.type_structure}</p></div>
                <div><p className="text-muted-foreground text-xs">Structure</p><p className="font-medium">{detail.nom_structure}</p></div>
                <div><p className="text-muted-foreground text-xs">Région</p><p>{detail.region}</p></div>
                <div><p className="text-muted-foreground text-xs">Préfecture</p><p>{detail.prefecture}</p></div>
                <div><p className="text-muted-foreground text-xs">Responsable</p><p>{detail.responsable_prenom} {detail.responsable_nom}</p></div>
                <div><p className="text-muted-foreground text-xs">Tél. responsable</p><p>{detail.responsable_telephone || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">N° Ordre</p><p>{detail.responsable_num_ordre || '—'}</p></div>
              </div>

              {/* Workflow timeline */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold mb-3">Parcours de validation</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className={`px-3 py-1.5 rounded ${detail.date_validation_dps ? 'bg-success/10 text-success' : detail.statut === 'SOUMISE' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                    DPS {detail.date_validation_dps ? '✓' : '⏳'}
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className={`px-3 py-1.5 rounded ${detail.date_validation_drs ? 'bg-success/10 text-success' : detail.statut === 'VALIDEE_DPS' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                    DRS {detail.date_validation_drs ? '✓' : '⏳'}
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className={`px-3 py-1.5 rounded ${detail.date_validation_pcg ? 'bg-success/10 text-success' : detail.statut === 'VALIDEE_DRS' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                    PCG {detail.date_validation_pcg ? '✓' : '⏳'}
                  </div>
                </div>
              </div>

              {/* Documents */}
              {detail.documents && (detail.documents as any[]).length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold mb-2">Documents ({(detail.documents as any[]).length})</p>
                  <div className="space-y-1">
                    {(detail.documents as any[]).map((doc: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded">
                        <FileText className="h-3 w-3" />
                        <span>{doc.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail.motif_rejet && (
                <div className="bg-destructive/10 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-destructive text-xs">Motif de rejet :</p>
                  <p className="text-sm mt-1">{detail.motif_rejet}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t pt-4">
                {getActions(detail.statut as StatutKey).map(action => (
                  <Button key={action.label} size="sm" onClick={() => validateMutation.mutate({ id: detail.id, nextStatut: action.nextStatut, field: action.field })} disabled={validateMutation.isPending}>
                    <CheckCircle className="h-3 w-3 mr-1" /> {action.label}
                  </Button>
                ))}
                {!['VALIDEE_PCG', 'REJETEE'].includes(detail.statut) && (
                  <Button variant="destructive" size="sm" onClick={() => { setRejectId(detail.id); setShowReject(true); }}>
                    <XCircle className="h-3 w-3 mr-1" /> Rejeter
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Rejeter la demande</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Motif de rejet *</Label><Textarea value={rejectMotif} onChange={e => setRejectMotif(e.target.value)} placeholder="Indiquez le motif du rejet..." /></div>
            <p className="text-xs text-muted-foreground">Le demandeur dispose d'un recours de 15 jours.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>Annuler</Button>
            <Button variant="destructive" onClick={() => rejectId && rejectMutation.mutate({ id: rejectId, motif: rejectMotif })} disabled={!rejectMotif || rejectMutation.isPending}>
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
