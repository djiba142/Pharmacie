// Types robustes pour le système IA

export type UrgenceLevel = 'RUPTURE' | 'CRITIQUE' | 'ALERTE' | 'OK';
export type InsightType = 'URGENT' | 'WARNING' | 'INFO' | 'SUCCESS';
export type FeedbackType = 1 | -1 | null;

export interface AIMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    feedback?: FeedbackType;
    userQuestion?: string;
    confidence?: number;
}

export interface FAQItem {
    id: string;
    keywords: string[];
    question: string;
    answer: string;
    category: string;
    priority: number;
}

export interface StockPrediction {
    jours_avant_rupture: number;
    date_rupture_prevue: string;
    quantite_a_commander: number;
    urgence: UrgenceLevel;
    confiance: number;
    last_updated: string;
}

export interface AIInsight {
    id: string;
    type: InsightType;
    icon: string;
    titre: string;
    message: string;
    action: string | null;
    priority: number;
    created_at: string;
    entity_id: string;
}

export interface AIAnalyticsEvent {
    event_type: 'chat_query' | 'feedback' | 'prediction' | 'insight_view' | 'action_taken';
    user_id: string | null;
    entity_id?: string;
    data: Record<string, string | number | boolean>;
    timestamp: Date;
}

export interface ConversationMetadata {
    total_interactions: number;
    satisfaction_rate: number;
    average_resolution_time: number;
    last_interaction: Date | null;
}

export interface AIServiceConfig {
    enableCaching: boolean;
    cacheDurationMs: number;
    maxRetries: number;
    requestTimeoutMs: number;
    enableAnalytics: boolean;
}

export interface AIServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
}
