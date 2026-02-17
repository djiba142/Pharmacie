import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { aiService } from '@/services/aiService';
import type { AIInsight, AIServiceResponse } from '@/types/ai';

export function AIInsightsCard() {
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useAuthStore(s => s.user);
    const userEntity = useAuthStore(s => s.user?.entity_id);
    const navigate = useNavigate();

    // Charger les insights au démarrage
    useEffect(() => {
        if (!userEntity) {
            setIsLoading(false);
            return;
        }

        const fetchInsights = async () => {
            try {
                setError(null);
                const response = await aiService.getInsights(userEntity);
                
                if (response.success && response.data) {
                    setInsights(response.data);
                } else {
                    // Insights non disponibles: fallback silencieux
                    setInsights([]);
                }
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsights();

        // Rafraîchir tous les 5 minutes
        const interval = setInterval(fetchInsights, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [userEntity]);

    const handleAction = useCallback(async (insight: AIInsight) => {
        try {
            if (!insight.action) return;

            // Tracker l'action
            await aiService.trackAnalytics({
                event_type: 'action_taken',
                user_id: user?.id || null,
                entity_id: userEntity,
                data: { insight_id: insight.id, action: insight.action },
                timestamp: new Date()
            });

            // Effectuer l'action
            switch (insight.action) {
                case 'VIEW_LOW_STOCKS':
                    navigate('/stocks?filter=low');
                    break;
                case 'VIEW_EXPIRING':
                    navigate('/stocks?filter=expiring');
                    break;
                case 'VIEW_COMMANDES':
                    navigate('/commandes');
                    break;
                case 'VIEW_FINANCE':
                    navigate('/finance/accounting');
                    break;
                case 'VIEW_DELIVERIES':
                    navigate('/livraisons');
                    break;
                default:
                    // Unknown action: silently ignore unknown insight actions
            }
        } catch (err) {
            // Silently fail on action tracking
        }
    }, [user?.id, userEntity, navigate]);

    if (isLoading) {
        return (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <CardTitle className="text-base">Assistant IA</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-16 bg-muted/50 animate-pulse rounded-md" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-base">Assistant IA</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-muted-foreground">Erreur lors du chargement des insights</p>
                </CardContent>
            </Card>
        );
    }

    if (insights.length === 0) {
        return null;
    }

    // Afficher le premier insight (priorité plus haute)
    const primaryInsight = insights[0];

    const bgColor = {
        URGENT: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
        WARNING: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
        INFO: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
        SUCCESS: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    }[primaryInsight.type] || 'bg-muted/50';

    return (
        <Card className={`${bgColor} border-2`}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">🤖 Recommandation IA</CardTitle>
                </div>
                {insights.length > 1 && (
                    <CardDescription className="text-xs">
                        +{insights.length - 1} {insights.length > 2 ? 'autres recommandations' : 'autre recommandation'}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                    <span className="text-3xl" role="img" aria-label={primaryInsight.type}>
                        {primaryInsight.icon}
                    </span>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{primaryInsight.titre}</p>
                        <p className="text-xs text-muted-foreground mt-1">{primaryInsight.message}</p>
                    </div>
                </div>

                {primaryInsight.action && (
                    <Button
                        onClick={() => handleAction(primaryInsight)}
                        size="sm"
                        variant="default"
                        className="w-full group"
                    >
                        Voir détails
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
                    </span>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{insight.titre}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                    </div>
                </div>

                {insight.action && (
                    <Button
                        onClick={handleAction}
                        size="sm"
                        variant="default"
                        className="w-full group"
                    >
                        Voir détails
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
