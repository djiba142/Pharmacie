import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Wallet, ShoppingCart, Receipt, Coins,
    ArrowUpRight, ArrowDownRight, Bell, Calendar,
    Filter, Download, ChevronRight
} from 'lucide-react';
import StateCard from '@/components/finance/StateCard';
import FinancialAlertCard from '@/components/finance/FinancialAlertCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FinanceDashboard = () => {
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Tableau de Bord Financier</h1>
                    <p className="text-muted-foreground mt-1">Gérez le budget national et supervisez les dépenses en temps réel.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="shadow-sm">
                        <Filter className="h-4 w-4 mr-2" /> Filtrer
                    </Button>
                    <Button variant="outline" size="sm" className="shadow-sm">
                        <Download className="h-4 w-4 mr-2" /> Exporter
                    </Button>
                    <Button size="sm" className="bg-primary shadow-md hover:shadow-lg transition-all">
                        Nouvelle Opération
                    </Button>
                </div>
            </div>

            {/* Routine Matinale Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                    <Bell className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold font-outfit">Routine Matinale (Alertes & Tâches)</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <FinancialAlertCard
                        type="critical"
                        title="Facture PCG en retard"
                        description="La facture #FAC-2025-0567 (8.5M GNF) est en retard de 15 jours. Risque de blocage approvisionnement."
                        date="Il y a 2h"
                        actionLabel="Valider le paiement"
                    />
                    <FinancialAlertCard
                        type="warning"
                        title="Budget DPS Dubréka à 87%"
                        description="L'exécution budgétaire de Dubréka approche du plafond annuel (87%). Révision recommandée."
                        date="Ce matin"
                        actionLabel="Analyser les détails"
                    />
                    <FinancialAlertCard
                        type="info"
                        title="Paiement Fournisseur X"
                        description="Le virement de 12.4M GNF pour le fournisseur BioPharma a été confirmé par la banque."
                        date="Hier 17:00"
                        actionLabel="Voir reçu"
                    />
                </div>
            </section>

            {/* KPIs Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StateCard
                    title="Budget National Alloué"
                    value="85.4 Mds GNF"
                    subtitle="Exercice 2026"
                    icon={Wallet}
                    trend={{ value: 8.2, label: "vs 2025", direction: 'up' }}
                />
                <StateCard
                    title="Consommation Réelle"
                    value="52.3 Mds GNF"
                    subtitle="61.2% du budget total"
                    icon={ShoppingCart}
                    trend={{ value: 12, label: "vs mois dernier", direction: 'up' }}
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
                    value="12.8 Mds GNF"
                    subtitle="Previsions à 30 jours OK"
                    icon={Coins}
                    trend={{ value: 0.5, label: "stable", direction: 'neutral' }}
                />
            </div>

            {/* Charts & Recent Ops */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
                        <div>
                            <CardTitle className="text-lg font-bold">Évolution des Dépenses mensuelles</CardTitle>
                            <p className="text-xs text-muted-foreground">Comparaison entre Budget Engagé et Réel</p>
                        </div>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="h-[350px] flex flex-col items-center justify-center p-6">
                        <div className="w-full h-full border-2 border-dashed border-muted rounded-xl flex items-center justify-center bg-slate-50">
                            <div className="text-center space-y-2">
                                <div className="p-3 bg-white rounded-full shadow-sm mx-auto w-fit">
                                    <ArrowUpRight className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium text-slate-600">Visualisation Recharts</p>
                                <p className="text-xs text-muted-foreground w-48">Intégration du graphique dynamique dès l'approbation des flux de données.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden text-slate-800">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-bold">Dernières Opérations</CardTitle>
                            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">Voir tout</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {[
                                { label: "Paiement PCG #BC-9923", date: "15 Fév 2026", amount: "4.2M GNF", status: "Confirmé", type: "out" },
                                { label: "Remboursement USAID", date: "14 Fév 2026", amount: "150M GNF", status: "Reçu", type: "in" },
                                { label: "Facture BioPharm #882", date: "14 Fév 2026", amount: "2.1M GNF", status: "En attente", type: "out" },
                                { label: "Engagement DPS Kindia", date: "13 Fév 2026", amount: "750k GNF", status: "Engagé", type: "out" },
                                { label: "Paiement Salaires DAF", date: "12 Fév 2026", amount: "25.5M GNF", status: "Exécuté", type: "out" },
                            ].map((op, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            op.type === 'in' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {op.type === 'in' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{op.label}</p>
                                            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">{op.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-sm font-bold", op.type === 'in' ? "text-green-600" : "text-slate-900")}>
                                            {op.type === 'in' ? "+" : "-"}{op.amount}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground">{op.status}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary ml-2 translate-x-0 group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FinanceDashboard;
