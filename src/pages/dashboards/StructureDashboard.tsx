import KPICard from '@/components/dashboard/KPICard';
import AlertList, { Alert } from '@/components/dashboard/AlertList';
import QuickActions, { QuickAction } from '@/components/dashboard/QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStructureData } from '@/hooks/useStructureData';
import { useNavigate } from 'react-router-dom';
import {
    Package, AlertTriangle, Clock, ShoppingCart, TrendingUp, FileText, Plus
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StructureDashboard() {
    const { data, isLoading } = useStructureData();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="space-y-4 animate-fade-in p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-display font-bold">Mon Dashboard</h1>
                        <p className="text-sm text-muted-foreground mt-1">Vue de ma structure</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <KPICard
                            key={i}
                            title="Chargement..."
                            value="—"
                            icon={Package}
                            loading
                        />
                    ))}
                </div>
            </div>
        );
    }

    const stats = data?.stats;
    const structure = data?.structure;

    // Générer les alertes spécifiques à la structure
    const alerts: Alert[] = [
        ...(data?.alertStocks || []).slice(0, 3).map((stock) => ({
            id: stock.id,
            type: 'stock' as const,
            severity: 'high' as const,
            message: `Stock faible: ${stock.nom || 'Médicament'} (${stock.quantite_actuelle} restant${stock.quantite_actuelle > 1 ? 's' : ''})`,
            timestamp: stock.updated_at || new Date().toISOString(),
            entityName: structure?.nom
        })),
        ...(data?.expiringStocks || []).slice(0, 2).map((stock) => ({
            id: stock.id,
            type: 'peremption' as const,
            severity: 'medium' as const,
            message: `Péremption proche: ${stock.nom || 'Médicament'} (${new Date(stock.date_peremption).toLocaleDateString('fr-FR')})`,
            timestamp: stock.date_peremption,
            entityName: structure?.nom
        }))
    ];

    // Actions rapides pour la structure
    const quickActions: QuickAction[] = [
        {
            label: 'Nouvelle Commande',
            icon: Plus,
            onClick: () => navigate('/commandes'),
            variant: 'default'
        },
        {
            label: 'Consulter Stock',
            icon: Package,
            onClick: () => navigate('/stocks'),
            variant: 'outline'
        },
        {
            label: 'Mes Livraisons',
            icon: TrendingUp,
            onClick: () => navigate('/livraisons'),
            variant: 'outline'
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in p-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold">Mon Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {structure?.nom || 'Ma structure'}
                        {structure?.type && (
                            <Badge variant="outline" className="ml-2 text-xs">
                                {structure.type}
                            </Badge>
                        )}
                    </p>
                </div>
            </div>

            {/* KPIs Principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Médicaments en Stock"
                    value={stats?.totalStocks || 0}
                    icon={Package}
                    variant="default"
                />
                <KPICard
                    title="Alertes Stock"
                    value={stats?.stocksEnAlerte || 0}
                    icon={AlertTriangle}
                    variant={(stats?.stocksEnAlerte || 0) > 5 ? 'danger' : (stats?.stocksEnAlerte || 0) > 0 ? 'warning' : 'success'}
                />
                <KPICard
                    title="Péremption Proche"
                    value={stats?.stocksPerimes || 0}
                    icon={Clock}
                    variant={(stats?.stocksPerimes || 0) > 0 ? 'warning' : 'success'}
                />
                <KPICard
                    title="Commandes en Attente"
                    value={stats?.commandesEnAttente || 0}
                    icon={ShoppingCart}
                    variant="info"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actions Rapides */}
                <div className="lg:col-span-1">
                    <QuickActions actions={quickActions} title="Actions Rapides" columns={2} />
                </div>

                {/* Alertes et Notifications */}
                <div className="lg:col-span-2">
                    <AlertList
                        alerts={alerts}
                        maxItems={5}
                        onViewAll={() => navigate('/stocks')}
                    />
                </div>
            </div>

            {/* Dernières Commandes */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-display flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Mes Dernières Commandes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(!data?.commandes || data.commandes.length === 0) ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Aucune commande récente
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Numéro</TableHead>
                                    <TableHead className="text-xs">Date</TableHead>
                                    <TableHead className="text-xs">Statut</TableHead>
                                    <TableHead className="text-xs text-right">Items</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.commandes.slice(0, 5).map((commande) => (
                                    <TableRow key={commande.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="text-xs font-medium">{commande.numero_commande}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {/* Statuts des commandes */}
                                            {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            <Badge variant="secondary">{commande.statut}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-right">
                                            {commande.items?.length || 0}
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
