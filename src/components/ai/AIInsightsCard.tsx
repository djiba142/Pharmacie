import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

interface AIInsight {
    type: string;
    icon: string;
    titre: string;
    message: string;
    action: string | null;
}

export function AIInsightsCard() {
    const [insight, setInsight] = useState<AIInsight | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const user = useAuthStore(s => s.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.entity_id) return;

        const fetchInsight = async () => {
            try {
                const { data, error } = await supabase
                    .from('ai_dashboard_insights')
                    .select('recommandation_ia')
                    .eq('entity_id', user.entity_id)
                    .single();

                if (error) throw error;
                setInsight(data?.recommandation_ia as AIInsight);
            } catch (err) {
                console.error('Error fetching AI insight:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsight();
    }, [user?.entity_id]);

    const handleAction = () => {
        if (!insight?.action) return;

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
            default:
                break;
        }
    };

    if (isLoading) {
        return (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <CardTitle className="text-base">IA Assistant</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-16 bg-muted/50 animate-pulse rounded-md" />
                </CardContent>
            </Card>
        );
    }

    if (!insight) return null;

    const bgColor = {
        URGENT: 'bg-red-50 dark:bg-red-950/20 border-red-200',
        WARNING: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200',
        INFO: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200',
        SUCCESS: 'bg-green-50 dark:bg-green-950/20 border-green-200',
    }[insight.type] || 'bg-muted/50';

    return (
        <Card className={`${bgColor} border-2`}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">🤖 Recommandation IA</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                    <span className="text-3xl" role="img" aria-label={insight.type}>
                        {insight.icon}
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
