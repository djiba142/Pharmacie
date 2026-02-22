import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RoleCode, ROLE_LABELS, UserStatus } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { logAction } from '@/services/logService';
import { Search, Plus, Download, Filter, Edit, UserX, Eye, Trash2, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, Ban, RotateCw } from 'lucide-react';

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
  status: 'ACTIF' | 'SUSPENDU' | 'SUPPRIME';
  created_at: string;
  role?: string;
}

interface DrsOption {
  id: string;
  nom: string;
  code: string;
}

interface DpsOption {
  id: string;
  nom: string;
  prefecture: string;
}

interface StructureOption {
  id: string;
  nom: string;
  type: string;
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
  'Finance & Audit': [RoleCode.DAF_NATIONAL, RoleCode.COMPTABLE_NATIONAL, RoleCode.AUDITEUR_INTERNE, RoleCode.DAF_DRS, RoleCode.COMPTABLE_DRS, RoleCode.COMPTABLE_DPS, RoleCode.COMPTABLE_HOP],
  'Trésorerie': [RoleCode.TRESORIER_NATIONAL],
};

const ENTITY_TYPES_FOR_ROLE: Record<string, string> = {
  ADMIN_DRS: 'DRS', DRS_DIR: 'DRS', DRS_ADJ: 'DRS', DRS_RESP_PHARMA: 'DRS', DRS_LOGISTIQUE: 'DRS', DRS_EPIDEMIO: 'DRS',
  ADMIN_DPS: 'DPS', DPS_DIR: 'DPS', DPS_ADJ: 'DPS', DPS_RESP_PHARMA: 'DPS', DPS_APPRO: 'DPS', DPS_AGENT: 'DPS',
  HOP_DIR: 'HOPITAL', HOP_PHARMA: 'HOPITAL',
  CS_RESP: 'CENTRE_SANTE', CS_AGENT: 'CENTRE_SANTE',
  CLIN_DIR: 'CLINIQUE', CLIN_PHARMA: 'CLINIQUE',
  PHARM_REDIST: 'PHARMACIE', PHARM_RESP: 'PHARMACIE',
  LIVREUR_PCG: 'PCG', LIVREUR_DRS: 'DRS', LIVREUR_DPS: 'DPS', LIVREUR_HOP: 'HOPITAL', LIVREUR_PHARM_REDIST: 'PHARMACIE',
  // Finance Roles
  DAF_NATIONAL: 'PCG', COMPTABLE_NATIONAL: 'PCG', AUDITEUR_INTERNE: 'PCG', TRESORIER_NATIONAL: 'PCG',
  DAF_DRS: 'DRS', COMPTABLE_DRS: 'DRS',
  GESTIONNAIRE_DPS: 'DPS', COMPTABLE_DPS: 'DPS',
  COMPTABLE_HOP: 'HOPITAL', GESTIONNAIRE_CS: 'CENTRE_SANTE',
};

