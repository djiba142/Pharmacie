import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { logAction } from '@/services/logService';
import { cookieService } from '@/services/cookieService';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  entity_id?: string;
  entity_type?: string;
  is_active: boolean;
  status?: 'ACTIF' | 'SUSPENDU' | 'SUPPRIME';
  avatar_url?: string;
  role?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        // No session, set loading to false immediately
        set({ loading: false });
      }
    } catch (err) {
      console.error('Auth init error:', err);
      set({ loading: false });
    }

    // Listen for auth changes but don't interfere with initial load
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      if (!profile) {
        console.error('No profile found for user:', userId);
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      }

      set({
        user: {
          ...profile,
          role: roleData?.role || undefined,
        } as UserProfile,
        isAuthenticated: true,
        loading: false,
      });

      // Synchroniser les cookies au chargement du profil
      await cookieService.syncOnLogin(userId);
    } catch (err) {
      console.error('Unexpected error in fetchProfile:', err);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Optionally log failed attempts if needed, but be careful with security (don't log password)
      // await logAction({ action: 'LOGIN_FAILED', entityType: 'AUTH', details: { email, error: error.message } });
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Wait for profile to be loaded before returning success
      await get().fetchProfile(data.user.id);

      // Log successful login
      const userProfile = get().user;
      if (userProfile) {
        logAction({
          action: 'LOGIN',
          entityType: 'AUTH',
          entityId: data.user.id,
          details: {
            role: userProfile.role,
            name: `${userProfile.first_name} ${userProfile.last_name}`
          }
        });
      }
    }

    // Check if we are actually authenticated now (profile loaded)
    if (!get().isAuthenticated) {
      return { success: false, error: "Impossible de charger le profil utilisateur. Contactez l'administrateur." };
    }

    return { success: true };
  },

  signup: async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  logout: async () => {
    const user = get().user;
    if (user) {
      await logAction({
        action: 'LOGOUT',
        entityType: 'AUTH',
        entityId: user.id
      });
    }
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
