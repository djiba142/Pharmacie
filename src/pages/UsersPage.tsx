import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Users, Download, Filter, Edit, UserX, UserCheck, KeyRound, Eye } from 'lucide-react';
import { RoleCode, ROLE_LABELS } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';

interface UserRow {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  entity_type?: string;
  entity_id?: string;
  is_active: boolean;
  created_at: string;
  role?: string;
}

interface DrsOption {
  id: string;
  nom: string;
  code: string;
}

const ROLE_GROUPS: Record<string, RoleCode[]> = {
  'Super Administration': [RoleCode.SUPER_ADMIN, RoleCode.ADMIN_CENTRAL],
  'Ministère': [RoleCode.MIN_CABINET, RoleCode.MIN_SG, RoleCode.MIN_IG],
  'DNPM': [RoleCode.DNPM_DIR, RoleCode.DNPM_ADJ, RoleCode.DNPM_CHEF_SECTION],
  'PCG': [RoleCode.PCG_DIR, RoleCode.PCG_ADJ, RoleCode.PCG_DIR_ACHATS, RoleCode.PCG_DIR_STOCK, RoleCode.PCG_DIR_DISTRIB],
  'DRS': [RoleCode.ADMIN_DRS, RoleCode.DRS_DIR, RoleCode.DRS_ADJ, RoleCode.DRS_RESP_PHARMA, RoleCode.DRS_LOGISTIQUE, RoleCode.DRS_EPIDEMIO],
  'DPS': [RoleCode.ADMIN_DPS, RoleCode.DPS_DIR, RoleCode.DPS_ADJ, RoleCode.DPS_RESP_PHARMA, RoleCode.DPS_APPRO, RoleCode.DPS_AGENT],
  'Structures': [RoleCode.HOP_DIR, RoleCode.HOP_PHARMA, RoleCode.CS_RESP, RoleCode.CS_AGENT, RoleCode.CLIN_DIR, RoleCode.CLIN_PHARMA, RoleCode.PHARM_REDIST, RoleCode.PHARM_RESP],
  'Livreurs': [RoleCode.LIVREUR_PCG, RoleCode.LIVREUR_DRS, RoleCode.LIVREUR_DPS, RoleCode.LIVREUR_HOP, RoleCode.LIVREUR_PHARM_REDIST],
};

const ENTITY_TYPES_FOR_ROLE: Record<string, string> = {
  ADMIN_DRS: 'DRS', DRS_DIR: 'DRS', DRS_ADJ: 'DRS', DRS_RESP_PHARMA: 'DRS', DRS_LOGISTIQUE: 'DRS', DRS_EPIDEMIO: 'DRS',
  ADMIN_DPS: 'DPS', DPS_DIR: 'DPS', DPS_ADJ: 'DPS', DPS_RESP_PHARMA: 'DPS', DPS_APPRO: 'DPS', DPS_AGENT: 'DPS',
  HOP_DIR: 'HOPITAL', HOP_PHARMA: 'HOPITAL',
  CS_RESP: 'CENTRE_SANTE', CS_AGENT: 'CENTRE_SANTE',
  CLIN_DIR: 'CLINIQUE', CLIN_PHARMA: 'CLINIQUE',
  PHARM_REDIST: 'PHARMACIE', PHARM_RESP: 'PHARMACIE',
  LIVREUR_PCG: 'PCG', LIVREUR_DRS: 'DRS', LIVREUR_DPS: 'DPS', LIVREUR_HOP: 'HOPITAL', LIVREUR_PHARM_REDIST: 'PHARMACIE',
};

