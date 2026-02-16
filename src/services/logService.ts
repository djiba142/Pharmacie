import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'EXPORT'
    | 'VIEW'
    | 'LOGIN_FAILED'
    | 'UNAUTHORIZED_ACCESS';

export type AuditEntityType =
    | 'USER'
    | 'STOCK'
    | 'COMMANDE'
    | 'LIVRAISON'
    | 'RAPPORT'
    | 'AUTH'
    | 'SYSTEM';

interface LogActionParams {
    action: AuditAction;
    entityType: AuditEntityType;
    entityId?: string;
    details?: Record<string, any>;
    metadata?: Record<string, any>; // For backward compatibility or extra data
}

interface UserProfileCache {
    firstName: string;
    lastName: string;
    role: string;
    timestamp: number;
}

// Simple in-memory cache to avoid repeated database queries
const profileCache = new Map<string, UserProfileCache>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches user profile and role from the database with caching.
 * @param userId The user ID to fetch profile for
 * @returns User profile data or null if not found
 */
const getUserProfile = async (userId: string): Promise<UserProfileCache | null> => {
    // Check cache first
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached;
    }

    try {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', userId)
            .maybeSingle();

        if (profileError || !profile) {
            console.warn('Could not fetch user profile for audit log:', profileError);
            return null;
        }

        // Fetch role
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .maybeSingle();

        if (roleError) {
            console.warn('Could not fetch user role for audit log:', roleError);
        }

        const profileData: UserProfileCache = {
            firstName: profile.first_name || 'Unknown',
            lastName: profile.last_name || 'User',
            role: roleData?.role || 'N/A',
            timestamp: Date.now()
        };

        // Cache the result
        profileCache.set(userId, profileData);

        return profileData;
    } catch (err) {
        console.error('Exception fetching user profile:', err);
        return null;
    }
};

/**
 * Logs a user action to the audit_logs table.
 * @param params The action details to log.
 */
export const logAction = async ({
    action,
    entityType,
    entityId,
    details,
    metadata
}: LogActionParams) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            console.warn('Cannot log action: No active session');
            return;
        }

        // Get user profile and role
        const profile = await getUserProfile(session.user.id);

        const logEntry = {
            user_id: session.user.id,
            user_email: session.user.email || 'unknown@email.com',
            user_name: profile
                ? `${profile.firstName} ${profile.lastName}`
                : session.user.email || 'Unknown User',
            user_role: profile?.role || 'N/A',
            action,
            entity_type: entityType,
            entity_id: entityId,
            details: {
                ...details,
                ...metadata,
                timestamp: new Date().toISOString()
            },
            ip_address: undefined, // Client-side can't reliably get IP
            user_agent: navigator.userAgent
        };

        const { error } = await supabase
            .from('audit_logs' as any) // Cast to any until types are regenerated after migration
            .insert(logEntry);

        if (error) {
            console.error('Failed to insert audit log:', error);
            // Don't throw - logging should not break the main flow
        } else {
            console.log(`✅ Audit log recorded: ${action} on ${entityType} by ${logEntry.user_name}`);
        }
    } catch (err) {
        console.error('Exception logging action:', err);
        // Fail silently to not interrupt user operations
    }
};

/**
 * Clears the profile cache for a specific user or all users.
 * @param userId Optional user ID to clear cache for (clears all if not provided)
 */
export const clearProfileCache = (userId?: string) => {
    if (userId) {
        profileCache.delete(userId);
    } else {
        profileCache.clear();
    }
};

