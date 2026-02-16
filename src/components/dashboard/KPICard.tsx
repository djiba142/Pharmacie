import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    loading?: boolean;
}

const variantStyles = {
    default: {
        bg: 'bg-primary/10',
        iconColor: 'text-primary',
        textColor: 'text-foreground'
    },
    success: {
        bg: 'bg-green-100',
        iconColor: 'text-green-600',
        textColor: 'text-green-700'
    },
    warning: {
        bg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-700'
    },
    danger: {
        bg: 'bg-red-100',
        iconColor: 'text-red-600',
        textColor: 'text-red-700'
    },
    info: {
        bg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-700'
    }
};

const trendIcons = {
    up: ArrowUp,
    down: ArrowDown,
    stable: Minus
};

const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-muted-foreground'
};

export default function KPICard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    variant = 'default',
    loading = false
}: KPICardProps) {
    const styles = variantStyles[variant];
    const TrendIcon = trend ? trendIcons[trend] : null;

    if (loading) {
        return (
            <Card className="stat-card">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${styles.bg} animate-pulse`} />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-muted rounded animate-pulse w-20" />
                            <div className="h-6 bg-muted rounded animate-pulse w-16" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="stat-card hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${styles.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${styles.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium truncate">
                            {title}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <p className={`text-xl font-bold font-display ${styles.textColor}`}>
                                {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
                            </p>
                            {trend && TrendIcon && trendValue && (
                                <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColors[trend]}`}>
                                    <TrendIcon className="h-3 w-3" />
                                    <span>{trendValue}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
