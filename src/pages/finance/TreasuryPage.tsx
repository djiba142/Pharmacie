
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Coins, ArrowRightLeft, CreditCard,
    Send, History, Plus, Search,
    CheckCircle2, Clock, Loader
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useFinance } from '@/hooks/useFinance';
import { Paiement } from '@/types/finance';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const TreasuryPage = () => {
    const { user } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchFilter, setSearchFilter] = useState("");
    const { usePaiements, useUpdatePaiementStatut, useFinanceStats, useCreatePaiement } = useFinance();

    // Charger les paiements depuis Supabase
    const { data: paiements = [], isLoading: isLoadingPaiements, error: errorPaiements } = usePaiements();
    const { data: financeStats, isLoading: isLoadingStats } = useFinanceStats();
    const updatePaiement = useUpdatePaiementStatut();
    const createPaiement = useCreatePaiement();

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        if (searchParams.get('new') === 'true' && !isCreateOpen) {
            setIsCreateOpen(true);
            // Nettoyer l'URL
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('new');
            setSearchParams(newParams);
        }
    }, [searchParams, setSearchParams, isCreateOpen]);
    const [form, setForm] = useState<Omit<Paiement, 'id' | 'created_at'>>({
        numero_paiement: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        facture_id: '',
        montant: 0,
        devise: 'GNF',
        mode_paiement: 'VIREMENT_BANCAIRE',
        date_paiement: new Date().toISOString(),
        statut: 'EN_ATTENTE'
    });

    // Filtrer les paiements
    const filteredPaiements = useMemo(() => {
        if (!searchFilter) return paiements;
        return paiements.filter((pay: any) =>
            pay.fournisseur_nom?.toLowerCase().includes(searchFilter.toLowerCase()) ||
            pay.numero_paiement?.toLowerCase().includes(searchFilter.toLowerCase())
        );
    }, [paiements, searchFilter]);

    const handleGeneratePaymentOrder = async (paymentId: string) => {
        if (!user) return;
        updatePaiement.mutate({
            id: paymentId,
            statut: 'EXECUTE',
            executeBy: user.id
        });
    };

    const handleCreateNewTransfer = () => {
        setIsCreateOpen(true);
    };

    const submitCreatePaiement = () => {
        if (!user) {
            toast.error("Connexion requise");
            return;
        }
        const paiementData: Omit<Paiement, 'id' | 'created_at'> = {
            ...form,
            execute_par: user.id
        };
        createPaiement.mutate(paiementData, {
            onSuccess: () => setIsCreateOpen(false)
        });
    };

    const handleViewHistory = () => {
        toast.info("Accès à l'historique des transactions bancaires...");
    };

    const isLoading = updatePaiement.isPending;
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Trésorerie & Flux</h1>
                    <p className="text-muted-foreground mt-1">Gestion des paiements, virements et suivi de l'encaisse.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="bg-white"
                        onClick={handleViewHistory}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <History className="h-4 w-4 mr-2" />}
                        Historique
                    </Button>
                    <Button
                        className="bg-primary shadow-md"
                        onClick={handleCreateNewTransfer}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Nouveau Virement
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Cash Balance Cards */}
                <Card className="border-none shadow-md bg-white border-t-4 border-t-emerald-500 overflow-hidden">
                    <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Solde de Trésorerie</p>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Coins className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 font-outfit">
                            {isLoadingStats ? <span className="text-sm">Chargement...</span> : `${((financeStats?.totalAvailable || 0) / 1_000_000_000).toFixed(2)} Md GNF`}
                        </h3>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px] px-2 py-0.5">DISPONIBLE</Badge>
                            <p className="text-[10px] text-slate-400 font-bold">{paiements.filter((p: Record<string, any>) => p.statut === 'ready').length} paiements en attente d'OV</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white border-t-4 border-t-emerald-500 overflow-hidden">
                    <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Encaisse Disponible (GNF)</p>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Coins className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 font-outfit">
                            {isLoadingStats ? <span className="text-sm">Chargement...</span> : `${((financeStats?.totalAvailable || 0) / 1_000_000_000).toFixed(2)} Md GNF`}
                        </h3>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[10px] px-2 py-0.5">COMPTES BANCAIRES</Badge>
                            <p className="text-[10px] text-slate-400 font-bold">Solde consolidé au {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white border-t-4 border-t-amber-500 overflow-hidden">
                    <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Engagements Dûs (30J)</p>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 font-outfit">
                            {isLoadingStats ? <span className="text-sm">Chargement...</span> : `${((financeStats?.totalDue || 0) / 1_000_000_000).toFixed(2)} Md GNF`}
                        </h3>
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                            <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[10px] px-2 py-0.5">À PLANIFIER</Badge>
                            <p className="text-[10px] text-slate-400 font-bold">{paiements.filter((p: any) => p.statut === 'EN_ATTENTE').length} factures à ordonnancer</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-slate-900 text-white border-t-4 border-t-primary overflow-hidden relative">
                    <CardContent className="p-6 space-y-3 relative z-10">
                        <div className="flex justify-between items-start text-slate-400">
                            <p className="text-xs font-black uppercase tracking-widest leading-none">Prévisions de Recettes</p>
                            <div className="p-2 bg-white/5 rounded-lg">
                                <ArrowRightLeft className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black font-outfit text-white">
                            {isLoadingStats ? <span className="text-sm">Chargement...</span> : `5.40 Md`}
                        </h3>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <Badge className="bg-primary/20 text-primary-foreground border-none font-bold text-[10px] px-2 py-0.5 tracking-tighter">PROJECTED</Badge>
                            <p className="text-[10px] text-slate-400 font-bold">Flux entrants attendus (PROG)</p>
                        </div>
                    </CardContent>
                    <div className="absolute -bottom-4 -right-4 opacity-10">
                        <History className="h-24 w-24" />
                    </div>
                </Card>
            </div>

            {/* Payment Queue */}
            <Card className="border-none shadow-md overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b flex flex-col md:flex-row items-center justify-between py-5 px-6 gap-4">
                    <div>
                        <CardTitle className="text-xl font-black font-outfit uppercase">Ordonnancement des Paiements</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">Factures Validées par la Comptabilité</CardDescription>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher par fournisseur..."
                            className="h-10 pl-10 text-sm border-slate-200 bg-white shadow-sm"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {isLoadingPaiements ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <Loader className="h-8 w-8 animate-spin mx-auto mb-3" />
                                Synchronisation des écritures bancaires...
                            </div>
                        ) : errorPaiements ? (
                            <div className="p-12 text-center text-red-600 font-bold">
                                Erreur de communication avec le système financier
                            </div>
                        ) : filteredPaiements.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                                <CreditCard className="h-12 w-12 opacity-10" />
                                <p className="font-bold uppercase tracking-widest text-xs">Aucun paiement en attente</p>
                            </div>
                        ) : (
                            filteredPaiements.map((pay: Record<string, any>, i: number) => (
                                <div key={pay.id || i} className="p-5 hover:bg-slate-50 transition-all flex items-center justify-between group border-l-4 border-l-transparent hover:border-l-primary">
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 flex items-center justify-center bg-slate-100 text-slate-600 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <Send className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-900 leading-none">{pay.fournisseur_id?.toUpperCase() || 'BIO-PHARMA INC.'}</p>
                                            <p className="text-[10px] text-muted-foreground font-black mt-1.5 uppercase tracking-widest flex items-center gap-2">
                                                <span>#PAY-{pay.id?.slice(0, 8).toUpperCase()}</span>
                                                <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                                                <span>DATE: {new Date(pay.created_at).toLocaleDateString('fr-FR')}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900 font-outfit">{(parseFloat(pay.montant || 0) / 1_000_000).toFixed(1)} M GNF</p>
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-black px-2 py-0 h-4 border-none uppercase tracking-tighter mt-1",
                                                pay.statut === 'ready' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                                            )}>{pay.statut === 'ready' ? 'Bon à payer' : 'En attente'}</Badge>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-primary hover:bg-primary/90 text-white font-black text-xs h-10 px-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                                            onClick={() => handleGeneratePaymentOrder(pay.id)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                                            GÉNÉRER ORDRE DE VIREMENT
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Initier un Nouveau Virement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Référence de Paiement</Label>
                            <Input
                                value={form.numero_paiement}
                                onChange={e => setForm({ ...form, numero_paiement: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Facture (ID)</Label>
                            <Input
                                placeholder="ID de la facture"
                                value={form.facture_id}
                                onChange={e => setForm({ ...form, facture_id: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Montant (GNF)</Label>
                            <Input
                                type="number"
                                value={form.montant}
                                onChange={e => setForm({ ...form, montant: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mode de Paiement</Label>
                            <Select value={form.mode_paiement} onValueChange={v => setForm({ ...form, mode_paiement: v as Paiement['mode_paiement'] })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VIREMENT_BANCAIRE">Virement Bancaire</SelectItem>
                                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                    <SelectItem value="CHEQUE">Chèque</SelectItem>
                                    <SelectItem value="ESPECES">Espèces</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                        <Button
                            onClick={submitCreatePaiement}
                            disabled={createPaiement.isPending || !form.facture_id}
                        >
                            {createPaiement.isPending ? "Création..." : "Confirmer le Virement"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TreasuryPage;
