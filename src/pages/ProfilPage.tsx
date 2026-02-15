import { useState, useRef } from 'react';
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
import { User, Mail, Phone, Shield, Building2, Save, Camera, X } from 'lucide-react';
import { uploadAvatar, deleteAvatar, updateProfileAvatar } from '@/lib/supabase-storage';

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      // Delete old avatar if exists
      if (user.avatar_url) {
        await deleteAvatar(user.avatar_url);
      }

      // Upload new avatar
      const avatarUrl = await uploadAvatar(user.user_id, file);

      // Update profile
      await updateProfileAvatar(user.user_id, avatarUrl);

      // Refresh profile
      await fetchProfile(user.user_id);

      toast({ title: 'Photo de profil mise à jour' });
      setAvatarPreview(null);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !user.avatar_url) return;

    setUploadingAvatar(true);
    try {
      await deleteAvatar(user.avatar_url);
      await updateProfileAvatar(user.user_id, '');
      await fetchProfile(user.user_id);
      toast({ title: 'Photo de profil supprimée' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Mon profil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gérez vos informations personnelles</p>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6">
          {/* Avatar Section - Enhanced */}
          <div className="flex items-start gap-6 mb-8 pb-6 border-b">
            <div className="relative group">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="h-32 w-32 rounded-full object-cover border-4 border-primary/10 shadow-lg"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl font-bold text-primary border-4 border-primary/10 shadow-lg">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Changer
                </Button>
              </div>

              {user.avatar_url && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1">
              <p className="text-2xl font-display font-bold">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                  {user.role ? ROLE_LABELS[user.role as RoleCode] || user.role : 'Utilisateur'}
                </Badge>
                <Badge variant="outline">{LEVEL_LABELS[level]}</Badge>
              </div>

              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {uploadingAvatar ? 'Upload en cours...' : 'Changer la photo'}
                </Button>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Prénom</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Nom</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+224 XXX XX XX XX" /></div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer'}</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Annuler</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <User className="h-5 w-5 text-primary" />
                  <div><p className="text-xs text-muted-foreground">Nom complet</p><p className="text-sm font-medium">{user.first_name} {user.last_name}</p></div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <Mail className="h-5 w-5 text-primary" />
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{user.email}</p></div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <Phone className="h-5 w-5 text-primary" />
                  <div><p className="text-xs text-muted-foreground">Téléphone</p><p className="text-sm font-medium">{user.phone || '—'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <Shield className="h-5 w-5 text-primary" />
                  <div><p className="text-xs text-muted-foreground">Rôle</p><p className="text-sm font-medium">{user.role ? ROLE_LABELS[user.role as RoleCode] || user.role : 'Non défini'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 col-span-2">
                  <Building2 className="h-5 w-5 text-primary" />
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
