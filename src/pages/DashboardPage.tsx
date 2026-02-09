import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const stats = [
  { label: 'Utilisateurs actifs', value: '1 247', icon: Users, change: '+12%', up: true, color: 'text-primary' },
  { label: 'Stocks en alerte', value: '23', icon: Package, change: '-5', up: false, color: 'text-warning' },
  { label: 'Commandes en cours', value: '89', icon: ShoppingCart, change: '+18', up: true, color: 'text-info' },
  { label: 'Livraisons actives', value: '34', icon: Truck, change: '+7', up: true, color: 'text-success' },
  { label: 'Structures actives', value: '456', icon: Building2, change: '+3', up: true, color: 'text-primary' },
  { label: 'Alertes PV', value: '5', icon: AlertTriangle, change: '+2', up: true, color: 'text-destructive' },
];

const barData = [
  { region: 'Conakry', commandes: 245 },
  { region: 'Kindia', commandes: 132 },
  { region: 'Boké', commandes: 98 },
  { region: 'Kankan', commandes: 87 },
  { region: 'Faranah', commandes: 65 },
  { region: 'Mamou', commandes: 54 },
  { region: 'Labé', commandes: 76 },
  { region: 'N\'Zérékoré', commandes: 112 },
];

const pieData = [
  { name: 'Livrées', value: 156, color: 'hsl(152, 60%, 42%)' },
  { name: 'En cours', value: 34, color: 'hsl(210, 80%, 52%)' },
  { name: 'En attente', value: 23, color: 'hsl(38, 92%, 50%)' },
  { name: 'Échec', value: 4, color: 'hsl(0, 72%, 51%)' },
];

const recentOrders = [
  { id: 'CMD-2025-001234', from: 'Hôpital Donka', status: 'VALIDEE', priority: 'URGENTE', date: '09/02/2026' },
  { id: 'CMD-2025-001233', from: 'CS Ratoma', status: 'EN_PREPARATION', priority: 'NORMALE', date: '09/02/2026' },
  { id: 'CMD-2025-001232', from: 'DPS Dubréka', status: 'EN_LIVRAISON', priority: 'NORMALE', date: '08/02/2026' },
  { id: 'CMD-2025-001231', from: 'Clinique Paré', status: 'LIVREE', priority: 'FAIBLE', date: '08/02/2026' },
  { id: 'CMD-2025-001230', from: 'CS Matam', status: 'EN_ATTENTE_VALIDATION', priority: 'URGENTE', date: '07/02/2026' },
];

const statusColors: Record<string, string> = {
  VALIDEE: 'bg-info/10 text-info',
  EN_PREPARATION: 'bg-warning/10 text-warning',
  EN_LIVRAISON: 'bg-primary/10 text-primary',
  LIVREE: 'bg-success/10 text-success',
  EN_ATTENTE_VALIDATION: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  VALIDEE: 'Validée',
  EN_PREPARATION: 'Préparation',
  EN_LIVRAISON: 'En livraison',
  LIVREE: 'Livrée',
  EN_ATTENTE_VALIDATION: 'En attente',
};

const priorityColors: Record<string, string> = {
  URGENTE: 'bg-destructive/10 text-destructive',
  NORMALE: 'bg-muted text-muted-foreground',
  FAIBLE: 'bg-muted text-muted-foreground',
};

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d'ensemble nationale — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <CardContent className="p-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
              </div>
              <div className="flex items-center gap-1 mt-2">
                {stat.up ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs ${stat.up ? 'text-success' : 'text-destructive'}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Commandes par région</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(170, 15%, 89%)" />
                  <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="commandes" fill="hsl(174, 55%, 38%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Statut livraisons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">Commandes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-2 font-medium">N° Commande</th>
                  <th className="pb-2 font-medium">Demandeur</th>
                  <th className="pb-2 font-medium">Statut</th>
                  <th className="pb-2 font-medium">Priorité</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-mono text-xs">{o.id}</td>
                    <td className="py-3">{o.from}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
                        {o.status === 'LIVREE' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {statusLabels[o.status]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[o.priority]}`}>
                        {o.priority === 'URGENTE' ? '🔴 Urgente' : o.priority === 'NORMALE' ? 'Normale' : 'Faible'}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
