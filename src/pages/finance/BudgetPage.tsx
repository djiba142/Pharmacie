
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Download, Plus, BrainCircuit, TrendingUp, ShieldCheck } from 'lucide-react';
import BudgetExecutionTable from '@/components/finance/BudgetExecutionTable';

const BudgetPage = () => {
    const entities = [
        { name: "PCG Centrale", allocated: 45000000000, consumed: 32000000000, type: "National" },
        { name: "DRS Conakry", allocated: 12000000000, consumed: 9500000000, type: "Régional" },
        { name: "DRS Kindia", allocated: 8000000000, consumed: 6200000000, type: "Régional" },
        { name: "DPS Dubréka", allocated: 1500000000, consumed: 1300000000, type: "Préfectoral" },
        { name: "Hôpital Donka", allocated: 2500000000, consumed: 1400000000, type: "Structure" },
        { name: "CS Ratoma", allocated: 450000000, consumed: 80000000, type: "Structure" },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Gestion des Budgets</h1>
                    <p className="text-muted-foreground mt-1">Planification annuelle et suivi de l'exécution par entité.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="shadow-sm">
                        <Download className="h-4 w-4 mr-2" /> Rapport Annuel
                    </Button>
                    <Button className="bg-primary shadow-md">
                        <Plus className="h-4 w-4 mr-2" /> Allouer Budget
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 border-none shadow-md bg-white/50 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="bg-muted/20 border-b">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg font-bold">Exécution par Entité</CardTitle>
                                <CardDescription>Suivi en temps réel de la consommation budgétaire</CardDescription>
                            </div>
                            <ShieldCheck className="h-5 w-5 text-primary opacity-50" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <BudgetExecutionTable entities={entities} />
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden relative border-l-4 border-l-primary">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <BrainCircuit className="h-5 w-5" />
                            <span className="text-xs font-bold uppercase tracking-widest">Intelligence Artificielle</span>
                        </div>
                        <CardTitle className="text-xl font-bold">Proposition Budget 2027</CardTitle>
                        <CardDescription className="text-slate-600">Basé sur la croissance de la population (+3.2%) et l'inflation pharma (+5%).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white/80 rounded-xl shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Estimation Totale</span>
                                <span className="text-lg font-bold text-primary">+8.4%</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">92.6 Mds GNF</div>
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-xs">
                                    <span className="opacity-70">Antipaludéens</span>
                                    <span className="font-bold">32 Mds</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="opacity-70">Vaccins</span>
                                    <span className="font-bold">12 Mds</span>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                            <TrendingUp className="h-4 w-4 mr-2" /> Voir l'Analyse Complète
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BudgetPage;
