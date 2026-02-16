import KPICard from '@/components/dashboard/KPICard';
import AlertList, { Alert } from '@/components/dashboard/AlertList';
import StatsChart from '@/components/dashboard/StatsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRegionalData } from '@/hooks/useRegionalData';
import { useNavigate } from 'react-router-dom';
import {
    Package, AlertTriangle, Building, TrendingUp, MapPin, Percent
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function RegionalDashboard() {
    const { data, isLoading } = useRegionalData();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="space-y-4 animate-fade-in p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Dashboard Régional</h1>
                        <p className="text-sm text-muted-foreground mt-1">Vue DRS</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <KPICard key={i} title="Chargement..." value="—" icon={Package} loading />
                    ))}
                </div>
            </div>
        );
    }

    const stats = data?.stats;
    const drs = data?.drs;

    // Générer les alertes des DPS
    const alerts: Alert[] = (data?.dpsPerformance || [])
        .filter((d) => d.alertes > 0)
        .slice(0, 5)
        .map((d) => ({
            id: d.dpsId,
            type: 'stock' as const,
            severity: d.alertes > 10 ? 'high' as const : 'medium' as const,
            message: `${d.dpsName}: ${d.alertes} alerte${d.alertes > 1 ? 's' : ''} stock`,
            timestamp: new Date().toISOString(),
            entityName: drs?.nom
        }));

    // Données pour graphique performance DPS
    const performanceData = (data?.dpsPerformance || []).map((d) => ({
        name: d.dpsName?.slice(0, 10) || 'DPS',
        performance: Math.round(d.performance)
    }));

    return (
        <div className="space-y-6 animate-fade-in p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Dashboard Régional</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {drs?.nom || 'Ma Région'}
                        {drs?.region && (
                            <Badge variant="outline" className="ml-2 text-xs">
                                DRS {drs.region}
                            </Badge>
                        )}
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="DPS de la Région"
                    value={stats?.dpsCount || 0}
                    icon={Building}
                    variant="default"
                />
                <KPICard
                    title="Total Stocks Région"
                    value={stats?.totalStocks || 0}
                    icon={Package}
                    variant="info"
                />
                <KPICard
                    title="Alertes Régionales"
                    value={stats?.alertes || 0}
                    icon={AlertTriangle}
                    variant={(stats?.alertes || 0) > 20 ? 'danger' : (stats?.alertes || 0) > 0 ? 'warning' : 'success'}
                />
                <KPICard
                    title="Commandes Région"
                    value={stats?.totalCommandes || 0}
                    icon={TrendingUp}
                    variant="success"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique Stocks par DPS */}
                <StatsChart
                    data={performanceData}
                    title="Performance des DPS"
                    type="bar"
                    dataKey="performance"
                    xAxisKey="name"
                    color="#059669"
                    icon={Percent}
                    height={280}
                />

                {/* Alertes */}
                <AlertList
                    alerts={alerts}
                    maxItems={6}
                    showEmpty
                />
            </div>

            {/* Tableau des DPS */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        DPS de la Région
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(!data?.dps || data.dps.length === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Aucune DPS enregistrée
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">DPS</TableHead>
                                    <TableHead className="text-xs text-right">Stocks</TableHead>
                                    <TableHead className="text-xs text-right">Alertes</TableHead>
                                    <TableHead className="text-xs">Performance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data.dpsPerformance || []).map((dps) => (
                                    <TableRow key={dps.dpsId} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="text-xs font-medium">
                                            {dps.dpsName}
                                        </TableCell>
                                        <TableCell className="text-xs text-right font-medium">
                                            {dps.stocks}
                                        </TableCell>
                                        <TableCell className="text-xs text-right">
                                            {dps.alertes > 0 ? (
                                                <Badge variant="destructive" className="text-[10px]">
                                                    {dps.alertes}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px]">0</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <div className="flex items-center gap-2">
                                                <Progress value={dps.performance} className="h-2 w-20" />
                                                <span className="text-[10px] text-muted-foreground font-medium w-8">
                                                    {Math.round(dps.performance)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
