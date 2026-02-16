import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface StockPrediction {
    jours_avant_rupture: number;
    date_rupture_prevue: string;
    quantite_a_commander: number;
    urgence: string;
    confiance: number;
}

interface Props {
    stockId: string;
}

export function StockPredictionBadge({ stockId }: Props) {
    const [prediction, setPrediction] = useState<StockPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const { data, error } = await supabase
                    .rpc('predict_stock_rupture', { p_stock_id: stockId });

                if (error) throw error;
                if (data && data.length > 0) {
                    setPrediction(data[0]);
                }
            } catch (err) {
                console.error('Error fetching prediction:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrediction();
    }, [stockId]);

    if (isLoading || !prediction) return null;

    const { urgence, jours_avant_rupture, date_rupture_prevue, quantite_a_commander, confiance } = prediction;

    const urgenceConfig = {
        RUPTURE: {
            variant: 'destructive' as const,
            icon: AlertTriangle,
            label: 'En rupture',
            className: 'bg-red-600 hover:bg-red-700'
        },
        CRITIQUE: {
            variant: 'destructive' as const,
            icon: TrendingDown,
            label: `${jours_avant_rupture}j restants`,
            className: 'bg-orange-600 hover:bg-orange-700'
        },
        ALERTE: {
            variant: 'secondary' as const,
            icon: Clock,
            label: `${jours_avant_rupture}j restants`,
            className: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        },
        OK: {
            variant: 'outline' as const,
            icon: Clock,
            label: `${jours_avant_rupture}j`,
            className: 'border-green-600 text-green-700'
        }
    };

    const config = urgenceConfig[urgence as keyof typeof urgenceConfig] || urgenceConfig.OK;
    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-medium">{config.label}</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className="space-y-1 text-xs">
                        <p className="font-semibold">🤖 Prédiction IA:</p>
                        <p>• Rupture prévue: <span className="font-mono">{new Date(date_rupture_prevue).toLocaleDateString('fr-FR')}</span></p>
                        <p>• Recommandation: Commander <strong>{quantite_a_commander}</strong> unités</p>
                        <p className="text-muted-foreground">• Confiance: {confiance}%</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
