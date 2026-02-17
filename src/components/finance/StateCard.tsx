
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StateCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
    icon: React.ElementType;
    className?: string;
}

const StateCard: React.FC<StateCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    icon: Icon,
    className
}) => {
    return (
        <Card className={cn("overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300", className)}>
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                        <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                    {trend && (
                        <div className={cn(
                            "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                            trend.direction === 'up' ? "bg-green-100 text-green-700" :
                                trend.direction === 'down' ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-700"
                        )}>
                            {trend.direction === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                            {trend.direction === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                            {trend.direction === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
                            {trend.value}%
                        </div>
                    )}
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
            </CardContent>
        </Card>
    );
};

export default StateCard;
