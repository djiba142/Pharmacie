import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Settings, Building2, MapPin, Plus, Edit, Eye, Palette } from 'lucide-react';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ParametresPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  interface DRS {
    id: string;
    nom: string;
    code: string;
    region: string;
    email?: string;
    telephone?: string;
    adresse?: string;
  }

  interface DPS {
    id: string;
    nom: string;
    code: string;
    prefecture: string;
    drs_id: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    drs?: {
      nom: string;
    };
  }

  interface Structure {
    id: string;
    nom: string;
    type: string;
    code?: string;
    commune?: string;
    is_active: boolean;
  }

  const [tab, setTab] = useState('drs');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('fr');
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [showDrsForm, setShowDrsForm] = useState(false);
  const [showDpsForm, setShowDpsForm] = useState(false);
  const [editDrs, setEditDrs] = useState<DRS | null>(null);
  const [editDps, setEditDps] = useState<DPS | null>(null);
  const [drsForm, setDrsForm] = useState({ nom: '', code: '', region: '', email: '', telephone: '', adresse: '' });
  const [dpsForm, setDpsForm] = useState({ nom: '', code: '', prefecture: '', drs_id: '', email: '', telephone: '', adresse: '' });

  const { data: drsList = [], isLoading: loadingDrs } = useQuery({
    queryKey: ['param-drs'],
    queryFn: async () => { const { data } = await supabase.from('drs').select('*').order('nom'); return data || []; },
  });

  const { data: dpsList = [], isLoading: loadingDps } = useQuery({
    queryKey: ['param-dps'],
    queryFn: async () => { const { data } = await supabase.from('dps').select('*, drs(nom)').order('nom'); return data || []; },
  });

  const { data: structures = [] } = useQuery({
    queryKey: ['param-structures'],
    queryFn: async () => { const { data } = await supabase.from('structures').select('*').order('nom'); return data || []; },
  });

  const saveDrsMutation = useMutation({
    mutationFn: async () => {
      const payload = { nom: drsForm.nom, code: drsForm.code, region: drsForm.region, email: drsForm.email || null, telephone: drsForm.telephone || null, adresse: drsForm.adresse || null };
      if (editDrs) {
        const { error } = await supabase.from('drs').update(payload).eq('id', editDrs.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('drs').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['param-drs'] });
      setShowDrsForm(false); setEditDrs(null);
      setDrsForm({ nom: '', code: '', region: '', email: '', telephone: '', adresse: '' });
      toast({ title: editDrs ? 'DRS modifiée' : 'DRS créée' });
    },
    onError: (e: Error) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const saveDpsMutation = useMutation({
    mutationFn: async () => {
      const payload = { nom: dpsForm.nom, code: dpsForm.code, prefecture: dpsForm.prefecture, drs_id: dpsForm.drs_id, email: dpsForm.email || null, telephone: dpsForm.telephone || null, adresse: dpsForm.adresse || null };
      if (editDps) {
        const { error } = await supabase.from('dps').update(payload).eq('id', editDps.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('dps').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['param-dps'] });
      setShowDpsForm(false); setEditDps(null);
      setDpsForm({ nom: '', code: '', prefecture: '', drs_id: '', email: '', telephone: '', adresse: '' });
      toast({ title: editDps ? 'DPS modifiée' : 'DPS créée' });
    },
    onError: (e: Error) => toast({ title: 'Erreur', description: e.message, variant: 'destructive' }),
  });

  const openEditDrs = (drs: DRS) => {
    setEditDrs(drs);
    setDrsForm({ nom: drs.nom, code: drs.code, region: drs.region, email: drs.email || '', telephone: drs.telephone || '', adresse: drs.adresse || '' });
    setShowDrsForm(true);
  };

  const openEditDps = (dps: DPS) => {
    setEditDps(dps);
    setDpsForm({ nom: dps.nom, code: dps.code, prefecture: dps.prefecture, drs_id: dps.drs_id, email: dps.email || '', telephone: dps.telephone || '', adresse: dps.adresse || '' });
    setShowDpsForm(true);
  };

  if (loadingDrs) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground mt-1">Configuration système et gestion des entités</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">DRS</p><p className="text-xl font-display font-bold">{drsList.length}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center"><MapPin className="h-5 w-5 text-info" /></div>
            <div><p className="text-xs text-muted-foreground">DPS</p><p className="text-xl font-display font-bold">{dpsList.length}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><Settings className="h-5 w-5 text-success" /></div>
            <div><p className="text-xs text-muted-foreground">Structures</p><p className="text-xl font-display font-bold">{structures.length}</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="drs">DRS (Régions)</TabsTrigger>
          <TabsTrigger value="dps">DPS (Préfectures)</TabsTrigger>
          <TabsTrigger value="structures">Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <ThemeSelector />

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-display font-semibold">Notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gérez vos préférences de notifications
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Activer les notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications pour les mises à jour importantes
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-display font-semibold">Langue et région</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Personnalisez la langue et le format de date
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Format de date</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/MM/yyyy">JJ/MM/AAAA</SelectItem>
                        <SelectItem value="MM/dd/yyyy">MM/JJ/AAAA</SelectItem>
                        <SelectItem value="yyyy-MM-dd">AAAA-MM-JJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drs" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditDrs(null); setDrsForm({ nom: '', code: '', region: '', email: '', telephone: '', adresse: '' }); setShowDrsForm(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter une DRS
            </Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Code</TableHead><TableHead>Région</TableHead>
                <TableHead>Email</TableHead><TableHead>Téléphone</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(drsList as DRS[]).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.nom}</TableCell>
                    <TableCell className="font-mono text-sm">{d.code}</TableCell>
                    <TableCell>{d.region}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.email || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.telephone || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDrs(d)}><Edit className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {drsList.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucune DRS</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="dps" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditDps(null); setDpsForm({ nom: '', code: '', prefecture: '', drs_id: '', email: '', telephone: '', adresse: '' }); setShowDpsForm(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter une DPS
            </Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Code</TableHead><TableHead>Préfecture</TableHead>
                <TableHead>DRS</TableHead><TableHead>Téléphone</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(dpsList as DPS[]).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.nom}</TableCell>
                    <TableCell className="font-mono text-sm">{d.code}</TableCell>
                    <TableCell>{d.prefecture}</TableCell>
                    <TableCell className="text-sm">{d.drs?.nom || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.telephone || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDps(d)}><Edit className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {dpsList.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucune DPS</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Code</TableHead>
                <TableHead>Commune</TableHead><TableHead>Statut</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(structures as Structure[]).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.nom}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{s.type}</Badge></TableCell>
                    <TableCell className="font-mono text-sm">{s.code || '—'}</TableCell>
                    <TableCell className="text-sm">{s.commune || '—'}</TableCell>
                    <TableCell><Badge variant={s.is_active ? 'default' : 'outline'} className={s.is_active ? 'bg-success/10 text-success border-success/20' : ''}>{s.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  </TableRow>
                ))}
                {structures.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">Aucune structure</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* DRS Form */}
      <Dialog open={showDrsForm} onOpenChange={setShowDrsForm}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editDrs ? 'Modifier la DRS' : 'Ajouter une DRS'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nom *</Label><Input value={drsForm.nom} onChange={e => setDrsForm({ ...drsForm, nom: e.target.value })} /></div>
              <div className="space-y-2"><Label>Code *</Label><Input value={drsForm.code} onChange={e => setDrsForm({ ...drsForm, code: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Région *</Label><Input value={drsForm.region} onChange={e => setDrsForm({ ...drsForm, region: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={drsForm.email} onChange={e => setDrsForm({ ...drsForm, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={drsForm.telephone} onChange={e => setDrsForm({ ...drsForm, telephone: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Adresse</Label><Input value={drsForm.adresse} onChange={e => setDrsForm({ ...drsForm, adresse: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDrsForm(false)}>Annuler</Button>
            <Button onClick={() => saveDrsMutation.mutate()} disabled={!drsForm.nom || !drsForm.code || !drsForm.region || saveDrsMutation.isPending}>
              {saveDrsMutation.isPending ? 'Enregistrement...' : editDrs ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DPS Form */}
      <Dialog open={showDpsForm} onOpenChange={setShowDpsForm}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editDps ? 'Modifier la DPS' : 'Ajouter une DPS'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nom *</Label><Input value={dpsForm.nom} onChange={e => setDpsForm({ ...dpsForm, nom: e.target.value })} /></div>
              <div className="space-y-2"><Label>Code *</Label><Input value={dpsForm.code} onChange={e => setDpsForm({ ...dpsForm, code: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Préfecture *</Label><Input value={dpsForm.prefecture} onChange={e => setDpsForm({ ...dpsForm, prefecture: e.target.value })} /></div>
              <div className="space-y-2"><Label>DRS *</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={dpsForm.drs_id} onChange={e => setDpsForm({ ...dpsForm, drs_id: e.target.value })}>
                  <option value="">Sélectionner</option>
                  {(drsList as DRS[]).map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={dpsForm.email} onChange={e => setDpsForm({ ...dpsForm, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={dpsForm.telephone} onChange={e => setDpsForm({ ...dpsForm, telephone: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDpsForm(false)}>Annuler</Button>
            <Button onClick={() => saveDpsMutation.mutate()} disabled={!dpsForm.nom || !dpsForm.code || !dpsForm.prefecture || !dpsForm.drs_id || saveDpsMutation.isPending}>
              {saveDpsMutation.isPending ? 'Enregistrement...' : editDps ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
