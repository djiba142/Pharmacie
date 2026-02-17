
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Coins, ArrowRightLeft, CreditCard,
    Send, History, Plus, Search,
    CheckCircle2, Clock, Loader
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useFinance } from '@/hooks/useFinance';
import { toast } from 'sonner';

const TreasuryPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");
    const { usePaiements } = useFinance();
    
    // Charger les paiements depuis Supabase
    const { data: paiements = [], isLoading: isLoadingPaiements, error: errorPaiements } = usePaiements();

    // Filtrer les paiements
    const filteredPaiements = useMemo(() => {
        if (!searchFilter) return paiements;
        return paiements.filter((pay: Record<string, any>) => 
            pay.fournisseur_id?.toLowerCase().includes(searchFilter.toLowerCase())
        );
    }, [paiements, searchFilter]);

    // Calculer les statistiques
    const stats = useMemo(() => {
        const totalAvailable = paiements.reduce((sum: number, p: Record<string, any>) => {
            return sum + (p.statut === 'ready' ? parseFloat(p.montant || 0) : 0);
        }, 0);
        
        const totalDue = paiements.reduce((sum: number, p: Record<string, any>) => {
            return sum + (p.statut === 'pending' ? parseFloat(p.montant || 0) : 0);
        }, 0);

        return { totalAvailable, totalDue };
    }, [paiements]);

    const handleGeneratePaymentOrder = async (paymentId: string) => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('paiements')
                .update({ 
                    statut: 'order_generated'
                })
                .eq('id', paymentId)
                .select()
                .single();
            
            if (error) throw error;
            toast.success(`Ordre de virement ${paymentId} généré avec succès`);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la génération de l\'ordre de virement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNewTransfer = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('paiements')
                .insert({
                    montant: 0,
                    facture_id: '',
                    mode_paiement: 'virement'
                } as any)
                .select()
                .single();
            
            if (error) throw error;
            toast.success('Nouveau virement créé');
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la création du virement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewHistory = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('paiements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);
            
            if (error) throw error;
            toast.success(`${data?.length || 0} paiements chargés`);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement de l\'historique');
        } finally {
            setIsLoading(false);
        }
    };
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
                <Card className="border-none shadow-md bg-white border-t-4 border-t-green-500">
                    <CardContent className="p-6 space-y-2">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Solde Disponible</p>
                            <Coins className="h-5 w-5 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 font-outfit">
                            {isLoadingPaiements ? <span className="text-sm">Chargement...</span> : `${(stats.totalAvailable / 1_000_000_000).toFixed(2)} Md GNF`}
                        </h3>
                        <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> {paiements.filter((p: Record<string, any>) => p.statut === 'ready').length} paiements prêts
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white border-t-4 border-t-amber-500">
                    <CardContent className="p-6 space-y-2">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Paiements Dûs (30J)</p>
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 font-outfit">
                            {isLoadingPaiements ? <span className="text-sm">Chargement...</span> : `${(stats.totalDue / 1_000_000_000).toFixed(2)} Md GNF`}
                        </h3>
                        <p className="text-xs text-amber-600 font-bold">{paiements.filter((p: Record<string, any>) => p.statut === 'pending').length} factures à régler</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-slate-900 text-white border-t-4 border-t-primary">
                    <CardContent className="p-6 space-y-2">
                        <div className="flex justify-between items-start text-slate-400">
                            <p className="text-xs font-bold uppercase tracking-widest">Prévisions Entrantes</p>
                            <History className="h-5 w-5" />
                        </div>
                        <h3 className="text-3xl font-black font-outfit text-white">
                            {isLoadingPaiements ? <span className="text-sm">Chargement...</span> : `${(paiements.filter((p: Record<string, any>) => p.statut === 'forecast').reduce((s: number, p: Record<string, any>) => s + parseFloat(p.montant || 0), 0) / 1_000_000_000).toFixed(2)} Md`}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold">{paiements.filter((p: Record<string, any>) => p.statut === 'forecast').length} virements attendus</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Queue */}
            <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">File d'Attente des Paiements</CardTitle>
                        <CardDescription>Factures approuvées prêtes pour ordre de virement</CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filtrer par fournisseur..." 
                            className="h-8 pl-9 text-xs"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {isLoadingPaiements ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
                                Chargement des paiements...
                            </div>
                        ) : errorPaiements ? (
                            <div className="p-8 text-center text-red-600">
                                Erreur lors du chargement des paiements
                            </div>
                        ) : filteredPaiements.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Aucun paiement trouvé
                            </div>
                        ) : (
                            filteredPaiements.map((pay: Record<string, any>, i: number) => (
                                <div key={pay.id || i} className="p-4 hover:bg-muted/30 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <Send className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{pay.fournisseur_id || 'Fournisseur'}</p>
                                            <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 uppercase tracking-wider">
                                                ID: {pay.id?.slice(0, 8)} • CRÉÉ: {new Date(pay.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900 font-outfit">{(parseFloat(pay.montant || 0) / 1_000_000).toFixed(0)} M GNF</p>
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-bold px-1.5 py-0 h-4 border-none uppercase",
                                                pay.statut === 'ready' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                                            )}>{pay.statut || 'Draft'}</Badge>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-primary border-primary/20 hover:bg-primary/10 font-bold text-xs h-8"
                                            onClick={() => handleGeneratePaymentOrder(pay.id)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader className="h-3 w-3 mr-1 animate-spin" /> : null}
                                            Générer Ordre
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TreasuryPage;
