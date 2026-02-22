import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useFinance } from '@/hooks/useFinance';
import { Budget } from '@/types/finance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Plus, BrainCircuit, TrendingUp, ShieldCheck } from 'lucide-react';
import BudgetExecutionTable from '@/components/finance/BudgetExecutionTable';

const BudgetPage = () => {
    const { useBudgets, useCreateBudget } = useFinance();
    const { data: budgets = [], isLoading } = useBudgets();
    const createBudgetMutation = useCreateBudget();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState({
        annee: new Date().getFullYear(),
        entite_type: 'DRS',
        entite_id: '',
        montant_alloue: 0,
        categorie: 'FONCTIONNEMENT'
    });

    const entities = useMemo(() => {
        if (budgets.length === 0) return [
            { name: "PCG Centrale", allocated: 45000000000, consumed: 32000000000, type: "National" },
            { name: "DRS Conakry", allocated: 12000000000, consumed: 9500000000, type: "Régional" },
            { name: "DRS Kindia", allocated: 8000000000, consumed: 6200000000, type: "Régional" },
            { name: "DPS Dubréka", allocated: 1500000000, consumed: 1300000000, type: "Préfectoral" },
        ];

        return (budgets as Budget[]).map((b) => ({
            name: `Entité ${b.entite_id.substring(0, 8)}`,
            allocated: b.montant_alloue,
            consumed: b.montant_engage,
            type: b.entite_type
        }));
    }, [budgets]);

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Gestion des Budgets</h1>
                    <p className="text-muted-foreground mt-1">Planification annuelle et suivi de l'exécution par entité.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="shadow-sm"
                        onClick={() => toast.success("Préparation du rapport annuel 2026...")}
                    >
                        <Download className="h-4 w-4 mr-2" /> Rapport Annuel
                    </Button>
                    <Button
                        className="bg-primary shadow-md"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Allouer Budget
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                <Card className="lg:col-span-3 border-none shadow-md bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b py-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-xl font-bold">Exécution Budgétaire par Entité</CardTitle>
                                <CardDescription className="text-xs uppercase font-bold tracking-widest text-slate-500">Exercice Fiscal 2026</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">STATUS : OK</Badge>
                                <ShieldCheck className="h-5 w-5 text-slate-300" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <BudgetExecutionTable entities={entities} />
                    </CardContent>
                    <div className="p-4 bg-slate-50/50 border-t flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString().substring(0, 5)}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-bold text-primary"
                            onClick={() => toast.info("Chargement des détails par catégorie analytique...")}
                        >
                            Détails par catégorie →
                        </Button>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <BrainCircuit className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                <BrainCircuit className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Intelligence Artificielle</span>
                            </div>
                            <CardTitle className="text-lg font-bold">Prévision 2027</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">Analyse tendancielle basée sur la consommation actuelle et l'inflation.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-300">Besoin Estimé</span>
                                    <span className="text-sm font-bold text-emerald-400">+8.4%</span>
                                </div>
                                <div className="text-2xl font-black font-outfit">92.6 Mds GNF</div>
                                <div className="space-y-2 pt-2 border-t border-white/5">
                                    <div className="flex justify-between text-[10px] uppercase font-bold">
                                        <span className="text-slate-400">Essential Meds</span>
                                        <span className="text-white">32 Mds</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] uppercase font-bold">
                                        <span className="text-slate-400">Logistique</span>
                                        <span className="text-white">12 Mds</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg border-none"
                                onClick={() => toast.success("Génération du rapport IA en cours...")}
                            >
                                Générer le Rapport IA
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-white p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900 leading-none">Alerte de Rythme</p>
                                <p className="text-[10px] text-muted-foreground mt-1">DPS Kindia : Épuisement prévu en Juin.</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-bold border-slate-200"
                            onClick={() => toast.info("Interface de réallocation budgétaire Kindia...")}
                        >
                            Ajuster Allocation
                        </Button>
                    </Card>
                </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Allouer un Nouveau Budget</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Année</Label>
                                <Input
                                    type="number"
                                    value={form.annee}
                                    onChange={e => setForm({ ...form, annee: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Catégorie</Label>
                                <Select value={form.categorie} onValueChange={v => setForm({ ...form, categorie: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FONCTIONNEMENT">Fonctionnement</SelectItem>
                                        <SelectItem value="INVESTISSEMENT">Investissement</SelectItem>
                                        <SelectItem value="MEDICAMENTS">Médicaments</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Type d'Entité</Label>
                            <Select value={form.entite_type} onValueChange={v => setForm({ ...form, entite_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PCG">PCG Centrale</SelectItem>
                                    <SelectItem value="DRS">DRS (Régional)</SelectItem>
                                    <SelectItem value="DPS">DPS (Préfectoral)</SelectItem>
                                    <SelectItem value="STRUCTURE">Structure de Santé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>ID de l'Entité (UUID)</Label>
                            <Input
                                placeholder="Coller l'ID de l'entité"
                                value={form.entite_id}
                                onChange={e => setForm({ ...form, entite_id: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Montant Alloué (GNF)</Label>
                            <Input
                                type="number"
                                value={form.montant_alloue}
                                onChange={e => setForm({ ...form, montant_alloue: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                        <Button
                            onClick={() => {
                                const budgetData = {
                                    ...form,
                                    devise: 'GNF',
                                    statut: 'ACTIF' as const,
                                    montant_engage: 0,
                                    montant_liquide: 0,
                                    montant_paye: 0
                                };
                                createBudgetMutation.mutate(budgetData, {
                                    onSuccess: () => setIsCreateOpen(false)
                                });
                            }}
                            disabled={createBudgetMutation.isPending || !form.entite_id}
                        >
                            {createBudgetMutation.isPending ? "Création..." : "Confirmer l'Allocation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BudgetPage;
