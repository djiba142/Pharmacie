import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserLevel, LEVEL_LABELS } from '@/hooks/useUserLevel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from 'recharts';
import { BarChart3, Download, FileText, TrendingUp, Package, AlertTriangle, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PIE_COLORS = ['hsl(174, 55%, 38%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(210, 80%, 52%)', 'hsl(152, 60%, 42%)'];

export default function RapportsPage() {
  const { toast } = useToast();
  const { level, entityId } = useUserLevel();
  const [period, setPeriod] = useState('month');
  const [tab, setTab] = useState('stocks');

  const { data: stocks = [], isLoading: loadingStocks } = useQuery({
    queryKey: ['rapport-stocks', level, entityId],
    queryFn: async () => {
      const { data } = await supabase.from('stocks').select('*, lots!inner(*, medicaments!inner(*))');
      return data || [];
    },
  });

  const { data: commandes = [] } = useQuery({
    queryKey: ['rapport-commandes'],
    queryFn: async () => {
      const { data } = await supabase.from('commandes').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: livraisons = [] } = useQuery({
    queryKey: ['rapport-livraisons'],
    queryFn: async () => {
      const { data } = await supabase.from('livraisons').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: declarations = [] } = useQuery({
    queryKey: ['rapport-ei'],
    queryFn: async () => {
      const { data } = await supabase.from('declarations_ei').select('*');
      return data || [];
    },
  });

  const { data: drsData = [] } = useQuery({
    queryKey: ['rapport-drs'],
    queryFn: async () => {
      const { data } = await supabase.from('drs').select('id, nom, code');
      return data || [];
    },
  });

  // Stock stats by category
  const stockByCategorie = stocks.reduce((acc: any, s: any) => {
    const cat = s.lots?.medicaments?.categorie || 'Autre';
    acc[cat] = (acc[cat] || 0) + s.quantite_actuelle;
    return acc;
  }, {});
  const stockCatData = Object.entries(stockByCategorie).map(([name, value]) => ({ name, value }));

  // Stock status distribution
  const stockStatusData = (() => {
    let ok = 0, alerte = 0, critique = 0, perime = 0;
    stocks.forEach((s: any) => {
      const exp = new Date(s.lots?.date_peremption);
      if (exp < new Date()) perime++;
      else if (s.quantite_actuelle <= s.seuil_minimal) critique++;
      else if (s.quantite_actuelle <= s.seuil_alerte) alerte++;
      else ok++;
    });
    return [{ name: 'Normal', value: ok }, { name: 'Alerte', value: alerte }, { name: 'Critique', value: critique }, { name: 'Périmé', value: perime }].filter(d => d.value > 0);
  })();

  // Commandes by status
  const cmdByStatus = commandes.reduce((acc: any, c: any) => { acc[c.statut] = (acc[c.statut] || 0) + 1; return acc; }, {});
  const cmdStatusData = Object.entries(cmdByStatus).map(([name, value]) => ({ name, value }));

  // Commandes by month
  const cmdByMonth = commandes.reduce((acc: any, c: any) => {
    const m = new Date(c.date_commande).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const cmdMonthData = Object.entries(cmdByMonth).map(([mois, total]) => ({ mois, total })).reverse().slice(0, 12);

  // Livraisons by status
  const livByStatus = livraisons.reduce((acc: any, l: any) => { acc[l.statut] = (acc[l.statut] || 0) + 1; return acc; }, {});
  const livStatusData = Object.entries(livByStatus).map(([name, value]) => ({ name, value }));

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Rapport LivraMed', 14, 22);
      doc.setFontSize(10);
      doc.text(`${LEVEL_LABELS[level]} — ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 14, 30);

      doc.setFontSize(14);
      doc.text('Résumé des Stocks', 14, 45);
      autoTable(doc, {
        startY: 50,
        head: [['Indicateur', 'Valeur']],
        body: [
          ['Total entrées stock', stocks.length.toString()],
          ['Stocks en alerte', stockStatusData.find(d => d.name === 'Alerte')?.value?.toString() || '0'],
          ['Stocks critiques', stockStatusData.find(d => d.name === 'Critique')?.value?.toString() || '0'],
          ['Lots périmés', stockStatusData.find(d => d.name === 'Périmé')?.value?.toString() || '0'],
        ],
      });

      const y1 = (doc as any).lastAutoTable?.finalY || 80;
      doc.setFontSize(14);
      doc.text('Commandes', 14, y1 + 15);
      autoTable(doc, {
        startY: y1 + 20,
        head: [['Statut', 'Nombre']],
        body: cmdStatusData.map(d => [d.name, (d.value as number).toString()]),
      });

      const y2 = (doc as any).lastAutoTable?.finalY || 120;
      doc.setFontSize(14);
      doc.text('Livraisons', 14, y2 + 15);
      autoTable(doc, {
        startY: y2 + 20,
        head: [['Statut', 'Nombre']],
        body: livStatusData.map(d => [d.name, (d.value as number).toString()]),
      });

      doc.addPage();
      doc.setFontSize(14);
      doc.text('Top 20 Stocks les plus bas', 14, 22);
      const lowStocks = [...stocks]
        .sort((a: any, b: any) => a.quantite_actuelle - b.quantite_actuelle)
        .slice(0, 20);
      autoTable(doc, {
        startY: 28,
        head: [['Médicament', 'Quantité', 'Seuil alerte', 'Péremption']],
        body: lowStocks.map((s: any) => [
          s.lots?.medicaments?.dci || 'N/A',
          s.quantite_actuelle.toString(),
          s.seuil_alerte.toString(),
          s.lots?.date_peremption ? new Date(s.lots.date_peremption).toLocaleDateString('fr-FR') : '—',
        ]),
      });

      doc.save(`rapport-livramed-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: 'PDF téléchargé', description: 'Le rapport a été généré avec succès.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  if (loadingStocks) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Rapports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">{LEVEL_LABELS[level]} — Données en temps réel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePDF}><Download className="h-4 w-4 mr-2" /> Télécharger PDF</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Stocks</p><p className="text-xl font-display font-bold">{stocks.length}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-warning" /></div>
            <div><p className="text-xs text-muted-foreground">Commandes</p><p className="text-xl font-display font-bold">{commandes.length}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center"><Truck className="h-5 w-5 text-info" /></div>
            <div><p className="text-xs text-muted-foreground">Livraisons</p><p className="text-xl font-display font-bold">{livraisons.length}</p></div>
          </div>
        </CardContent></Card>
        <Card className="stat-card"><CardContent className="p-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"><FileText className="h-5 w-5 text-destructive" /></div>
            <div><p className="text-xs text-muted-foreground">Déclarations EI</p><p className="text-xl font-display font-bold">{declarations.length}</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="commandes">Commandes</TabsTrigger>
          <TabsTrigger value="livraisons">Livraisons</TabsTrigger>
          <TabsTrigger value="vigilance">Pharmacovigilance</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-display">État des stocks</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={stockStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {stockStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie><Tooltip /><Legend /></PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Stocks par catégorie</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockCatData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(170,15%,89%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                      <Bar dataKey="value" name="Quantité" fill="hsl(174,55%,38%)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commandes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Commandes par statut</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={cmdStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {cmdStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie><Tooltip /><Legend /></PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Évolution des commandes</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cmdMonthData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(170,15%,89%)" />
                      <XAxis dataKey="mois" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                      <Area type="monotone" dataKey="total" fill="hsl(174,55%,38%)" fillOpacity={0.2} stroke="hsl(174,55%,38%)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="livraisons" className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Livraisons par statut</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={livStatusData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(170,15%,89%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                    <Bar dataKey="value" name="Nombre" fill="hsl(210,80%,52%)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vigilance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Déclarations par gravité</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  {(() => {
                    const byGravite = declarations.reduce((acc: any, d: any) => { acc[d.gravite] = (acc[d.gravite] || 0) + 1; return acc; }, {});
                    const data = Object.entries(byGravite).map(([name, value]) => ({ name, value }));
                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={3}>
                          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie><Tooltip /><Legend /></PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Déclarations par statut</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  {(() => {
                    const byStatut = declarations.reduce((acc: any, d: any) => { acc[d.statut] = (acc[d.statut] || 0) + 1; return acc; }, {});
                    const data = Object.entries(byStatut).map(([name, value]) => ({ name, value }));
                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="hsl(170,15%,89%)" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                          <Bar dataKey="value" name="Nombre" fill="hsl(0,72%,51%)" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
