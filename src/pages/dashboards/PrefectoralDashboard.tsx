import KPICard from '@/components/dashboard/KPICard';
import AlertList, { Alert } from '@/components/dashboard/AlertList';
import StatsChart from '@/components/dashboard/StatsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePrefectoralData } from '@/hooks/usePrefectoralData';
import { useNavigate } from 'react-router-dom';
import {
    Package, AlertTriangle, Building2, TrendingUp, MapPin, Users
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PrefectoralDashboard() {
    const { data, isLoading } = usePrefectoralData();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="space-y-4 animate-fade-in p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Dashboard Préfectoral</h1>
                        <p className="text-sm text-muted-foreground mt-1">Vue DPS</p>
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
    const dps = data?.dps;

    // Générer les alertes des structures
    const alerts: Alert[] = (data?.structurePerformance || [])
        .filter((struct) => struct.alertes > 0)
        .slice(0, 5)
        .map((struct) => ({
            id: struct.structureId,
            type: 'stock' as const,
            severity: struct.alertes > 5 ? 'high' as const : 'medium' as const,
            message: `${struct.structureName}: ${struct.alertes} alerte${struct.alertes > 1 ? 's' : ''} stock`,
            timestamp: new Date().toISOString(),
            entityName: dps?.nom
        }));

    // Données pour graphique
    const chartData = (data?.structures || []).slice(0, 10).map((struct) => ({
        name: struct.nom?.slice(0, 15) || 'Structure',
        stocks: (data?.stocks || []).filter((s) => s.entite_id === struct.id).length
    }));

    return (
        <div className="space-y-6 animate-fade-in p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Dashboard Préfectoral</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {dps?.nom || 'Ma DPS'}
                        {dps?.prefecture && (
                            <Badge variant="outline" className="ml-2 text-xs">
                                {dps.prefecture}
                            </Badge>
                        )}
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                    title="Structures"
                    value={stats?.structuresCount || 0}
                    icon={Building2}
                    variant="default"
                />
                <KPICard
                    title="Médicaments"
                    value={stats?.totalStocks || 0}
                    icon={Package}
                    variant="info"
                />
                <KPICard
                    title="Alertes"
                    value={stats?.alertes || 0}
                    icon={AlertTriangle}
                    variant={(stats?.alertes || 0) > 10 ? 'danger' : (stats?.alertes || 0) > 0 ? 'warning' : 'success'}
                />
                <KPICard
                    title="Utilisateurs"
                    value={stats?.activeUsers || 0}
                    icon={Users}
                    variant="default"
                />
                <KPICard
                    title="Commandes"
                    value={stats?.totalCommandes || 0}
                    icon={TrendingUp}
                    variant="success"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graphique Stocks par Structure */}
                <StatsChart
                    data={chartData}
                    title="Stocks par Structure"
                    type="bar"
                    dataKey="stocks"
                    xAxisKey="name"
                    color="#0ea5e9"
                    icon={Package}
                    height={280}
                />

                {/* Distribution Performance */}
                <StatsChart
                    data={(data?.structurePerformance || []).slice(0, 5).map(s => ({ name: s.structureName, value: s.performance }))}
                    title="Répartition Performance"
                    type="pie"
                    dataKey="value"
                    xAxisKey="name"
                    height={280}
                    showLegend
                />

                {/* Alertes */}
                <AlertList
                    alerts={alerts}
                    maxItems={6}
                    showEmpty
                />
            </div>

            {/* Tableau des Structures */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Structures de la Préfecture
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(!data?.structures || data.structures.length === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Aucune structure enregistrée
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Nom</TableHead>
                                    <TableHead className="text-xs">Type</TableHead>
                                    <TableHead className="text-xs text-right">Stocks</TableHead>
                                    <TableHead className="text-xs text-right">Alertes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data.structurePerformance || []).map((struct) => (
                                    <TableRow key={struct.structureId} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="text-xs font-medium">{struct.structureName}</TableCell>
                                        <TableCell className="text-xs">
                                            <Badge variant="outline" className="text-[10px]">
                                                {struct.type || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-right font-medium">
                                            {struct.stocks}
                                        </TableCell>
                                        <TableCell className="text-xs text-right">
                                            {struct.alertes > 0 ? (
                                                <Badge variant="destructive" className="text-[10px]">
                                                    {struct.alertes}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-[10px]">0</Badge>
                                            )}
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
