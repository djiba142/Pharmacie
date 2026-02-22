import KPICard from '@/components/dashboard/KPICard';
import AlertList, { Alert } from '@/components/dashboard/AlertList';
import StatsChart from '@/components/dashboard/StatsChart';
import GuineaMap from '@/components/dashboard/GuineaMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNationalData } from '@/hooks/useNationalData';
import { useNavigate } from 'react-router-dom';
import {
    Package, AlertTriangle, TrendingDown, TrendingUp, MapIcon, Users
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function NationalDashboard() {
    const { data, isLoading } = useNationalData();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="space-y-4 animate-fade-in p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Dashboard National</h1>
                        <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble - République de Guinée</p>
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

    // Générer des alertes régionales
    const alerts: Alert[] = (data?.regionPerformance || [])
        .filter((r) => r.performance < 70)
        .slice(0, 5)
        .map((r) => ({
            id: r.regionName,
            type: 'stock' as const,
            severity: r.performance < 50 ? 'high' as const : 'medium' as const,
            message: `Région ${r.regionName}: Performance faible (${Math.round(r.performance)}%)`,
            timestamp: new Date().toISOString(),
            entityName: 'National'
        }));

    // Ajouter alertes critiques stock
    if ((stats?.alertes || 0) > 50) {
        alerts.unshift({
            id: 'national-stock-alert',
            type: 'stock' as const,
            severity: 'critical' as const,
            message: `${stats?.alertes} alertes stock au niveau national`,
            timestamp: new Date().toISOString(),
            entityName: 'National'
        });
    }

    // Données pour graphique performance régionale
    const performanceData = (data?.regionPerformance || []).map((r) => ({
        name: r.regionName,
        performance: Math.round(r.performance)
    }));

    // Données pour graphique évolution stocks (simulation)
    const evolutionData = [
        { mois: 'Jan', stocks: 8000 },
        { mois: 'Fév', stocks: 8500 },
        { mois: 'Mar', stocks: 9200 },
        { mois: 'Avr', stocks: 8800 },
        { mois: 'Mai', stocks: 9500 },
        { mois: 'Jun', stocks: stats?.totalStocks || 9000 }
    ];

    return (
        <div className="space-y-6 animate-fade-in p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Dashboard National</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        <MapIcon className="h-3 w-3 inline mr-1" />
                        Vue d'ensemble - République de Guinée
                        <Badge variant="outline" className="ml-2 text-xs">
                            {data?.drs?.length || 8} DRS
                        </Badge>
                    </p>
                </div>
            </div>

            {/* KPIs Nationaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                    title="Total Stocks National"
                    value={stats?.totalStocks || 0}
                    icon={Package}
                    variant="default"
                    trend="up"
                    trendValue="+5.2%"
                />
                <KPICard
                    title="Alertes Nationales"
                    value={stats?.alertes || 0}
                    icon={AlertTriangle}
                    variant={(stats?.alertes || 0) > 50 ? 'danger' : (stats?.alertes || 0) > 20 ? 'warning' : 'success'}
                    trend={(stats?.alertes || 0) > 30 ? 'up' : 'down'}
                    trendValue={(stats?.alertes || 0) > 30 ? '+12%' : '-8%'}
                />
                <KPICard
                    title="Utilisateurs Actifs"
                    value={stats?.activeUsers || 0}
                    icon={Users}
                    variant="info"
                />
                <KPICard
                    title="Commandes Nationales"
                    value={stats?.totalCommandes || 0}
                    icon={TrendingUp}
                    variant="default"
                    trend="up"
                    trendValue="+3.1%"
                />
                <KPICard
                    title="Livraisons Actives"
                    value={stats?.totalLivraisons || 0}
                    icon={TrendingDown}
                    variant="success"
                />
            </div>

            {/* Carte Interactive */}
            <GuineaMap />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graphique Performance Régionale */}
                <StatsChart
                    data={performanceData}
                    title="Performance Moyenne"
                    type="bar"
                    dataKey="performance"
                    xAxisKey="name"
                    color="#0d9488"
                    icon={MapIcon}
                    height={280}
                />

                {/* Graphique Distribution Stocks */}
                <StatsChart
                    data={performanceData.map(r => ({ name: r.name, value: Math.floor(Math.random() * 5000) + 1000 }))}
                    title="Distribution des Stocks"
                    type="pie"
                    dataKey="value"
                    xAxisKey="name"
                    height={280}
                    showLegend
                />

                {/* Graphique Évolution Stocks */}
                <StatsChart
                    data={evolutionData}
                    title="Évolution Globale"
                    type="area"
                    dataKey="stocks"
                    xAxisKey="mois"
                    color="#6366f1"
                    icon={TrendingUp}
                    height={280}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tableau Performance DRS */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-display flex items-center gap-2">
                                <MapIcon className="h-4 w-4 text-primary" />
                                Performance des Régions (DRS)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(!data?.regionPerformance || data.regionPerformance.length === 0) ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Aucune donnée régionale
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-xs">Région</TableHead>
                                            <TableHead className="text-xs text-right">Stocks</TableHead>
                                            <TableHead className="text-xs text-right">Commandes</TableHead>
                                            <TableHead className="text-xs">Performance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.regionPerformance.map((region) => (
                                            <TableRow
                                                key={region.regionName}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate('/drs')}
                                            >
                                                <TableCell className="text-xs font-medium">
                                                    {region.regionName}
                                                </TableCell>
                                                <TableCell className="text-xs text-right font-medium">
                                                    {region.stocks.toLocaleString('fr-FR')}
                                                </TableCell>
                                                <TableCell className="text-xs text-right">
                                                    {region.commandes}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Progress
                                                            value={region.performance}
                                                            className="h-2 w-24"
                                                        />
                                                        <span className="text-[10px] text-muted-foreground font-medium w-8">
                                                            {Math.round(region.performance)}%
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

                {/* Alertes Nationales */}
                <div className="lg:col-span-1">
                    <AlertList
                        alerts={alerts}
                        maxItems={7}
                        showEmpty
                    />
                </div>
            </div>
        </div>
    );
}
