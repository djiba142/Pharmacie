import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface Alert {
    id: string;
    type: 'stock' | 'peremption' | 'commande' | 'livraison' | 'pharmacovigilance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    entityName?: string;
    actionUrl?: string;
}

interface AlertListProps {
    alerts: Alert[];
    maxItems?: number;
    showEmpty?: boolean;
    onViewAll?: () => void;
}

const severityConfig = {
    low: {
        icon: CheckCircle2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        badgeVariant: 'secondary' as const
    },
    medium: {
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        badgeVariant: 'secondary' as const
    },
    high: {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeVariant: 'destructive' as const
    },
    critical: {
        icon: AlertTriangle,
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        badgeVariant: 'destructive' as const
    }
};

const typeLabels = {
    stock: 'Stock',
    peremption: 'Péremption',
    commande: 'Commande',
    livraison: 'Livraison',
    pharmacovigilance: 'Pharmacovigilance'
};

export default function AlertList({
    alerts,
    maxItems = 5,
    showEmpty = true,
    onViewAll
}: AlertListProps) {
    const displayAlerts = alerts.slice(0, maxItems);

    if (alerts.length === 0 && showEmpty) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Alertes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mb-3 opacity-50" />
                        <p className="text-sm font-medium text-muted-foreground">
                            Aucune alerte active
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tout fonctionne normalement
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        Alertes
                        {alerts.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {alerts.length}
                            </Badge>
                        )}
                    </CardTitle>
                    {onViewAll && alerts.length > maxItems && (
                        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">
                            Voir tout
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {displayAlerts.map((alert) => {
                        const config = severityConfig[alert.severity];
                        const Icon = config.icon;

                        return (
                            <div
                                key={alert.id}
                                className={`flex gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} transition-colors hover:shadow-sm`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <Badge variant={config.badgeVariant} className="text-[10px] px-1.5 py-0">
                                            {typeLabels[alert.type]}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {new Date(alert.timestamp).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-foreground leading-tight">
                                        {alert.message}
                                    </p>
                                    {alert.entityName && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {alert.entityName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {alerts.length > maxItems && !onViewAll && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                        +{alerts.length - maxItems} autre{alerts.length - maxItems > 1 ? 's' : ''} alerte{alerts.length - maxItems > 1 ? 's' : ''}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
