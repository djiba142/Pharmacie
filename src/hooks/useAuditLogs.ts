import { useState, useEffect } from 'react';
import { AuditLog, AuditFilter } from '@/types/audit';

// Mock data generator
const generateMockLogs = (): AuditLog[] => {
    const actions = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'VIEW'];
    const entityTypes = ['USER', 'STOCK', 'COMMANDE', 'LIVRAISON', 'RAPPORT'];
    const users = [
        { name: 'Alpha Condé', role: 'DPS_RESP_PHARMA', email: 'alpha.conde@sante.gov.gn' },
        { name: 'Fatoumata Diallo', role: 'DRS_RESP_PHARMA', email: 'f.diallo@sante.gov.gn' },
        { name: 'Mamadou Barry', role: 'HOP_PHARMA', email: 'm.barry@hopital.gn' },
        { name: 'Admin Système', role: 'SUPER_ADMIN', email: 'admin@livramed.gn' }
    ];

    return Array.from({ length: 50 }).map((_, i) => {
        const user = users[Math.floor(Math.random() * users.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        const isSuccess = Math.random() > 0.1;
        const date = new Date();
        date.setHours(date.getHours() - Math.floor(Math.random() * 48));

        return {
            id: `log-${Date.now()}-${i}`,
            timestamp: date.toISOString(),
            user_id: `user-${i}`,
            user_name: user.name,
            user_role: user.role,
            user_email: user.email,
            ip_address: `41.223.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            action,
            entity_type: entityType,
            entity_id: `${entityType.toLowerCase()}-${Math.floor(Math.random() * 1000)}`,
            changes: action === 'UPDATE' ? {
                before: { quantite: 100 },
                after: { quantite: 85 }
            } : undefined,
            metadata: {
                motif: 'Opération de routine',
                description: `Action ${action} effectuée sur ${entityType}`
            },
            status: (isSuccess ? 'SUCCESS' : 'FAILURE') as AuditLog['status'],
            error_message: isSuccess ? null : 'Erreur de connexion au serveur'
        };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

import { supabase } from '@/integrations/supabase/client';

export function useAuditLogs(filter?: AuditFilter) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            setIsLoading(true);

            try {
                // Build query with filters
                let query = supabase
                    .from('audit_logs' as any) // Cast to any until types are regenerated
                    .select('*')
                    .order('created_at', { ascending: false });

                // Apply server-side filters if provided
                if (filter?.userId) {
                    query = query.eq('user_id', filter.userId);
                }
                if (filter?.action) {
                    query = query.eq('action', filter.action);
                }
                if (filter?.entityType) {
                    query = query.eq('entity_type', filter.entityType);
                }
                if (filter?.startDate) {
                    query = query.gte('created_at', filter.startDate.toISOString());
                }
                if (filter?.endDate) {
                    query = query.lte('created_at', filter.endDate.toISOString());
                }

                const { data: realLogs, error } = await query;

                if (error) {
                    console.warn('Could not fetch audit logs, table might be missing. Falling back to mock data.', error);
                    // Generate mock data if table is missing
                    setLogs(generateMockLogs());
                } else {
                    // Map real logs to our AuditLog interface
                    const mappedLogs: AuditLog[] = (realLogs || []).map((log: any) => ({
                        id: log.id,
                        timestamp: log.created_at,
                        user_id: log.user_id,
                        user_name: log.user_name || log.user_email || 'Utilisateur Inconnu',
                        user_role: log.user_role || 'N/A',
                        user_email: log.user_email || '',
                        ip_address: log.ip_address || 'N/A',
                        user_agent: log.user_agent || 'N/A',
                        action: log.action,
                        entity_type: log.entity_type,
                        entity_id: log.entity_id || '',
                        changes: log.details?.changes,
                        metadata: log.details,
                        status: 'SUCCESS' as const, // Default, can be enhanced later
                        error_message: null
                    }));

                    // Apply client-side filters
                    let filteredLogs = mappedLogs;

                    if (filter?.search) {
                        const searchLower = filter.search.toLowerCase();
                        filteredLogs = filteredLogs.filter(log =>
                            log.user_name.toLowerCase().includes(searchLower) ||
                            log.action.toLowerCase().includes(searchLower) ||
                            log.entity_id.toLowerCase().includes(searchLower) ||
                            (log.user_email && log.user_email.toLowerCase().includes(searchLower))
                        );
                    }

                    if (filter?.status && filter.status !== 'ALL') {
                        filteredLogs = filteredLogs.filter(log => log.status === filter.status);
                    }

                    // If no real logs exist and we want to show demo data for testing
                    if (filteredLogs.length === 0 && !filter) {
                        console.info('No audit logs found. Showing mock data for demonstration.');
                        setLogs(generateMockLogs());
                    } else {
                        setLogs(filteredLogs);
                    }
                }
            } catch (err) {
                console.error('Error loading audit logs:', err);
                setLogs(generateMockLogs());
            } finally {
                setIsLoading(false);
            }
        };

        loadLogs();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('audit_logs_changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_logs' },
                (payload) => {
                    // Optimistically add new log to the beginning of the list
                    const newLog: AuditLog = {
                        id: payload.new.id,
                        timestamp: payload.new.created_at,
                        user_id: payload.new.user_id,
                        user_name: payload.new.user_name || payload.new.user_email || 'Utilisateur Inconnu',
                        user_role: payload.new.user_role || 'N/A',
                        user_email: payload.new.user_email || '',
                        ip_address: payload.new.ip_address || 'N/A',
                        user_agent: payload.new.user_agent || 'N/A',
                        action: payload.new.action,
                        entity_type: payload.new.entity_type,
                        entity_id: payload.new.entity_id || '',
                        changes: payload.new.details?.changes,
                        metadata: payload.new.details,
                        status: 'SUCCESS' as const,
                        error_message: null
                    };

                    setLogs(prev => [newLog, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [JSON.stringify(filter)]);

    return { logs, isLoading };
}
