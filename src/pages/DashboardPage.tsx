import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package, AlertTriangle, Building2, Pill,
  TrendingUp, TrendingDown, Clock, Activity, ShieldAlert, Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import GuineaMap from '@/components/dashboard/GuineaMap';
import { useUserLevel, LEVEL_LABELS } from '@/hooks/useUserLevel';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

const PIE_COLORS = [
  'hsl(152, 60%, 42%)', // OK
  'hsl(38, 92%, 50%)',  // Alerte
  'hsl(0, 72%, 51%)',   // Critique
];

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const { level, entityId } = useUserLevel();
  const { stats, stocks, regionSummary, isLoading } = useDashboardData(level, entityId);

  const pieData = [
    { name: 'Normal', value: stats.totalStocks - stats.stocksEnAlerte - stats.stocksCritiques },
    { name: 'Alerte', value: stats.stocksEnAlerte },
    { name: 'Critique', value: stats.stocksCritiques },
  ].filter(d => d.value > 0);

  const kpis = [
    {
      label: 'Stocks suivis',
      value: stats.totalStocks,
      icon: Package,
      color: 'text-primary',
      sub: `${stats.stocksEnAlerte} en alerte`,
    },
    {
      label: 'Stocks critiques',
      value: stats.stocksCritiques,
      icon: ShieldAlert,
      color: 'text-destructive',
      sub: 'Sous seuil minimal',
    },
    {
      label: 'Médicaments',
      value: stats.totalMedicaments,
      icon: Pill,
      color: 'text-info',
      sub: 'Références distinctes',
    },
    {
      label: 'Lots périmés',
      value: stats.lotsPerimes,
      icon: AlertTriangle,
      color: 'text-warning',
      sub: `${stats.lotsBientotPerimes} bientôt`,
    },
    ...(level === 'national' || level === 'regional' ? [{
      label: 'Structures',
      value: stats.totalStructures,
      icon: Building2,
      color: 'text-primary',
      sub: 'Actives',
    }] : []),
    {
      label: 'Péremption < 3 mois',
      value: stats.lotsBientotPerimes,
      icon: Calendar,
      color: 'text-warning',
      sub: 'Lots à surveiller',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Bonjour, {user?.first_name || 'Utilisateur'} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {LEVEL_LABELS[level]} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Activity className="h-3 w-3 mr-1" />
          {LEVEL_LABELS[level]}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map - only national level */}
      {level === 'national' && <GuineaMap />}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart - regional summary for national, stock details for others */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">
              {level === 'national' ? 'Stocks par région' : 'Répartition des stocks'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {level === 'national' && regionSummary.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionSummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(170, 15%, 89%)" />
                    <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="total" name="Total" fill="hsl(174, 55%, 38%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="alertes" name="Alertes" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stocks.slice(0, 10).map((s: any) => ({
                    nom: s.lots?.medicaments?.dci?.substring(0, 12) || 'N/A',
                    quantite: s.quantite_actuelle,
                    seuil: s.seuil_alerte,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(170, 15%, 89%)" />
                    <XAxis dataKey="nom" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="quantite" name="Stock actuel" fill="hsl(174, 55%, 38%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="seuil" name="Seuil alerte" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie chart - stock status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">État des stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stocks table - detail view */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">Détail des stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-2 font-medium">Médicament</th>
                  <th className="pb-2 font-medium">N° Lot</th>
                  <th className="pb-2 font-medium">Quantité</th>
                  <th className="pb-2 font-medium">Seuil</th>
                  <th className="pb-2 font-medium">Péremption</th>
                  <th className="pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stocks.slice(0, 10).map((s: any) => {
                  const isAlerte = s.quantite_actuelle <= s.seuil_alerte;
                  const isCritique = s.quantite_actuelle <= s.seuil_minimal;
                  const exp = new Date(s.lots?.date_peremption);
                  const isExpired = exp < new Date();
                  return (
                    <tr key={s.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 font-medium">{s.lots?.medicaments?.dci || 'N/A'}</td>
                      <td className="py-3 font-mono text-xs">{s.lots?.numero_lot}</td>
                      <td className="py-3 font-bold">{s.quantite_actuelle}</td>
                      <td className="py-3 text-muted-foreground">{s.seuil_alerte}</td>
                      <td className="py-3 text-xs">
                        <span className={isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                          {exp.toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className={
                          isCritique ? 'bg-destructive/10 text-destructive border-destructive/30' :
                          isAlerte ? 'bg-warning/10 text-warning border-warning/30' :
                          'bg-success/10 text-success border-success/30'
                        }>
                          {isCritique ? '🔴 Critique' : isAlerte ? '🟡 Alerte' : '🟢 Normal'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {stocks.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Aucun stock trouvé pour votre périmètre</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
