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
import { BarChart3, Download, FileText, TrendingUp, Package, AlertTriangle, Truck, FileSpreadsheet, Building2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import logoLivramed from '@/assets/logo-livramed.png';
import logoGuinee from '@/assets/partners/guinee.png';
import logoPCG from '@/assets/partners/pcg.jpg';
import * as XLSX from 'xlsx';
import { QRCodeCanvas } from 'qrcode.react';

const PIE_COLORS = ['hsl(174, 55%, 38%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(210, 80%, 52%)', 'hsl(152, 60%, 42%)'];

export default function RapportsPage() {
  const { toast } = useToast();
  const { level, entityId } = useUserLevel();
  const [period, setPeriod] = useState('month');
  interface StockRecord {
    id: string;
    quantite_actuelle: number;
    seuil_minimal: number;
    seuil_alerte: number;
    lots?: {
      date_peremption: string;
      numero_lot: string;
      medicaments?: {
        dci: string;
        nom_commercial?: string;
        categorie?: string;
      }
    };
  }

  interface CommandeRecord {
    id: string;
    statut: string;
    date_commande: string;
  }

  interface LivraisonRecord {
    id: string;
    statut: string;
  }

  interface DeclarationRecord {
    id: string;
    numero: string;
    statut: string;
    gravite: string;
    description_ei?: string;
  }

  const [tab, setTab] = useState('stocks');

  const { data: stocks = [], isLoading: loadingStocks } = useQuery({
    queryKey: ['rapport-stocks', level, entityId],
    queryFn: async () => {
      const { data } = await supabase.from('stocks').select('*, lots!inner(*, medicaments!inner(*))');
      return (data || []) as StockRecord[];
    },
  });

  const { data: commandes = [] } = useQuery({
    queryKey: ['rapport-commandes'],
    queryFn: async () => {
      const { data } = await supabase.from('commandes').select('*').order('created_at', { ascending: false });
      return (data || []) as CommandeRecord[];
    },
  });

  const { data: livraisons = [] } = useQuery({
    queryKey: ['rapport-livraisons'],
    queryFn: async () => {
      const { data } = await supabase.from('livraisons').select('*').order('created_at', { ascending: false });
      return (data || []) as LivraisonRecord[];
    },
  });

  const { data: declarations = [] } = useQuery({
    queryKey: ['rapport-ei'],
    queryFn: async () => {
      const { data } = await supabase.from('declarations_ei').select('*');
      return (data || []) as DeclarationRecord[];
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
  const stockByCategorie = (stocks as StockRecord[]).reduce((acc: Record<string, number>, s) => {
    const cat = s.lots?.medicaments?.categorie || 'Autre';
    acc[cat] = (acc[cat] || 0) + s.quantite_actuelle;
    return acc;
  }, {});
  const stockCatData = Object.entries(stockByCategorie).map(([name, value]) => ({ name, value }));

  // Stock status distribution
  const stockStatusData = (() => {
    let ok = 0, alerte = 0, critique = 0, perime = 0;
    (stocks as StockRecord[]).forEach((s) => {
      const exp = new Date(s.lots?.date_peremption || '');
      if (exp < new Date()) perime++;
      else if (s.quantite_actuelle <= s.seuil_minimal) critique++;
      else if (s.quantite_actuelle <= s.seuil_alerte) alerte++;
      else ok++;
    });
    return [{ name: 'Normal', value: ok }, { name: 'Alerte', value: alerte }, { name: 'Critique', value: critique }, { name: 'Périmé', value: perime }].filter(d => d.value > 0);
  })();

  // Commandes by status
  const cmdByStatus = (commandes as CommandeRecord[]).reduce((acc: Record<string, number>, c) => { acc[c.statut] = (acc[c.statut] || 0) + 1; return acc; }, {});
  const cmdStatusData = Object.entries(cmdByStatus).map(([name, value]) => ({ name, value }));

  // Commandes by month
  const cmdByMonth = (commandes as CommandeRecord[]).reduce((acc: Record<string, number>, c) => {
    const m = new Date(c.date_commande).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  const cmdMonthData = Object.entries(cmdByMonth).map(([mois, total]) => ({ mois, total })).reverse().slice(0, 12);

  // Livraisons by status
  const livByStatus = (livraisons as LivraisonRecord[]).reduce((acc: Record<string, number>, l) => { acc[l.statut] = (acc[l.statut] || 0) + 1; return acc; }, {});
  const livStatusData = Object.entries(livByStatus).map(([name, value]) => ({ name, value }));

  const generatePDF = async () => {
    try {
      console.log("Starting PDF generation...");
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();

      // --- Header Design (Institutional Color) ---
      doc.setFillColor(15, 23, 42); // Slate 900 (PCG Dark Blue/Slate)
      doc.rect(0, 0, 210, 45, 'F');

      // Accent Emerald Line
      doc.setFillColor(16, 185, 129); // Emerald 500
      doc.rect(0, 45, 210, 1.5, 'F');

      // --- Logo Integration (Defensive) ---
      const drawImageSafe = (id: string, format: string, x: number, y: number, w: number, h: number) => {
        const img = document.getElementById(id) as HTMLImageElement;
        if (img && img.naturalWidth > 0) {
          try {
            doc.addImage(img, format, x, y, w, h);
          } catch (e) {
            console.warn(`Failed to add image ${id}`, e);
          }
        }
      };

      drawImageSafe('guinee-logo', 'PNG', 14, 8, 15, 15);
      drawImageSafe('pcg-logo', 'JPEG', 160, 8, 15, 15);
      drawImageSafe('app-logo-rendering', 'PNG', 185, 10, 10, 10);

      // Title & Institutional Info
      // Title & Institutional Info
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('RÉPUBLIQUE DE GUINÉE', 36, 14);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Travail — Justice — Solidarité', 36, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('PHARMACIE CENTRALE DE GUINÉE (PCG) SA', 36, 26);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 200);
      doc.text('MINISTÈRE DE LA SANTÉ ET DE L\'HYGIÈNE PUBLIQUE', 36, 31);

      // --- Report Meta ---
      doc.setTextColor(200, 200, 200);
      doc.setFontSize(6);
      doc.text(`RÉF: LVM-REP-${new Date().getTime().toString().slice(-8)}`, 180, 28, { align: 'right' });
      doc.text(`DATE: ${new Date().toLocaleDateString('fr-FR')}`, 180, 31, { align: 'right' });

      // --- Body Section (Title Higher & Larger) ---
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('RAPPORT DE SITUATION PHARMACEUTIQUE', 14, 55);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Période : ${period === 'month' ? 'Mensuel' : 'Annuel'} — État au ${new Date().toLocaleString('fr-FR')}`, 14, 62);

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1.5);
      doc.line(14, 65, 85, 65);

      // Space for text and tables...

      // --- KPI Summary (Professional Grid) ---
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('RÉSUMÉ DES INDICATEURS CLÉS (KPI)', 14, 78);

      autoTable(doc, {
        startY: 83,
        head: [['Indicateur de Performance', 'Valeur Actuelle', 'Évaluation du Statut']],
        body: [
          ['Total des produits en inventaire', stocks.length.toString(), 'CONFORME'],
          ['Alerte Stock (Seuil minimal atteint)', stockStatusData.find(d => d.name === 'Alerte')?.value?.toString() || '0', 'À SURVEILLER'],
          ['Ruptures Critiques / Stock Zéro', stockStatusData.find(d => d.name === 'Critique')?.value?.toString() || '0', 'ACTION REQUISE'],
          ['Produits Périmés identifiés', stockStatusData.find(d => d.name === 'Périmé')?.value?.toString() || '0', 'URGENT'],
          ['Volume de Commandes traitées', commandes.length.toString(), 'ACTIF'],
          ['Livraisons validées sur la période', livraisons.length.toString(), 'LIVRÉ'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], fontSize: 10, halign: 'left', fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 6, font: 'helvetica' },
        columnStyles: {
          1: { halign: 'center', fontStyle: 'bold', textColor: [15, 23, 42] },
          2: { halign: 'center', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const val = data.cell.text[0];
            if (val === 'CONFORME' || val === 'LIVRÉ' || val === 'ACTIF') data.cell.styles.textColor = [16, 185, 129];
            if (val === 'À SURVEILLER') data.cell.styles.textColor = [245, 158, 11];
            if (val === 'ACTION REQUISE' || val === 'URGENT') data.cell.styles.textColor = [220, 38, 38];
          }
        }
      });

      // --- Low Stocks (Compact) ---
      const lowStocks = [...(stocks as StockRecord[])]
        .sort((a, b) => a.quantite_actuelle - b.quantite_actuelle)
        .slice(0, 5);

      if (lowStocks.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('ALERTES PRODUITS (TOP 5 PRIORITÉS)', 14, (doc as any).lastAutoTable.finalY + 12);

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 16,
          head: [['Produit', 'Stock', 'Seuil', 'Péremption']],
          body: lowStocks.map((s) => [
            s.lots?.medicaments?.dci || 'N/A',
            s.quantite_actuelle.toString(),
            s.seuil_minimal.toString(),
            s.lots?.date_peremption ? new Date(s.lots.date_peremption).toLocaleDateString('fr-FR') : 'N/A'
          ]),
          theme: 'plain',
          headStyles: { fontStyle: 'bold', textColor: [220, 38, 38] },
          styles: { fontSize: 8, cellPadding: 2 }
        });
      }


      // --- Footer (QR Code relocated here) ---
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // QR Code Relocation with deep safety check
        try {
          const qrCanvas = document.getElementById('report-qr') as HTMLCanvasElement;
          if (qrCanvas && typeof qrCanvas.toDataURL === 'function') {
            const qrData = qrCanvas.toDataURL('image/png');
            doc.addImage(qrData, 'PNG', 182, 275, 15, 15);
            doc.setFontSize(5);
            doc.setTextColor(180, 180, 180);
            doc.text('VÉRIFICATION SÉCURISÉE', 190, 292, { align: 'right' });
          }
        } catch (qrErr) {
          console.warn("QR Addition failed", qrErr);
        }

        doc.setFontSize(6);
        doc.setTextColor(180, 180, 180);
        doc.text(`Officiel LivraMed Alpha v2.5 — État au ${new Date().toLocaleDateString('fr-FR')} — Page ${i}/${pageCount}`, 14, 285);
      }

      console.log("Saving PDF...");
      doc.save(`rapport-professionnel-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: 'Rapport généré', description: 'Le document PDF professionnel est prêt.' });
    } catch (err: unknown) {
      const error = err as Error;
      console.error("PDF Error:", error);
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const generateExcel = () => {
    try {
      const stockData = (stocks as StockRecord[]).map((s) => ({
        'Code': s.id,
        'Médicament': s.lots?.medicaments?.nom_commercial || s.lots?.medicaments?.dci,
        'DCI': s.lots?.medicaments?.dci,
        'Catégorie': s.lots?.medicaments?.categorie,
        'Quantité': s.quantite_actuelle,
        'Seuil Alerte': s.seuil_alerte,
        'N° Lot': s.lots?.numero_lot,
        'Date Péremption': s.lots?.date_peremption ? new Date(s.lots.date_peremption).toLocaleDateString('fr-FR') : 'N/A',
        'Statut': s.quantite_actuelle <= s.seuil_alerte ? (s.quantite_actuelle <= s.seuil_minimal ? 'CRITIQUE' : 'ALERTE') : 'OK'
      }));

      const wb = XLSX.utils.book_new();

      // Header Info Sheet
      const infoWs = XLSX.utils.aoa_to_sheet([
        ['SYSTÈME LIVRAMED - RAPPORT NATIONAL'],
        ['Entité:', LEVEL_LABELS[level]],
        ['Date Export:', new Date().toLocaleString('fr-FR')],
        [''],
        ['RÉSUMÉ'],
        ['Total Articles:', stocks.length],
        ['Commandes Total:', commandes.length],
        ['Livraisons Total:', livraisons.length]
      ]);
      XLSX.utils.book_append_sheet(wb, infoWs, 'Résumé');

      const ws = XLSX.utils.json_to_sheet(stockData);
      XLSX.utils.book_append_sheet(wb, ws, 'Détail des Stocks');

      XLSX.writeFile(wb, `export-livramed-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast({ title: 'Excel téléchargé', description: 'Les données ont été exportées avec succès.' });
    } catch (err: any) {
      toast({ title: 'Erreur Excel', description: err.message, variant: 'destructive' });
    }
  };

  if (loadingStocks) return <div className="space-y-4 animate-fade-in"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center p-2 border border-primary/20">
            <img src={logoLivramed} alt="Logo" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Rapports & Analytics</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3 mr-1" /> {LEVEL_LABELS[level]}
              </Badge>
              <span className="text-xs text-muted-foreground">— Données en temps réel</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateExcel} className="hidden sm:flex border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Exporter Excel
          </Button>
          <Button onClick={generatePDF} className="bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
            <FileText className="h-4 w-4 mr-2" /> Rapport PDF Complet
          </Button>
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
                      <Bar dataKey="value" name="Quantité" fill="hsl(174,55%,38%)" radius={[4, 4, 0, 0]} />
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
                    <Bar dataKey="value" name="Nombre" fill="hsl(210,80%,52%)" radius={[4, 4, 0, 0]} />
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
                    const byGravite = (declarations as DeclarationRecord[]).reduce((acc: Record<string, number>, d) => { acc[d.gravite] = (acc[d.gravite] || 0) + 1; return acc; }, {});
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
                    const byStatut = (declarations as DeclarationRecord[]).reduce((acc: Record<string, number>, d) => { acc[d.statut] = (acc[d.statut] || 0) + 1; return acc; }, {});
                    const data = Object.entries(byStatut).map(([name, value]) => ({ name, value }));
                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="hsl(170,15%,89%)" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                          <Bar dataKey="value" name="Nombre" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} />
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
      {/* Logos for PDF Rendering */}
      <div className="hidden">
        <img id="guinee-logo" src={logoGuinee} alt="Guinea Logo" />
        <img id="pcg-logo" src={logoPCG} alt="PCG Logo" />
        <img id="app-logo-rendering" src={logoLivramed} alt="LivraMed Logo" />
        <QRCodeCanvas id="report-qr" value={`LivraMed-Report-${entityId}-${new Date().getTime()}`} size={128} />
      </div>
    </div>
  );
}