const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [drsOptions, setDrsOptions] = useState<DrsOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<UserRow | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Create form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    role: '' as string, entityId: '', autoPassword: true, forceChange: true, sendEmail: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchDrs();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');

      const roleMap = new Map<string, string>();
      if (roles) roles.forEach((r: any) => roleMap.set(r.user_id, r.role));

      const mapped: UserRow[] = (profiles || []).map((p: any) => ({
        ...p,
        role: roleMap.get(p.user_id) || undefined,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrs = async () => {
    const { data } = await supabase.from('drs').select('id, nom, code');
    if (data) setDrsOptions(data as DrsOption[]);
  };

  const needsEntity = form.role && ENTITY_TYPES_FOR_ROLE[form.role];

  const handleCreate = async () => {
    // ✅ Permission check: Only SUPER_ADMIN and ADMIN_CENTRAL can create users
    if (!user || ![RoleCode.SUPER_ADMIN, RoleCode.ADMIN_CENTRAL].includes(user.role as RoleCode)) {
      toast({ 
        title: 'Accès refusé', 
        description: 'Seuls les administrateurs peuvent créer des utilisateurs', 
        variant: 'destructive' 
      });
      return;
    }

    if (!form.email || !form.firstName || !form.lastName || !form.role) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }

    try {
      // Generate a random password
      const password = 'Temp' + Math.random().toString(36).slice(2, 10) + '!1';

      // Sign up user via Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password,
        options: {
          data: { first_name: form.firstName, last_name: form.lastName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur création utilisateur');

      const userId = authData.user.id;

      // Wait for the trigger to create the profile (retry up to 5 times with 500ms delay)
      let profile = null;
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
        if (data) {
          profile = data;
          break;
        }
      }

      if (!profile) {
        throw new Error('Le profil n\'a pas pu être créé automatiquement. Contactez l\'administrateur.');
      }

      // Update profile with additional data
      const { error: updateError } = await supabase.from('profiles').update({
        phone: form.phone || null,
        entity_type: ENTITY_TYPES_FOR_ROLE[form.role] || null,
        entity_id: form.entityId || null,
      }).eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Assign role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: form.role as any,
      });

      if (roleError) {
        throw roleError;
      }

      toast({
        title: 'Utilisateur créé',
        description: `${form.firstName} ${form.lastName} (${ROLE_LABELS[form.role as RoleCode]}) — Mot de passe: ${password}`,
      });

      setCreateOpen(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', role: '', entityId: '', autoPassword: true, forceChange: true, sendEmail: true });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.is_active : !u.is_active);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} utilisateur(s) enregistré(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Exporter</Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Créer un utilisateur</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-52"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Rôle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                  roles.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Chargement...</TableCell></TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Aucun utilisateur trouvé</TableCell></TableRow>
              ) : (
                filteredUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {u.role ? ROLE_LABELS[u.role as RoleCode] || u.role : 'Non assigné'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.entity_type || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? 'default' : 'outline'} className={u.is_active ? 'bg-success/10 text-success border-success/20' : ''}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailUser(u)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Créer un nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Personal info */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Informations personnelles</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prénom *</Label>
                  <Input placeholder="Prénom" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input placeholder="Nom" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="email@sante.gov.gn" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="+224 XXX XX XX XX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Role */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Rôle et rattachement</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Rôle *</Label>
                  <Select value={form.role} onValueChange={v => setForm({ ...form, role: v, entityId: '' })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_GROUPS).map(([group, roles]) => (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group}</div>
                          {roles.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {needsEntity && needsEntity === 'DRS' && (
                  <div className="space-y-2">
                    <Label>DRS de rattachement *</Label>
                    <Select value={form.entityId} onValueChange={v => setForm({ ...form, entityId: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner une DRS" /></SelectTrigger>
                      <SelectContent>
                        {drsOptions.map(d => <SelectItem key={d.id} value={d.id}>{d.nom} ({d.code})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {needsEntity && needsEntity !== 'DRS' && (
                  <div className="space-y-2">
                    <Label>Type d'entité</Label>
                    <Input value={needsEntity} disabled className="bg-muted" />
                  </div>
                )}
              </div>
            </div>

            {/* Security */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Sécurité</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox checked={form.autoPassword} onCheckedChange={v => setForm({ ...form, autoPassword: !!v })} />
                  <Label className="text-sm">Générer mot de passe automatiquement</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox checked={form.forceChange} onCheckedChange={v => setForm({ ...form, forceChange: !!v })} />
                  <Label className="text-sm">Forcer changement au premier login</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox checked={form.sendEmail} onCheckedChange={v => setForm({ ...form, sendEmail: !!v })} />
                  <Label className="text-sm">Envoyer email d'activation</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Créer l'utilisateur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Détail utilisateur</DialogTitle>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                  {detailUser.first_name?.[0]}{detailUser.last_name?.[0]}
                </div>
                <div>
                  <p className="font-display font-bold text-lg">{detailUser.first_name} {detailUser.last_name}</p>
                  <p className="text-sm text-muted-foreground">{detailUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground text-xs">Rôle</p><Badge variant="secondary">{detailUser.role ? ROLE_LABELS[detailUser.role as RoleCode] || detailUser.role : 'Non assigné'}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Statut</p><Badge variant={detailUser.is_active ? 'default' : 'outline'}>{detailUser.is_active ? 'Actif' : 'Inactif'}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Téléphone</p><p>{detailUser.phone || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Entité</p><p>{detailUser.entity_type || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Créé le</p><p>{new Date(detailUser.created_at).toLocaleDateString('fr-FR')}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
