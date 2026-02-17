import { supabase } from '@/integrations/supabase/client';

// Types de cookies
export type CookieCategory = 'necessary' | 'performance' | 'functional';

export interface CookiePreferences {
    necessary: boolean; // Toujours true
    performance: boolean;
    functional: boolean;
    timestamp: string;
}

export interface UserCookieConsent {
    user_id: string | null;
    preferences: CookiePreferences;
    ip_address?: string;
    user_agent?: string;
}

// Valeurs par défaut
const DEFAULT_PREFERENCES: CookiePreferences = {
    necessary: true, // Toujours activé
    performance: false,
    functional: false,
    timestamp: new Date().toISOString()
};

/**
 * Service de gestion des cookies connecté au backend Supabase
 */
class CookieService {
    private readonly COOKIE_CONSENT_KEY = 'livramed_cookie_consent';
    private readonly COOKIE_EXPIRY_DAYS = 365; // 1 an

    /**
     * Récupère les préférences de cookies depuis localStorage
     */
    getLocalPreferences(): CookiePreferences | null {
        try {
            const stored = localStorage.getItem(this.COOKIE_CONSENT_KEY);
            if (!stored) return null;
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error reading cookie preferences:', error);
            return null;
        }
    }

    /**
     * Sauvegarde les préférences localement ET dans Supabase
     */
    async savePreferences(preferences: Partial<CookiePreferences>): Promise<void> {
        const fullPreferences: CookiePreferences = {
            ...DEFAULT_PREFERENCES,
            ...preferences,
            necessary: true, // Force toujours à true
            timestamp: new Date().toISOString()
        };

        // Sauvegarder localement en priorité
        try {
            localStorage.setItem(this.COOKIE_CONSENT_KEY, JSON.stringify(fullPreferences));
        } catch (error) {
            console.error('Error saving preferences to localStorage:', error);
            throw new Error('Impossible de sauvegarder les préférences locales');
        }

        // Appliquer les préférences immédiatement
        this.applyPreferences(fullPreferences);

        // Sauvegarder dans Supabase si l'utilisateur est connecté (sans bloquer)
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                await this.saveToBackend(user.id, fullPreferences);
            }
        } catch (error) {
            console.warn('Warning: Cookie preferences could not be synced to backend:', error);
            // Ne pas bloquer - les préférences locales sont sauvegardées
        }
    }

    /**
     * Sauvegarde dans Supabase (table user_cookie_consents)
     */
    private async saveToBackend(userId: string, preferences: CookiePreferences): Promise<void> {
        try {
            // D'abord, chercher si le consentement existe déjà
            const { data: existing } = await supabase
                .from('user_cookie_consents')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (existing) {
                // Mettre à jour
                await supabase
                    .from('user_cookie_consents')
                    .update({
                        preferences: preferences as any,
                        user_agent: navigator.userAgent,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);
            } else {
                // Créer
                await supabase
                    .from('user_cookie_consents')
                    .insert({
                        user_id: userId,
                        preferences: preferences as any,
                        user_agent: navigator.userAgent,
                        ip_address: null
                    });
            }
        } catch (error) {
            console.error('Error saving cookie preferences to backend:', error);
            throw error;
        }
    }

    /**
     * Charge les préférences depuis Supabase pour un utilisateur connecté
     */
    async loadFromBackend(userId: string): Promise<CookiePreferences | null> {
        try {
            const { data, error } = await supabase
                .from('user_cookie_consents')
                .select('preferences')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                console.log('No cookie preferences found in backend:', error?.message);
                return null;
            }

            const preferences = data.preferences as CookiePreferences;
            
            // Synchroniser avec localStorage
            localStorage.setItem(this.COOKIE_CONSENT_KEY, JSON.stringify(preferences));
            
            return preferences;
        } catch (error) {
            console.error('Error loading cookie preferences from backend:', error);
            return null;
        }
    }

    /**
     * Applique les préférences (active/désactive les cookies)
     */
    private applyPreferences(preferences: CookiePreferences): void {
        // Cookies de performance (Google Analytics, etc.)
        if (preferences.performance) {
            this.enablePerformanceCookies();
        } else {
            this.disablePerformanceCookies();
        }

        // Cookies fonctionnels
        if (preferences.functional) {
            this.enableFunctionalCookies();
        } else {
            this.disableFunctionalCookies();
        }
    }

    /**
     * Active les cookies de performance
     */
    private enablePerformanceCookies(): void {
        // Exemple: Activer Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'granted'
            });
        }
    }

    /**
     * Désactive les cookies de performance
     */
    private disablePerformanceCookies(): void {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'denied'
            });
        }
        // Supprimer les cookies Google Analytics existants
        this.deleteCookie('_ga');
        this.deleteCookie('_gid');
        this.deleteCookie('_gat');
    }

    /**
     * Active les cookies fonctionnels
     */
    private enableFunctionalCookies(): void {
        // Les cookies fonctionnels sont gérés par localStorage
        // Rien à faire de spécial ici
    }

    /**
     * Désactive les cookies fonctionnels
     */
    private disableFunctionalCookies(): void {
        // Supprimer les préférences fonctionnelles
        localStorage.removeItem('dashboard_prefs');
        localStorage.removeItem('table_filters');
        localStorage.removeItem('sidebar_collapsed');
    }

    /**
     * Supprime un cookie spécifique
     */
    private deleteCookie(name: string): void {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    /**
     * Vérifie si le consentement a été donné
     */
    hasConsent(): boolean {
        return this.getLocalPreferences() !== null;
    }

    /**
     * Accepte tous les cookies
     */
    async acceptAll(): Promise<void> {
        await this.savePreferences({
            necessary: true,
            performance: true,
            functional: true
        });
    }

    /**
     * Refuse tous les cookies (sauf nécessaires)
     */
    async rejectAll(): Promise<void> {
        await this.savePreferences({
            necessary: true,
            performance: false,
            functional: false
        });
    }

    /**
     * Réinitialise les préférences
     */
    async reset(): Promise<void> {
        localStorage.removeItem(this.COOKIE_CONSENT_KEY);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('user_cookie_consents')
                    .delete()
                    .eq('user_id', user.id);
            }
        } catch (error) {
            console.error('Error resetting cookie preferences:', error);
        }
    }

    /**
     * Synchronise les préférences au login
     */
    async syncOnLogin(userId: string): Promise<void> {
        // Charger depuis le backend
        const backendPrefs = await this.loadFromBackend(userId);

        if (backendPrefs) {
            // Utiliser les préférences du backend
            this.applyPreferences(backendPrefs);
        } else {
            // Sauvegarder les préférences locales dans le backend
            const localPrefs = this.getLocalPreferences();
            if (localPrefs) {
                await this.saveToBackend(userId, localPrefs);
            }
        }
    }

    /**
     * Nettoie les cookies au logout
     */
    async cleanupOnLogout(): Promise<void> {
        // Garder les préférences de consentement
        // Mais supprimer les cookies de session
        this.deleteCookie('session_token');
        this.deleteCookie('auth_token');
    }
}

// Export singleton
export const cookieService = new CookieService();
