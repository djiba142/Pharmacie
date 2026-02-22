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
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface StatsChartProps {
    data: Array<Record<string, unknown>>;
    title: string;
    type?: 'line' | 'bar' | 'area' | 'pie';
    dataKey: string;
    xAxisKey?: string;
    color?: string;
    icon?: LucideIcon;
    height?: number;
    showLegend?: boolean;
    loading?: boolean;
}

const COLORS = ['#0d9488', '#0ea5e9', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f59e0b'];

export default function StatsChart({
    data,
    title,
    type = 'line',
    dataKey,
    xAxisKey = 'name',
    color = '#0d9488',
    icon: Icon,
    height = 300,
    showLegend = false,
    loading = false
}: StatsChartProps) {
    if (loading) {
        return (
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-display font-bold flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full animate-pulse space-y-3" style={{ height }}>
                        <div className="h-full bg-slate-100 rounded-xl" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-display font-bold flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="flex items-center justify-center text-sm text-muted-foreground italic"
                        style={{ height }}
                    >
                        Aucune donnée disponible
                    </div>
                </CardContent>
            </Card>
        );
    }

    interface TooltipPayload {
        color: string;
        value: number;
    }

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-xl shadow-xl shadow-slate-200/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color || color }} />
                        <p className="text-sm font-bold text-slate-900">
                            {payload[0].value.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">Unités</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 10, right: 10, left: -20, bottom: 0 }
        };

        switch (type) {
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey={dataKey}
                            nameKey={xAxisKey}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            animationBegin={0}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend verticalAlign="bottom" height={36} />}
                    </PieChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey={xAxisKey}
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        <Bar
                            dataKey={dataKey}
                            fill={color}
                            radius={[6, 6, 0, 0]}
                            barSize={30}
                            animationDuration={1500}
                        />
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id={`colorGradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey={xAxisKey}
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            fillOpacity={1}
                            fill={`url(#colorGradient-${title})`}
                            strokeWidth={3}
                            animationDuration={2000}
                        />
                    </AreaChart>
                );

            case 'line':
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey={xAxisKey}
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && <Legend />}
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ fill: color, r: 4, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={2000}
                        />
                    </LineChart>
                );
        }
    };

    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-display font-bold flex items-center gap-2 text-slate-700">
                    <div className="p-1.5 rounded-lg bg-slate-50 group-hover:scale-110 transition-transform duration-300">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
                <div style={{ width: '100%', height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

