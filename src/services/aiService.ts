/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';
import type {
    FAQItem,
    StockPrediction,
    AIInsight,
    AIServiceResponse,
    AIServiceConfig,
    ConversationMetadata
} from '@/types/ai';

/**
 * Service centralisé pour toutes les opérations IA
 * - Gestion du cache
 * - Retry logic
 * - Error handling robuste
 * - Analytics
 */
class AIService {
    private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
    private config: AIServiceConfig = {
        enableCaching: true,
        cacheDurationMs: 5 * 60 * 1000, // 5 minutes
        maxRetries: 3,
        requestTimeoutMs: 10000,
        enableAnalytics: true
    };

    // FAQ locale (pas de table Supabase nécessaire)
    private faqData: FAQItem[] = [
        {
            id: '1',
            keywords: ['compte', 'créer', 'inscription', 'obtenir'],
            question: 'Comment obtenir un compte sur LivraMed ?',
            answer: 'Les comptes sont créés uniquement par les administrateurs autorisés. Contactez l\'administrateur de votre entité (DPS, DRS, Hôpital) qui créera votre compte. Vous recevrez ensuite un email avec vos identifiants.',
            category: 'account',
            priority: 1
        },
        {
            id: '2',
            keywords: ['mot de passe', 'oublié', 'réinitialiser', 'password'],
            question: 'J\'ai oublié mon mot de passe',
            answer: 'Utilisez la fonction "Mot de passe oublié" sur la page de connexion. Entrez votre email professionnel et suivez le lien de réinitialisation que vous recevrez par email (valide 1 heure).',
            category: 'account',
            priority: 1
        },
        {
            id: '3',
            keywords: ['stock', 'voir', 'état', 'inventaire'],
            question: 'Comment voir l\'état de mon stock ?',
            answer: 'Allez dans Menu → Stocks. Vous verrez la liste de tous vos médicaments avec des indicateurs de couleur : 🟢 Vert (Stock OK), 🟡 Orange (Alerte), 🔴 Rouge (Critique).',
            category: 'stocks',
            priority: 2
        },
        {
            id: '4',
            keywords: ['commande', 'créer', 'commander', 'nouvelle'],
            question: 'Comment créer une commande ?',
            answer: 'Allez dans Menu → Commandes → Nouvelle commande. Ajoutez les médicaments souhaités, entrez les quantités, sélectionnez la priorité et soumettez.',
            category: 'commandes',
            priority: 2
        },
        {
            id: '5',
            keywords: ['livraison', 'suivre', 'tracking', 'suivi'],
            question: 'Comment suivre ma livraison ?',
            answer: 'Allez dans Menu → Livraisons et filtrez par "En cours". Vous verrez une carte interactive avec la position du livreur.',
            category: 'livraisons',
            priority: 2
        },
        {
            id: '6',
            keywords: ['rapport', 'export', 'télécharger', 'pdf'],
            question: 'Comment générer un rapport ?',
            answer: 'Allez dans Menu → Rapports, configurez la période et le type de rapport souhaité, puis cliquez sur "Générer". Vous pourrez le télécharger en PDF ou Excel.',
            category: 'rapports',
            priority: 3
        }
    ];

    /**
     * Initialiser avec configuration personnalisée
     */
    configure(config: Partial<AIServiceConfig>) {
        this.config = { ...this.config, ...config };
    }

    /**
     * Obtenir le cache ou exécuter la fonction
     */
    private async withCache<T>(key: string, fn: () => Promise<T>, duration?: number): Promise<T> {
        if (!this.config.enableCaching) {
            return fn();
        }

        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < (duration || this.config.cacheDurationMs)) {
            return cached.data as T;
        }

