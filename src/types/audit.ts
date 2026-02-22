export interface AuditLog {
    id: string;
    timestamp: string;
    user_id: string;
    user_name: string;
    user_role: string;
    user_email: string;
    ip_address: string;
    user_agent: string;
    action: string;
    entity_type: string;
    entity_id: string;
    changes?: {
        before: Record<string, unknown>;
        after: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
    status: 'SUCCESS' | 'FAILURE';
    error_message?: string | null;
}

export interface AuditStats {
    totalLogs: number;
    actionsByType: Record<string, number>;
    recentAlerts: number;
}

export interface AuditFilter {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    action?: string;
    entityType?: string;
    status?: 'SUCCESS' | 'FAILURE' | 'ALL';
}
