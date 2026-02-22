import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Wallet, ShoppingCart, Receipt, Coins,
    ArrowUpRight, ArrowDownRight, Bell, Calendar,
    Filter, Download, ChevronRight, TrendingUp, AlertTriangle,
    Brain, Zap, Shield, Cpu, Activity
} from 'lucide-react';
import StateCard from '@/components/finance/StateCard';
import FinancialAlertCard from '@/components/finance/FinancialAlertCard';
import StatsChart from '@/components/dashboard/StatsChart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useUserLevel } from '@/hooks/useUserLevel';
import { useFinance } from '@/hooks/useFinance';
import { toast } from 'sonner';
import { RoleCode } from '@/types/auth';

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { level } = useUserLevel();
    const { useFinanceStats } = useFinance();
    const { data: stats, isLoading: isLoadingStats } = useFinanceStats();

    // Simulation de données basées sur le rôle/niveau
    const isNational = level === 'national';
    const isRegional = level === 'regional';

    const dashboardTitle = isNational
        ? "Tableau de Bord Financier National"
        : isRegional
            ? `Tableau de Bord Financier - DRS`
            : "Tableau de Bord Comptable";

    const formatGNF = (val: number) => {
        if (!val) return "0 GNF";
        if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)} Mds GNF`;
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} M GNF`;
        return `${val.toLocaleString()} GNF`;
    };

    const budgetValue = isLoadingStats ? "Chargement..." : formatGNF(stats?.totalBudget || 0);
    const consumptionValue = isLoadingStats ? "Chargement..." : formatGNF(stats?.totalEngage || 0);
    const consumptionPercent = stats?.totalBudget ? `${((stats.totalEngage / stats.totalBudget) * 100).toFixed(1)}%` : "0%";

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit uppercase">{dashboardTitle}</h1>
                    <p className="text-muted-foreground mt-1">
                        {isNational
                            ? "Supervision globale du budget de la santé en Guinée."
                            : "Gestion et suivi des budgets délégués."}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="shadow-sm border-slate-200"
                        onClick={() => toast.info("Ouverture des filtres avancés...")}
                    >
                        <Filter className="h-4 w-4 mr-2" /> Filtrer
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="shadow-sm border-slate-200"
                        onClick={() => toast.success(`Génération du rapport ${level} en cours...`)}
                    >
                        <Download className="h-4 w-4 mr-2" /> Rapport {level}
                    </Button>
                    <Button
                        size="sm"
                        className="bg-primary shadow-md hover:shadow-lg transition-all px-4"
                        onClick={() => navigate('/finance/tresorerie?new=true')}
                    >
                        Nouvelle Transaction
                    </Button>
                </div>
            </div>

            {/* Routine Matinale Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold font-outfit">Routine Matinale (DAF)</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <FinancialAlertCard
                        type="critical"
                        title="Facture PCG en retard"
                        description="La facture #FAC-2025-0567 (8.5M GNF) pour Dubréka a dépassé l'échéance de 15 jours."
                        date="Aujourd'hui"
                        actionLabel="Procéder au paiement"
                        onAction={() => navigate('/finance/tresorerie')}
                    />
                    <FinancialAlertCard
                        type="warning"
                        title="Alerte IA : Dépassement Budget"
                        description="Le rythme actuel de consommation de Kindia prévoit un épuisement du budget en Avril."
                        date="Suggestion IA"
                        actionLabel="Réviser l'allocation"
                        onAction={() => navigate('/finance/budget')}
                    />
                    <FinancialAlertCard
                        type="info"
                        title="Virement Partenaire"
                        description="L'USAID a confirmé le versement de 150M GNF pour le programme paludisme."
                        date="Hier"
                        actionLabel="Voir confirmation"
                        onAction={() => navigate('/finance/comptabilite')}
                    />
                </div>
            </section>

            {/* KPIs Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StateCard
                    title="Budget Alloué"
                    value={budgetValue}
                    subtitle={`Exercice ${new Date().getFullYear()}`}
                    icon={Wallet}
                    trend={{ value: 8.2, label: "vs année préc.", direction: 'up' }}
                />
                <StateCard
                    title="Dépenses Réelles"
                    value={consumptionValue}
                    subtitle={`${consumptionPercent} du budget total`}
                    icon={ShoppingCart}
                    trend={{ value: 12, label: "rythme mensuel", direction: 'up' }}
                />
                <StateCard
                    title="Factures en Attente"
                    value="23"
                    subtitle="Total: 450M GNF"
                    icon={Receipt}
                    trend={{ value: 3, label: "urgentes", direction: 'down' }}
                />
                <StateCard
                    title="Trésorerie Disponible"
                    value={isNational ? "12.8 Mds GNF" : "850 M GNF"}
                    subtitle="Prévisions à 30j OK"
                    icon={Coins}
                    trend={{ value: 0.5, label: "stable", direction: 'neutral' }}
                />
            </div>

            {/* Visual Analytics & Recent History */}
            <div className="grid gap-6 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none shadow-md overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
                        <div>
                            <CardTitle className="text-lg font-bold">Analyse Budgétaire & IA</CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Suivi de consommation en temps réel</p>
                        </div>
                        <Activity className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <StatsChart
                                    data={[
                                        { mois: 'Jan', value: 45000000 },
                                        { mois: 'Fév', value: 52000000 },
                                        { mois: 'Mar', value: 48000000 },
                                        { mois: 'Avr', value: 61000000 },
                                        { mois: 'Mai', value: 55000000 },
                                        { mois: 'Juin', value: 72000000 }
                                    ]}
                                    title="Dépenses Mensuelles (GNF)"
                                    type="area"
                                    dataKey="value"
                                    xAxisKey="mois"
                                    height={200}
                                />
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100 flex-1">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Brain className="h-4 w-4 text-primary" />
                                            </div>
                                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">Cortex IA : Audit</h4>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            Analyse prédictive : Le pic de consommation de **Juin (+32%)** est conforme aux cycles de réapprovisionnement annuels.
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                                <span>FIABILITÉ PRÉDICTION</span>
                                                <span className="text-primary">94%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary w-[94%]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 p-4 rounded-2xl shadow-md text-white">
                                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                        <Shield className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase">Santé Trésorerie</span>
                                    </div>
                                    <div className="text-2xl font-black">Stable</div>
                                    <p className="text-[9px] text-slate-400">Aucun risque de rupture de liquidité détecté.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-md bg-white overflow-hidden flex flex-col">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-bold">Derniers Flux Financiers</CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-primary font-bold hover:bg-primary/5"
                                    onClick={() => toast.info("Accès à l'historique complet des transactions...")}
                                >
                                    Historique
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-slate-500 font-bold hover:bg-slate-100"
                                    onClick={() => navigate('/audit')}
                                >
                                    Voir Journal Audit
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        <div className="divide-y divide-slate-100">
                            {[
                                { label: "Paiement PCG #BC-9923", date: "À l'instant", amount: "4.2M GNF", status: "Succès", type: "out" },
                                { label: "Dotation État Q1", date: "Aujourd'hui", amount: "250M GNF", status: "Crédité", type: "in" },
                                { label: "Achat Antibio #882", date: "Hier", amount: "2.1M GNF", status: "Validé", type: "out" },
                                { label: "Frais Distribution Kindia", date: "15 Fév", amount: "750k GNF", status: "En cours", type: "out" },
                                { label: "Paiement Salaires DAF", date: "14 Fév", amount: "25.5M GNF", status: "Confirmé", type: "out" },
                                { label: "Virement USAID (Paludisme)", date: "12 Fév", amount: "150M GNF", status: "Reçu", type: "in" },
                            ].map((op, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                                    onClick={() => toast.info(`Détails du flux : ${op.label}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2.5 rounded-xl",
                                            op.type === 'in' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {op.type === 'in' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-none">{op.label}</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">{op.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className={cn("text-sm font-black", op.type === 'in' ? "text-emerald-600" : "text-slate-900")}>
                                                {op.type === 'in' ? "+" : "-"}{op.amount}
                                            </p>
                                            <p className="text-[10px] font-bold text-muted-foreground">{op.status}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Anti-corruption Footnote (Optional but matches vision) */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Contrôle de Conformité Activé</p>
                        <p className="text-xs text-slate-400">Le système audite automatiquement chaque transaction pour prévenir les anomalies de facturation.</p>
                    </div>
                </div>
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-100 hover:bg-slate-800" onClick={() => navigate('/audit')}>Voir les logs</Button>
            </div>
        </div>
    );
};

export default FinanceDashboard;