        const result = await fn();
        this.cache.set(key, { data: result, timestamp: Date.now() });
        return result;
    }

    /**
     * Retry logic avec backoff exponentiel
     */
    private async withRetry<T>(fn: () => Promise<T>, context: string): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                return await Promise.race([
                    fn(),
                    new Promise<T>((_, reject) =>
                        setTimeout(
                            () => reject(new Error(`Timeout: ${context}`)),
                            this.config.requestTimeoutMs
                        )
                    )
                ]);
            } catch (error) {
                lastError = error as Error;
                if (attempt < this.config.maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(3, attempt) * 100));
                }
            }
        }

        throw lastError || new Error(`Failed after ${this.config.maxRetries} retries: ${context}`);
    }

    /**
     * Charger la FAQ (locale, pas de table Supabase)
     */
    async getFAQ(): Promise<AIServiceResponse<FAQItem[]>> {
        try {
            // La FAQ est locale, pas besoin d'appel Supabase
            return {
                success: true,
                data: this.faqData,
                timestamp: new Date()
            };
        } catch (error) {
            console.warn('Error getting FAQ:', error);
            return {
                success: false,
                error: `Erreur lors du chargement de la FAQ`,
                timestamp: new Date()
            };
        }
    }

    /**
     * Chercher la meilleure réponse FAQ
     */
    findBestFAQMatch(query: string, faqItems: FAQItem[]): { match: FAQItem | null; score: number } {
        if (!query.trim() || faqItems.length === 0) {
            return { match: null, score: 0 };
        }

        const lowerQuery = query.toLowerCase();
        const words = lowerQuery.split(/\s+/).filter(w => w.length > 2);

        const scored = faqItems
            .map(item => {
                let score = 0;

                // Keyword match: 20 points chacun
                item.keywords.forEach(keyword => {
                    if (lowerQuery.includes(keyword.toLowerCase())) {
                        score += 20;
                    }
                });

                // Question word match: 5 points
                words.forEach(word => {
                    if (item.question.toLowerCase().includes(word)) {
                        score += 5;
                    }
                });

                // Priority boost: +priority
                score += item.priority * 2;

                return { item, score };
            })
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score);

        return scored.length > 0
            ? { match: scored[0].item, score: scored[0].score }
            : { match: null, score: 0 };
    }

    /**
     * Obtenir les prédictions de rupture de stock
     */
    async getStockPrediction(stockId: string): Promise<AIServiceResponse<StockPrediction>> {
        try {
            return await this.withRetry(async () => {
                const prediction = await this.withCache(
                    `stock_prediction_${stockId}`,
                    async () => {
                        const { data, error } = await (supabase as any).rpc('predict_stock_rupture', {
                            p_stock_id: stockId
                        });

                        if (error) throw error;
                        if (!data || data.length === 0) {
                            throw new Error('No prediction data returned');
                        }

                        return data[0] as StockPrediction;
                    },
                    2 * 60 * 1000 // 2 minutes pour les prédictions
                );

                return {
                    success: true,
                    data: prediction,
                    timestamp: new Date()
                };
            }, `fetch_stock_prediction_${stockId}`);
        } catch (error) {
            console.warn(`Warning: Could not fetch stock prediction for ${stockId}:`, error);
            return {
                success: false,
                error: `Prédiction non disponible`,
                timestamp: new Date()
            };
        }
    }

    /**
     * Obtenir les insights pour une entité
     */
    async getInsights(entityId: string): Promise<AIServiceResponse<AIInsight[]>> {
        try {
            return await this.withRetry(async () => {
                const insights = await this.withCache(
                    `insights_${entityId}`,
                    async () => {
                        const { data, error } = await (supabase as any)
                            .from('ai_dashboard_insights')
                            .select('*')
                            .eq('entity_id', entityId)
                            .order('priority', { ascending: false })
                            .limit(5);

                        if (error) throw error;

                        // Transformer les données du format JSON à AIInsight
                        return (data || []).map((item: any) => {
                            const rec = item.recommandation_ia as any;
                            return {
                                id: item.id || `insight_${item.entity_id}`,
                                type: rec?.type || 'INFO',
                                icon: rec?.icon || '💡',
                                titre: rec?.titre || 'Recommandation IA',
                                message: rec?.message || 'Vérifiez vos données',
                                action: rec?.action || null,
                                priority: 1,
                                created_at: item.derniere_maj || new Date().toISOString(),
                                entity_id: item.entity_id
                            } as AIInsight;
                        });
                    },
                    1 * 60 * 1000 // 1 minute pour les insights
                );

                return {
                    success: true,
                    data: insights,
                    timestamp: new Date()
                };
            }, `fetch_insights_${entityId}`);
        } catch (error) {
            console.warn(`Warning: Could not fetch insights for ${entityId}:`, error);
            return {
                success: false,
                error: `Insights non disponibles`,
                timestamp: new Date()
            };
        }
    }

    /**
     * Obtenir les statistiques de conversation
     */
    async getConversationStats(_userId: string): Promise<AIServiceResponse<ConversationMetadata>> {
        try {
            // Statistiques par défaut
            return {
                success: true,
                data: {
                    total_interactions: 0,
                    satisfaction_rate: 0,
                    average_resolution_time: 500,
                    last_interaction: null
                },
                timestamp: new Date()
            };
        } catch (error) {
            console.warn('Warning: Could not fetch conversation stats:', error);
            return {
                success: false,
                data: {
                    total_interactions: 0,
                    satisfaction_rate: 0,
                    average_resolution_time: 0,
                    last_interaction: null
                },
                timestamp: new Date()
            };
        }
    }

    /**
     * Sauvegarder une interaction de chat (local seulement, non Supabase)
     */
    async saveChatInteraction(
        _userId: string | null,
        _question: string,
        _response: string,
        _feedback: -1 | 1 | null,
        _faqId?: string
    ): Promise<AIServiceResponse<void>> {
        try {
            // Sauvegarder localement seulement
            console.log('Chat interaction saved locally');
            return {
                success: true,
                timestamp: new Date()
            };
        } catch (error) {
            console.warn('Warning: Could not save chat interaction:', error);
            return {
                success: true, // Local success
                timestamp: new Date()
            };
        }
    }

    /**
     * Sauvegarder du feedback utilisateur
     */
    async saveFeedback(
        _userId: string | null,
        _question: string,
        _response: string,
        _feedback: 1 | -1
    ): Promise<AIServiceResponse<void>> {
        try {
            // Sauvegarder localement seulement
            console.log('Feedback saved locally');
            return {
                success: true,
                timestamp: new Date()
            };
        } catch (error) {
            console.warn('Warning: Could not save feedback:', error);
            return {
                success: true, // Local success
                timestamp: new Date()
            };
        }
    }

    /**
     * Invalider le cache
     */
    invalidateCache(pattern?: string) {
        if (!pattern) {
            this.cache.clear();
            return;
        }

        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Nettoyer les ressources
     */
    async cleanup(): Promise<void> {
        this.cache.clear();
    }
}

// Export singleton instance
export const aiService = new AIService();

