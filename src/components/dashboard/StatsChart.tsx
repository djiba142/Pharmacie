import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface StatsChartProps {
    data: Array<Record<string, any>>;
    title: string;
    type?: 'line' | 'bar' | 'area';
    dataKey: string;
    xAxisKey: string;
    color?: string;
    icon?: LucideIcon;
    height?: number;
    showLegend?: boolean;
    loading?: boolean;
}

export default function StatsChart({
    data,
    title,
    type = 'line',
    dataKey,
    xAxisKey,
    color = '#0d9488',
    icon: Icon,
    height = 300,
    showLegend = false,
    loading = false
}: StatsChartProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full animate-pulse" style={{ height }}>
                        <div className="h-full bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="flex items-center justify-center text-sm text-muted-foreground"
                        style={{ height }}
                    >
                        Aucune donnée disponible
                    </div>
                </CardContent>
            </Card>
        );
    }

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 5, right: 10, left: 0, bottom: 5 }
        };

        switch (type) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey={xAxisKey}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        {showLegend && <Legend />}
                        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey={xAxisKey}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        {showLegend && <Legend />}
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fillOpacity={1}
                            fill="url(#colorGradient)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                );

            case 'line':
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey={xAxisKey}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        {showLegend && <Legend />}
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ fill: color, r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    </LineChart>
                );
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-primary" />}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    {renderChart()}
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
