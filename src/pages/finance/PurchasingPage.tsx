
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileCheck, Gavel, ArrowUpDown,
    Trophy, Cpu,
    ChevronRight, Plus, Loader
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useFinance } from '@/hooks/useFinance';
import { toast } from 'sonner';

const PurchasingPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { useBonsCommande } = useFinance();
    
    // Charger les bons de commande depuis Supabase
    const { data: bonsCommande = [], isLoading: isLoadingPOs, error: errorPOs } = useBonsCommande();

    // Filtrer les POs en attente de validation
    const posToValidate = useMemo(() => {
        return bonsCommande.filter((po: Record<string, any>) => po.statut === 'pending' || po.statut === 'draft');
    }, [bonsCommande]);

    const handleValidatePO = async (poId: string) => {
        try {
            setIsLoading(true);
            // Appeler Supabase pour valider le PO
            const { data, error } = await supabase
                .from('bons_commande')
                .update({ statut: 'approved', date_approbation: new Date().toISOString() })
                .eq('id', poId)
                .select()
                .single();
            
            if (error) throw error;
            toast.success(`Bon de commande ${poId} validé`);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la validation du bon de commande');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNewMarket = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('bons_commande')
                .insert({
                    demandeur_id: 'current_user',
                    demandeur_type: 'health_facility'
                } as any)
                .select()
                .single();
            
            if (error) throw error;
            toast.success('Nouveau marché public créé');
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de la création du marché');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewAllTenders = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('bons_commande')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            toast.success(`${data?.length || 0} appels d'offres chargés`);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du chargement des appels d\'offres');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Achats & Marchés Publics</h1>
                    <p className="text-muted-foreground mt-1">Gestion des bons de commande et des appels d'offres internationaux.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white"><ArrowUpDown className="h-4 w-4 mr-2" /> Trier</Button>
                    <Button 
                        size="sm" 
                        className="bg-primary shadow-md hover:shadow-lg transition-all"
                        onClick={handleCreateNewMarket}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                        Nouveau Marché
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* PO Validation Queue */}
                <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
                    <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold">Bons de Commande à Valider</CardTitle>
                            <CardDescription>Flux d'approbation DAF / Responsable</CardDescription>
                        </div>
                        <FileCheck className="h-5 w-5 text-primary opacity-50" />
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {isLoadingPOs ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    Chargement des bons de commande...
                                </div>
                            ) : errorPOs ? (
                                <div className="p-8 text-center text-red-600">
                                    Erreur lors du chargement des bons de commande
                                </div>
                            ) : posToValidate.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    Aucun bon de commande en attente
                                </div>
                            ) : (
                                posToValidate.map((po: Record<string, any>, i: number) => (
                                    <div 
                                        key={po.id || i} 
                                        className="p-4 hover:bg-muted/50 transition-all group flex items-center justify-between cursor-pointer"
                                        onClick={() => handleValidatePO(po.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-xl text-primary font-bold text-xs">PO</div>
                                            <div>
                                                <p className="text-sm font-bold group-hover:text-primary transition-colors">{po.id?.slice(0, 12)}</p>
                                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                                    {po.demandeur_id || 'Demandeur'} • {new Date(po.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-800">{(parseFloat(po.montant || 0) / 1_000_000).toFixed(0)} M GNF</p>
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-bold px-1.5 py-0 h-4 border-none uppercase",
                                                    po.statut === 'urgent' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                                                )}>{po.statut || 'Draft'}</Badge>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                    <div className="p-3 bg-slate-50 border-t text-center">
                        <button 
                            className="text-xs font-bold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleViewAllTenders()}
                            disabled={isLoading}
                        >
                            Voir {bonsCommande.length - posToValidate.length} autres demandes
                        </button>
                    </div>
                </Card>

                {/* Tenders (Appels d'Offres) */}
                <Card className="border-none shadow-md overflow-hidden bg-slate-900 text-white relative">
                    <CardHeader className="border-b border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 px-2 bg-primary/20 text-primary-foreground border border-primary/30 rounded text-[10px] font-bold tracking-widest uppercase">IA Matching</div>
                        </div>
                        <CardTitle className="text-lg font-bold">Appels d'Offres en Evaluation</CardTitle>
                        <CardDescription className="text-slate-400">Analyse prédictive du meilleur rapport qualité-prix.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-bold">AO-2025-PCG-0023</h4>
                                        <p className="text-xs text-slate-400">Achat Antipaludéens (Fonds Mondial)</p>
                                    </div>
                                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Analyse Terminée</Badge>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <Cpu className="h-3 w-3" /> Recommandation IA :
                                    </p>
                                    <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg border border-primary/30 ring-1 ring-primary/20">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4 text-amber-400" />
                                            <span className="text-xs font-bold">PharmaMaroc Industries</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-primary">SCORING 88/100</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">"Meilleur délai de livraison (45J) et certification OMS valide."</p>
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold border-none shadow-lg"
                            onClick={handleViewAllTenders}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Gavel className="h-4 w-4 mr-2" />}
                            Voir tous les Appels d'Offres
                        </Button>
                    </CardContent>
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Gavel className="h-24 w-24" />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PurchasingPage;