const UsersPage = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [drsOptions, setDrsOptions] = useState<DrsOption[]>([]);
  const [dpsOptions, setDpsOptions] = useState<DpsOption[]>([]);
  const [structureOptions, setStructureOptions] = useState<StructureOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<UserRow | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<UserRow | null>(null);

  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();

  // Create/Edit form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    role: '' as string, entityId: '', autoPassword: true,
    password: '', forceChange: true, sendEmail: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDrs();
    fetchDps();
    fetchStructures();
  }, []);

  // Reset form when dialog closes
  useEffect(() => {
    if (!createOpen) {
      setEditingUser(null);
      setForm({ firstName: '', lastName: '', email: '', phone: '', role: '', entityId: '', autoPassword: true, password: '', forceChange: true, sendEmail: true });
    }
  }, [createOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: roles } = await supabase.from('user_roles').select('*');

      const roleMap = new Map<string, string>();
      if (roles) roles.forEach((r) => roleMap.set(r.user_id, r.role));

      const mapped: UserRow[] = (profiles || []).map((p) => ({
        ...p,
        role: roleMap.get(p.user_id) || undefined,
        status: (p as any).status || (p.is_active ? 'ACTIF' : 'SUSPENDU'),
      }));
      console.log("Mapped users:", mapped.length);
      setUsers(mapped);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de récupérer la liste des utilisateurs: " + (err.message || "Erreur inconnue"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  const fetchDrs = async () => {
    const { data } = await supabase.from('drs').select('id, nom, code');
    if (data) setDrsOptions(data as DrsOption[]);
  };

  const fetchDps = async () => {
    const { data } = await supabase.from('dps').select('id, nom, prefecture');
    if (data) setDpsOptions(data);
  };

  const fetchStructures = async () => {
    const { data } = await supabase.from('structures').select('id, nom, type');
    if (data) setStructureOptions(data);
  };

  const needsEntity = form.role && ENTITY_TYPES_FOR_ROLE[form.role];

  const handleEdit = (userToEdit: UserRow) => {
    setEditingUser(userToEdit);
    setForm({
      firstName: userToEdit.first_name || '',
      lastName: userToEdit.last_name || '',
      email: userToEdit.email || '',
      phone: userToEdit.phone || '',
      role: userToEdit.role || '',
      entityId: userToEdit.entity_id || '',
      autoPassword: true, // Not used in edit mode (password not editable here)
      password: '',
      forceChange: false,
      sendEmail: false
    });
    setCreateOpen(true);
  };

  const handleDeleteClick = (userToDelete: UserRow) => {
    setUserToDelete(userToDelete);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) {
      console.warn("confirmDelete called but userToDelete is null");
      return;
    }

    // VERBOSE LOGGING
    const targetId = userToDelete.id;
    const targetUserId = userToDelete.user_id;
    console.log(`[ACTION] confirmDelete started for ProfileID: ${targetId}, AuthID: ${targetUserId}`);

    try {
      // Use the PRIMARY KEY (id) for the update as it's safer
      const { data, error, status, statusText } = await supabase
        .from('profiles')
        .update({
          status: 'SUPPRIME',
          is_active: false
        })
        .eq('id', targetId)
        .select();

      console.log(`[SUPABASE RESPONSE] Status: ${status} ${statusText}`, { data, error });

      if (error) {
        let msg = `Erreur Supabase: ${error.message} (Code: ${error.code})`;
        if (error.code === '42501') msg = "Permission refusée (RLS). Vous n'avez pas les droits de modifier ce profil.";
        throw new Error(msg);
      }

      if (!data || data.length === 0) {
        throw new Error("Aucun profil n'a été mis à jour. Vérifiez que l'utilisateur existe encore.");
      }

      console.log("[SUCCESS] Profile marked as deleted in DB");

      // Archivage (Audit) - Non bloquant
      logAction({
        action: 'DELETE',
        entityType: 'USER',
        entityId: targetUserId,
        details: {
          name: `${userToDelete.first_name} ${userToDelete.last_name}`,
          email: userToDelete.email,
          profile_id: targetId
        }
      }).catch(e => console.error("Audit log error:", e));

      toast({
        title: "Succès",
        description: `L'utilisateur ${userToDelete.first_name} a été archivé avec succès.`,
      });

      await fetchUsers();
      console.log("[FLOW] List refreshed after deletion");
    } catch (err: any) {
      console.error("[CRITICAL] confirmDelete FAILED:", err);
      toast({
        title: "Action échouée",
        description: err.message || "Une erreur inconnue est survenue",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSuspendClick = (user: UserRow) => {
    setUserToSuspend(user);
    setSuspendConfirmOpen(true);
  };

  const confirmSuspend = async () => {
    if (!userToSuspend) {
      console.warn("confirmSuspend called but userToSuspend is null");
      return;
    }

    const targetId = userToSuspend.id;
    const targetUserId = userToSuspend.user_id;
    const currentStatus = (userToSuspend as any).status || (userToSuspend.is_active ? 'ACTIF' : 'SUSPENDU');
    const newStatus = currentStatus === 'SUSPENDU' ? 'ACTIF' : 'SUSPENDU';
    const isActive = newStatus === 'ACTIF';

    console.log(`[ACTION] confirmSuspend started for ProfileID: ${targetId}, NewStatus: ${newStatus}`);

    try {
      const { data, error, status, statusText } = await supabase
        .from('profiles')
        .update({
          status: newStatus,
          is_active: isActive
        })
        .eq('id', targetId)
        .select();

      console.log(`[SUPABASE RESPONSE] Status: ${status} ${statusText}`, { data, error });

      if (error) {
        let msg = `Erreur: ${error.message}`;
        if (error.code === '42501') msg = "Permission refusée par la base de données.";
        throw new Error(msg);
      }

      if (!data || data.length === 0) {
        throw new Error("Aucune modification appliquée.");
      }

      console.log("[SUCCESS] Profile status updated");

      logAction({
        action: 'UPDATE',
        entityType: 'USER',
        entityId: targetUserId,
        details: {
          name: `${userToSuspend.first_name} ${userToSuspend.last_name}`,
          new_status: newStatus,
          action: newStatus === 'ACTIF' ? 'REACTIVATION' : 'SUSPENSION'
        }
      }).catch(e => console.error("Audit log error:", e));

      toast({
        title: newStatus === 'SUSPENDU' ? "Utilisateur suspendu" : "Utilisateur réactivé",
        description: `L'action a été effectuée avec succès pour ${userToSuspend.first_name}.`
      });

      await fetchUsers();
    } catch (error: any) {
      console.error("[CRITICAL] confirmSuspend FAILED:", error);
      toast({
        title: "Échec de l'action",
        description: error.message || "Erreur inconnue",
        variant: "destructive"
      });
    } finally {
      setSuspendConfirmOpen(false);
      setUserToSuspend(null);
    }
  };

  const handleCreateOrUpdate = async () => {
    // ✅ Permission check: Only SUPER_ADMIN and ADMIN_CENTRAL can create/edit users
    if (!currentUser || ![RoleCode.SUPER_ADMIN, RoleCode.ADMIN_CENTRAL].includes(currentUser.role as RoleCode)) {
      toast({
        title: 'Accès refusé',
        description: 'Seuls les administrateurs peuvent gérer les utilisateurs',
        variant: 'destructive'
      });
      return;
    }

    if (!form.firstName || !form.lastName || !form.role) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }

    // New User Validation
    if (!editingUser) {
      if (!form.email) {
        toast({ title: 'Erreur', description: "L'email est obligatoire pour la création", variant: 'destructive' });
        return;
      }
      if (!form.autoPassword && (!form.password || form.password.length < 6)) {
        toast({ title: 'Erreur', description: 'Le mot de passe doit faire au moins 6 caractères', variant: 'destructive' });
        return;
      }
    }

    try {
      let userId = editingUser?.user_id;

      if (editingUser) {
        // === UPDATE EXISTING USER ===

        // 1. Update Profile
        const { error: updateProfileError } = await supabase.from('profiles').update({
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone || null,
          entity_type: ENTITY_TYPES_FOR_ROLE[form.role] || null,
          entity_id: form.entityId || null,
        }).eq('user_id', userId);

        if (updateProfileError) throw updateProfileError;

        // 2. Update Role (Delete old, insert new - simplistic approach for 1:1 role)
        // Check if role changed
        if (editingUser.role !== form.role) {
          const { error: deleteRoleError } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);

          if (deleteRoleError) throw deleteRoleError;

          const { error: insertRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role: form.role as any,
            });

          if (insertRoleError) throw insertRoleError;
        }

        toast({
          title: 'Utilisateur mis à jour',
          description: `Les informations de ${form.firstName} ${form.lastName} ont été modifiées.`,
        });

      } else {
        // === CREATE NEW USER ===
        // Determine password
        const password = form.autoPassword
          ? 'Temp' + Math.random().toString(36).slice(2, 10) + '!1'
          : form.password;

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

        userId = authData.user.id;

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

        if (updateError) throw updateError;

        // Assign role
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: userId,
          role: form.role as any,
        });

        if (roleError) throw roleError;

        toast({
          title: 'Utilisateur créé',
          description: `${form.firstName} ${form.lastName} (${ROLE_LABELS[form.role as RoleCode]}) — Mot de passe: ${password}`,
        });
      }

      setCreateOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const firstName = u.first_name || '';
      const lastName = u.last_name || '';
      const email = u.email || '';
      const matchSearch = `${firstName} ${lastName} ${email}`.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-foreground">Gestion des Utilisateurs</h1>
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100">v2.1 DEBUG</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm text-muted-foreground">{users.length} utilisateur(s) enregistré(s)</p>
          <span className="text-[10px] text-muted-foreground/60">• Mis à jour à {lastRefresh.toLocaleTimeString('fr-FR')}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
          <RotateCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </Button>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Exporter</Button>
        <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" /> Créer un utilisateur</Button>
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
                  <div key={group}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group}</div>
                    {roles.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
                  </div>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIF">Actifs</SelectItem>
                <SelectItem value="SUSPENDU">Suspendus</SelectItem>
                <SelectItem value="SUPPRIME">Supprimés</SelectItem>
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
                      <Badge
                        variant={u.status === 'ACTIF' ? 'default' : 'outline'}
                        className={
                          u.status === 'ACTIF' ? 'bg-success/10 text-success border-success/20' :
                            u.status === 'SUSPENDU' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                              'bg-destructive/10 text-destructive border-destructive/20'
                        }
                      >
                        {u.status === 'ACTIF' ? 'Actif' : u.status === 'SUSPENDU' ? 'Suspendu' : 'Supprimé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailUser(u)} title="Voir détails"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(u)} title="Modifier"><Edit className="h-4 w-4" /></Button>

                        {(currentUser?.role === RoleCode.SUPER_ADMIN || currentUser?.role === RoleCode.ADMIN_CENTRAL) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${u.status === 'SUSPENDU' ? 'text-success hover:text-success hover:bg-success/10' : 'text-amber-600 hover:text-amber-600 hover:bg-amber-50'}`}
                            onClick={() => handleSuspendClick(u)}
                            title={u.status === 'SUSPENDU' ? "Réactiver" : "Suspendre"}
                          >
                            {u.status === 'SUSPENDU' ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                        )}

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(u)} title="Supprimer (Désactiver)"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">{editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}</DialogTitle>
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
                  <Input
                    type="email"
                    placeholder="email@sante.gov.gn"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    disabled={!!editingUser} // Can't start edit email directly (auth uid mismatch complexity)
                    className={editingUser ? "bg-muted" : ""}
                  />
                  {editingUser && <p className="text-[10px] text-muted-foreground">L'email ne peut pas être modifié ici.</p>}
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

                {needsEntity === 'DRS' && (
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

                {needsEntity === 'DPS' && (
                  <div className="space-y-2">
                    <Label>DPS de rattachement *</Label>
                    <Select value={form.entityId} onValueChange={v => setForm({ ...form, entityId: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner une DPS" /></SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {dpsOptions.map(d => <SelectItem key={d.id} value={d.id}>{d.nom} ({d.prefecture})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(needsEntity === 'HOPITAL' || needsEntity === 'CENTRE_SANTE' || needsEntity === 'CLINIQUE' || needsEntity === 'PHARMACIE') && (
                  <div className="space-y-2">
                    <Label>Structure de rattachement *</Label>
                    <Select value={form.entityId} onValueChange={v => setForm({ ...form, entityId: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner une structure" /></SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {structureOptions
                          .filter(s => s.type === needsEntity)
                          .map(s => <SelectItem key={s.id} value={s.id}>{s.nom}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Security */}
            {!editingUser && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Sécurité</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={form.autoPassword} onCheckedChange={v => setForm({ ...form, autoPassword: !!v })} />
                    <Label className="text-sm">Générer mot de passe automatiquement</Label>
                  </div>

                  {!form.autoPassword && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <Label>Mot de passe manuel *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Saisir un mot de passe"
                          value={form.password}
                          onChange={e => setForm({ ...form, password: e.target.value })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <UserX className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}
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
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateOrUpdate}>{editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le compte de <b>{userToDelete?.first_name} {userToDelete?.last_name}</b> ?
              <br /><br />
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-xs">Cet utilisateur sera marqué comme supprimé et ne pourra plus se connecter.</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={confirmDelete}>Confirmer la suppression</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={suspendConfirmOpen} onOpenChange={setSuspendConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{userToSuspend?.status === 'SUSPENDU' ? 'Réactiver l\'utilisateur' : 'Suspendre l\'utilisateur'}</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment {userToSuspend?.status === 'SUSPENDU' ? 'réactiver' : 'suspendre'} le compte de <b>{userToSuspend?.first_name} {userToSuspend?.last_name}</b> ?
              <br /><br />
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                <Ban className="h-5 w-5 flex-shrink-0" />
                <span className="text-xs">
                  {userToSuspend?.status === 'SUSPENDU'
                    ? "L'utilisateur retrouvera tous ses accès immédiatement."
                    : "L'utilisateur ne pourra plus se connecter jusqu'à sa réactivation."}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendConfirmOpen(false)}>Annuler</Button>
            <Button
              variant="default"
              onClick={confirmSuspend}
              className={userToSuspend?.status === 'SUSPENDU' ? '' : 'bg-amber-600 hover:bg-amber-700 text-white'}
            >
              Confirmer
            </Button>
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
                <div>
                  <p className="text-muted-foreground text-xs">Statut</p>
                  <Badge
                    variant={detailUser.status === 'ACTIF' ? 'default' : 'outline'}
                    className={
                      detailUser.status === 'ACTIF' ? 'bg-success/10 text-success border-success/20' :
                        detailUser.status === 'SUSPENDU' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                          'bg-destructive/10 text-destructive border-destructive/20'
                    }
                  >
                    {detailUser.status === 'ACTIF' ? 'Actif' : detailUser.status === 'SUSPENDU' ? 'Suspendu' : 'Supprimé'}
                  </Badge>
                </div>
                <div><p className="text-muted-foreground text-xs">Téléphone</p><p>{detailUser.phone || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Entité</p><p>{detailUser.entity_type || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs">Créé le</p><p>{new Date(detailUser.created_at).toLocaleDateString('fr-FR')}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default UsersPage;
