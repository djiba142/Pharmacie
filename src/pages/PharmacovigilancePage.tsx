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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle, Plus, Search, Filter, Eye, FileWarning, Shield, Activity,
  ArrowRight, CheckCircle, XCircle, Clock,
} from 'lucide-react';

const STATUTS_EI = {
  NOUVELLE: { label: 'Nouvelle', className: 'bg-info/10 text-info border-info/20' },
  EN_EVALUATION: { label: 'En évaluation', className: 'bg-warning/10 text-warning border-warning/20' },
  CONFIRMEE: { label: 'Confirmée', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  CLASSEE: { label: 'Classée', className: 'bg-muted text-muted-foreground border-border' },
  ESCALADEE: { label: 'Escaladée', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const GRAVITES = {
  NON_GRAVE: { label: 'Non grave', className: 'bg-success/10 text-success border-success/20' },
  GRAVE: { label: 'Grave', className: 'bg-warning/10 text-warning border-warning/20' },
  DECES: { label: 'Décès', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  HOSPITALISATION: { label: 'Hospitalisation', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const NIVEAUX_RAPPEL = {
  CLASSE_I: { label: 'Classe I - Danger', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  CLASSE_II: { label: 'Classe II - Modéré', className: 'bg-warning/10 text-warning border-warning/20' },
  CLASSE_III: { label: 'Classe III - Faible', className: 'bg-info/10 text-info border-info/20' },
};

export default function PharmacovigilancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { level, entityId } = useUserLevel();
  const [search, setSearch] = useState('');
  const [showCreateEI, setShowCreateEI] = useState(false);
  const [showCreateRappel, setShowCreateRappel] = useState(false);
  const [selectedEI, setSelectedEI] = useState<string | null>(null);
  const [tab, setTab] = useState('declarations');

  interface DeclarationEI {
    id: string;
    numero: string;
    statut: string;
    gravite: string;
    patient_initiales?: string;
    patient_age?: number;
    patient_sexe: string;
    medicament_id?: string;
    lot_id?: string;
    description_ei: string;
    date_survenue?: string;
    actions_prises?: string;
    evolution?: string;
    commentaire_evaluateur?: string;
    medicaments?: {
      dci: string;
      dosage?: string;
    };
  }

  interface RappelLot {
    id: string;
    lot_id: string;
    motif: string;
    niveau: string;
    statut: string;
    instructions?: string;
    date_rappel: string;
    lots?: {
      numero_lot: string;
      medicaments?: {
        dci: string;
      };
    };
  }

  // EI form
  const [eiForm, setEiForm] = useState({
    patient_initiales: '', patient_age: '', patient_sexe: 'M',
    medicament_id: '', lot_id: '', description_ei: '', date_survenue: '',
    gravite: 'NON_GRAVE', actions_prises: '', evolution: '',
  });

  // Rappel form
  const [rappelForm, setRappelForm] = useState({ lot_id: '', motif: '', niveau: 'CLASSE_III', instructions: '' });

  // Fetch declarations
  const { data: declarations = [], isLoading: loadingEI } = useQuery({
    queryKey: ['declarations-ei'],
    queryFn: async () => {
      const { data, error } = await supabase.from('declarations_ei').select('*, medicaments(dci, dosage)').order('created_at', { ascending: false });
      if (error) throw error;
      return data as DeclarationEI[];
    },
  });

  // Fetch rappels
  const { data: rappels = [], isLoading: loadingRappels } = useQuery({
    queryKey: ['rappels-lots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rappels_lots').select('*, lots(numero_lot, medicaments(dci))').order('created_at', { ascending: false });
      if (error) throw error;
      return data as RappelLot[];
    },
  });

  // Fetch medicaments & lots
  const { data: medicaments = [] } = useQuery({
    queryKey: ['pharma-medicaments'],
    queryFn: async () => {
      const { data } = await supabase.from('medicaments').select('id, dci, dosage').eq('is_active', true);
      return data || [];
    },
  });

  const { data: lots = [] } = useQuery({
    queryKey: ['pharma-lots'],
    queryFn: async () => {
      const { data } = await supabase.from('lots').select('id, numero_lot, medicament_id, medicaments(dci)');
      return data || [];
    },
  });

  // Create EI
  const createEIMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase.from('declarations_ei').insert({
        numero: `EI-${Date.now().toString(36).toUpperCase()}`,
        patient_initiales: eiForm.patient_initiales || null,
        patient_age: eiForm.patient_age ? parseInt(eiForm.patient_age) : null,
        patient_sexe: eiForm.patient_sexe,
        medicament_id: eiForm.medicament_id || null,
        lot_id: eiForm.lot_id || null,
        description_ei: eiForm.description_ei,
        date_survenue: eiForm.date_survenue || null,
        gravite: eiForm.gravite,
        actions_prises: eiForm.actions_prises || null,
        evolution: eiForm.evolution || null,
        declarant_id: session.session?.user.id,
        entite_id: entityId || null,
        entite_type: level === 'national' ? 'PCG' : level === 'regional' ? 'DRS' : level === 'prefectoral' ? 'DPS' : 'STRUCTURE',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['declarations-ei'] });
      setShowCreateEI(false);
      setEiForm({ patient_initiales: '', patient_age: '', patient_sexe: 'M', medicament_id: '', lot_id: '', description_ei: '', date_survenue: '', gravite: 'NON_GRAVE', actions_prises: '', evolution: '' });
      toast({ title: 'Déclaration créée', description: 'L\'effet indésirable a été enregistré.' });
    },
    onError: (e: Error) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  // Create rappel
  const createRappelMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase.from('rappels_lots').insert({
        lot_id: rappelForm.lot_id,
        motif: rappelForm.motif,
        niveau: rappelForm.niveau,
        instructions: rappelForm.instructions || null,
        initie_par: session.session?.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rappels-lots'] });
      setShowCreateRappel(false);
      setRappelForm({ lot_id: '', motif: '', niveau: 'CLASSE_III', instructions: '' });
      toast({ title: 'Rappel initié', description: 'Le rappel de lot a été enregistré.' });
    },
    onError: (e: Error) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  // Update EI status
  const updateEIMutation = useMutation({
    mutationFn: async ({ id, statut, commentaire }: { id: string; statut: string; commentaire?: string }) => {
      const { data: session } = await supabase.auth.getSession();
      const updates: Partial<DeclarationEI> & { evaluated_by?: string } = { statut };
      if (commentaire) updates.commentaire_evaluateur = commentaire;
      if (['EN_EVALUATION', 'CONFIRMEE', 'ESCALADEE'].includes(statut)) updates.evaluated_by = session.session?.user.id;
      const { error } = await supabase.from('declarations_ei').update(updates as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['declarations-ei'] });
      toast({ title: 'Statut mis à jour' });
    },
    onError: (e: Error) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const filteredDeclarations = (declarations as DeclarationEI[]).filter((d) =>
    d.numero.toLowerCase().includes(search.toLowerCase()) || d.description_ei?.toLowerCase().includes(search.toLowerCase())
  );

  const detailEI = (declarations as DeclarationEI[]).find((d) => d.id === selectedEI);
  const isLoading = loadingEI || loadingRappels;

  const eiCounts = {
    total: (declarations as DeclarationEI[]).length,
    nouvelles: (declarations as DeclarationEI[]).filter((d) => d.statut === 'NOUVELLE').length,
    graves: (declarations as DeclarationEI[]).filter((d) => ['GRAVE', 'DECES', 'HOSPITALISATION'].includes(d.gravite)).length,
    rappels: (rappels as RappelLot[]).length,
  };

  if (isLoading) {
    return <div className="space-y-4 animate-fade-in"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 rounded-xl" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pharmacovigilance</h1>
          <p className="text-sm text-muted-foreground mt-1">Déclaration d'effets indésirables et rappels de lots</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateRappel(true)}>
            <FileWarning className="h-4 w-4 mr-2" /> Rappel de lot
          </Button>
          <Button onClick={() => setShowCreateEI(true)}>
            <Plus className="h-4 w-4 mr-2" /> Déclarer un EI
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Activity className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total EI</p><p className="text-xl font-display font-bold">{eiCounts.total}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center"><Clock className="h-5 w-5 text-info" /></div>
            <div><p className="text-xs text-muted-foreground">Nouvelles</p><p className="text-xl font-display font-bold text-info">{eiCounts.nouvelles}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-xs text-muted-foreground">Graves</p><p className="text-xl font-display font-bold text-destructive">{eiCounts.graves}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><FileWarning className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">Rappels lots</p><p className="text-xl font-display font-bold text-warning">{eiCounts.rappels}</p></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="declarations">Déclarations EI</TabsTrigger>
          <TabsTrigger value="rappels">Rappels de lots</TabsTrigger>
        </TabsList>

        <TabsContent value="declarations" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Déclaration</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Gravité</TableHead>
                    <TableHead>Médicament</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeclarations.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm font-medium">{d.numero}</TableCell>
                      <TableCell><Badge variant="outline" className={STATUTS_EI[d.statut as keyof typeof STATUTS_EI]?.className}>{STATUTS_EI[d.statut as keyof typeof STATUTS_EI]?.label}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={GRAVITES[d.gravite as keyof typeof GRAVITES]?.className}>{GRAVITES[d.gravite as keyof typeof GRAVITES]?.label}</Badge></TableCell>
                      <TableCell className="text-sm">{d.medicaments?.dci || '—'}</TableCell>
                      <TableCell className="text-sm">{d.patient_initiales || '—'} {d.patient_age ? `(${d.patient_age} ans)` : ''}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.date_survenue ? new Date(d.date_survenue).toLocaleDateString('fr-FR') : '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEI(d.id)}><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDeclarations.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucune déclaration</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rappels" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot</TableHead>
                    <TableHead>Médicament</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rappels as RappelLot[]).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.lots?.numero_lot}</TableCell>
                      <TableCell className="text-sm">{r.lots?.medicaments?.dci || '—'}</TableCell>
                      <TableCell><Badge variant="outline" className={NIVEAUX_RAPPEL[r.niveau as keyof typeof NIVEAUX_RAPPEL]?.className}>{NIVEAUX_RAPPEL[r.niveau as keyof typeof NIVEAUX_RAPPEL]?.label}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{r.statut}</Badge></TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{r.motif}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(r.date_rappel).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))}
                  {rappels.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucun rappel</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create EI Dialog */}
      <Dialog open={showCreateEI} onOpenChange={setShowCreateEI}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Déclarer un effet indésirable</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Initiales patient</Label><Input placeholder="A.B." value={eiForm.patient_initiales} onChange={(e) => setEiForm({ ...eiForm, patient_initiales: e.target.value })} /></div>
              <div className="space-y-2"><Label>Âge</Label><Input type="number" value={eiForm.patient_age} onChange={(e) => setEiForm({ ...eiForm, patient_age: e.target.value })} /></div>
              <div className="space-y-2"><Label>Sexe</Label>
                <Select value={eiForm.patient_sexe} onValueChange={(v) => setEiForm({ ...eiForm, patient_sexe: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Médicament suspect</Label>
                <Select value={eiForm.medicament_id} onValueChange={(v) => setEiForm({ ...eiForm, medicament_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{medicaments.map((m) => <SelectItem key={m.id} value={m.id}>{m.dci} {m.dosage || ''}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Lot concerné</Label>
                <Select value={eiForm.lot_id} onValueChange={(v) => setEiForm({ ...eiForm, lot_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{lots.filter((l: any) => !eiForm.medicament_id || l.medicament_id === eiForm.medicament_id).map((l: any) => <SelectItem key={l.id} value={l.id}>{l.numero_lot}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Gravité *</Label>
                <Select value={eiForm.gravite} onValueChange={(v) => setEiForm({ ...eiForm, gravite: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(GRAVITES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Date de survenue</Label><Input type="date" value={eiForm.date_survenue} onChange={(e) => setEiForm({ ...eiForm, date_survenue: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description de l'effet indésirable *</Label><Textarea rows={3} value={eiForm.description_ei} onChange={(e) => setEiForm({ ...eiForm, description_ei: e.target.value })} placeholder="Décrivez l'effet indésirable observé..." /></div>
            <div className="space-y-2"><Label>Actions prises</Label><Textarea rows={2} value={eiForm.actions_prises} onChange={(e) => setEiForm({ ...eiForm, actions_prises: e.target.value })} placeholder="Arrêt du traitement, traitement correcteur..." /></div>
            <div className="space-y-2"><Label>Évolution</Label><Input value={eiForm.evolution} onChange={(e) => setEiForm({ ...eiForm, evolution: e.target.value })} placeholder="Guérison, amélioration..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateEI(false)}>Annuler</Button>
            <Button onClick={() => createEIMutation.mutate()} disabled={createEIMutation.isPending || !eiForm.description_ei}>
              {createEIMutation.isPending ? 'Envoi...' : 'Soumettre la déclaration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Rappel Dialog */}
      <Dialog open={showCreateRappel} onOpenChange={setShowCreateRappel}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Initier un rappel de lot</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Lot à rappeler *</Label>
              <Select value={rappelForm.lot_id} onValueChange={(v) => setRappelForm({ ...rappelForm, lot_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un lot" /></SelectTrigger>
                <SelectContent>{lots.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.numero_lot} — {l.medicaments?.dci || ''}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Niveau de rappel *</Label>
              <Select value={rappelForm.niveau} onValueChange={(v) => setRappelForm({ ...rappelForm, niveau: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(NIVEAUX_RAPPEL).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Motif *</Label><Textarea value={rappelForm.motif} onChange={(e) => setRappelForm({ ...rappelForm, motif: e.target.value })} placeholder="Motif du rappel..." /></div>
            <div className="space-y-2"><Label>Instructions</Label><Textarea value={rappelForm.instructions} onChange={(e) => setRappelForm({ ...rappelForm, instructions: e.target.value })} placeholder="Instructions pour les structures..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRappel(false)}>Annuler</Button>
            <Button onClick={() => createRappelMutation.mutate()} disabled={createRappelMutation.isPending || !rappelForm.lot_id || !rappelForm.motif}>
              {createRappelMutation.isPending ? 'Envoi...' : 'Initier le rappel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail EI Dialog */}
      <Dialog open={!!selectedEI} onOpenChange={() => setSelectedEI(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Détail de la déclaration</DialogTitle></DialogHeader>
          {detailEI && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">N° Déclaration</p><p className="font-mono font-medium">{detailEI.numero}</p></div>
                <div><p className="text-muted-foreground text-xs">Statut</p><Badge variant="outline" className={STATUTS_EI[detailEI.statut as keyof typeof STATUTS_EI]?.className}>{STATUTS_EI[detailEI.statut as keyof typeof STATUTS_EI]?.label}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Gravité</p><Badge variant="outline" className={GRAVITES[detailEI.gravite as keyof typeof GRAVITES]?.className}>{GRAVITES[detailEI.gravite as keyof typeof GRAVITES]?.label}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Patient</p><p>{detailEI.patient_initiales || '—'} {detailEI.patient_age ? `(${detailEI.patient_age} ans, ${detailEI.patient_sexe})` : ''}</p></div>
                <div><p className="text-muted-foreground text-xs">Médicament</p><p>{detailEI.medicaments?.dci || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Date survenue</p><p>{detailEI.date_survenue ? new Date(detailEI.date_survenue).toLocaleDateString('fr-FR') : '—'}</p></div>
              </div>
              <div><p className="text-muted-foreground text-xs mb-1">Description</p><p className="text-sm bg-muted p-3 rounded-lg">{detailEI.description_ei}</p></div>
              {detailEI.actions_prises && <div><p className="text-muted-foreground text-xs mb-1">Actions prises</p><p className="text-sm">{detailEI.actions_prises}</p></div>}
              {detailEI.commentaire_evaluateur && <div><p className="text-muted-foreground text-xs mb-1">Commentaire évaluateur</p><p className="text-sm bg-muted p-3 rounded-lg">{detailEI.commentaire_evaluateur}</p></div>}

              {/* Workflow actions */}
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {detailEI.statut === 'NOUVELLE' && (
                  <Button size="sm" onClick={() => updateEIMutation.mutate({ id: detailEI.id, statut: 'EN_EVALUATION' })}>
                    <ArrowRight className="h-3 w-3 mr-1" /> Prendre en charge
                  </Button>
                )}
                {detailEI.statut === 'EN_EVALUATION' && (
                  <>
                    <Button size="sm" onClick={() => updateEIMutation.mutate({ id: detailEI.id, statut: 'CONFIRMEE' })}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Confirmer
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateEIMutation.mutate({ id: detailEI.id, statut: 'ESCALADEE' })}>
                      <AlertTriangle className="h-3 w-3 mr-1" /> Escalader
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateEIMutation.mutate({ id: detailEI.id, statut: 'CLASSEE' })}>
                      <XCircle className="h-3 w-3 mr-1" /> Classer
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
