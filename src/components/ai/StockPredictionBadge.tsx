import { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { aiService } from '@/services/aiService';
import type { StockPrediction, UrgenceLevel } from '@/types/ai';

interface Props {
    stockId: string;
}

export function StockPredictionBadge({ stockId }: Props) {
    const [prediction, setPrediction] = useState<StockPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                setError(null);
                const response = await aiService.getStockPrediction(stockId);

                if (response.success && response.data) {
                    setPrediction(response.data);
                } else {
                    // Erreur non-bloquante - pas d'affichage si indisponible
                    setPrediction(null);
                }
            } catch (err) {
                setError((err as Error).message);
                setPrediction(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrediction();

        // Rafraîchir toutes les 10 minutes
        const interval = setInterval(fetchPrediction, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [stockId]);

    const urgenceConfig = useMemo(() => ({
        RUPTURE: {
            variant: 'destructive' as const,
            icon: AlertTriangle,
            label: '🔴 Rupture',
            className: 'bg-red-600 hover:bg-red-700 text-white',
            bgColor: 'bg-red-50 dark:bg-red-950/20'
        },
        CRITIQUE: {
            variant: 'destructive' as const,
            icon: TrendingDown,
            label: (jours: number) => `🟠 ${jours}j restant${jours > 1 ? 's' : ''}`,
            className: 'bg-orange-600 hover:bg-orange-700 text-white',
            bgColor: 'bg-orange-50 dark:bg-orange-950/20'
        },
        ALERTE: {
            variant: 'secondary' as const,
            icon: Clock,
            label: (jours: number) => `🟡 ${jours}j`,
            className: 'bg-yellow-600 hover:bg-yellow-700 text-white',
            bgColor: 'bg-yellow-50 dark:bg-yellow-950/20'
        },
        OK: {
            variant: 'outline' as const,
            icon: Clock,
            label: (jours: number) => `🟢 ${jours}j`,
            className: 'border-green-600 text-green-700 dark:text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-950/20'
        }
    }), []);

    if (isLoading) {
        return null; // Pas d'affichage pendant le chargement
    }

    if (error || !prediction) {
        return null; // Pas d'affichage en cas d'erreur (non-bloquant)
    }

    const { urgence, jours_avant_rupture, date_rupture_prevue, quantite_a_commander, confiance } = prediction;

    const config = urgenceConfig[urgence as UrgenceLevel] || urgenceConfig.OK;
    const Icon = config.icon;
    const labelText = typeof config.label === 'function'
        ? config.label(jours_avant_rupture)
        : config.label;

    // Déterminer la couleur de confiance
    const confidenceColor = confiance >= 80 ? 'text-green-600' : confiance >= 60 ? 'text-yellow-600' : 'text-orange-600';

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant={config.variant} className={`gap-1.5 ${config.className} cursor-help`}>
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-medium">{labelText}</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <div className={`space-y-2 text-xs p-2 rounded ${config.bgColor}`}>
                        <div className="font-semibold flex items-center gap-1">
                            <span>🤖 Prédiction IA</span>
                            <span className={`text-[10px] font-mono ${confidenceColor}`}>
                                ({confiance}% confiance)
                            </span>
                        </div>
                        <div className="space-y-1 border-t border-border/30 pt-2">
                            <p>
                                <strong>📅 Rupture prévue:</strong>{' '}
                                <span className="font-mono">
                                    {new Date(date_rupture_prevue).toLocaleDateString('fr-FR')}
                                </span>
                            </p>
                            <p>
                                <strong>🛒 Commander:</strong>{' '}
                                <span className="font-semibold text-base">{quantite_a_commander}</span> unités
                            </p>
                            <p className="text-muted-foreground italic">
                                💡 Recommendation: passer commande maintenant
                            </p>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
