import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ROLE_LABELS, RoleCode } from '@/types/auth';
import { useUserLevel, LEVEL_LABELS } from '@/hooks/useUserLevel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Shield, Building2, Save } from 'lucide-react';

export default function ProfilPage() {
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const { level } = useUserLevel();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || null,
      }).eq('user_id', user.user_id);
      if (error) throw error;
      await fetchProfile(user.user_id);
      setEditing(false);
      toast({ title: 'Profil mis à jour' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Mon profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div>
              <p className="text-lg font-display font-bold">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{user.role ? ROLE_LABELS[user.role as RoleCode] || user.role : 'Utilisateur'}</Badge>
                <Badge variant="outline">{LEVEL_LABELS[level]}</Badge>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Prénom</Label><Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Nom</Label><Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
              </div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+224 XXX XX XX XX" /></div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Nom complet</p><p className="text-sm font-medium">{user.first_name} {user.last_name}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{user.email}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="text-sm font-medium">{user.phone || '—'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Rôle</p><p className="text-sm font-medium">{user.role ? ROLE_LABELS[user.role as RoleCode] || user.role : 'Non défini'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div><p className="text-xs text-muted-foreground">Entité</p><p className="text-sm font-medium">{user.entity_type || '—'}</p></div>
                </div>
              </div>
              <Button variant="outline" onClick={() => { setForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '' }); setEditing(true); }}>
                Modifier mon profil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
