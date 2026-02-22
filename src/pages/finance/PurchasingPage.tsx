
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useFinance } from '@/hooks/useFinance';
import { useAuthStore } from '@/store/authStore';
import { BonCommandeFinance } from '@/types/finance';
import { toast } from 'sonner';

const PurchasingPage = () => {
    const { user } = useAuthStore();
    const { useBonsCommande, useValidateBC, useCreateBonCommande, useAppelsOffres } = useFinance();

    // Charger les bons de commande depuis Supabase
    const { data: bonsCommande = [], isLoading: isLoadingPOs, error: errorPOs } = useBonsCommande();
    const validateBC = useValidateBC();
    const createBC = useCreateBonCommande();
    const { data: appelsOffres = [], isLoading: isLoadingTenders } = useAppelsOffres();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState<{
        numero_bc: string;
        fournisseur_nom: string;
        montant_total: number;
        statut: BonCommandeFinance['statut'];
    }>({
        numero_bc: `BC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        fournisseur_nom: '',
        montant_total: 0,
        statut: 'CREE'
    });

    // Filtrer les POs en attente de validation (statut CREE)
    const posToValidate = useMemo(() => {
        return (bonsCommande as BonCommandeFinance[]).filter(po => po.statut === 'CREE');
    }, [bonsCommande]);

    const handleValidatePO = async (poId: string) => {
        if (!user) {
            toast.error("Connexion requise");
            return;
        }
        validateBC.mutate({ id: poId, approvedBy: user.id });
    };

    const handleCreateNewMarket = () => {
        setIsCreateOpen(true);
    };

    const submitCreateBC = () => {
        if (!user) {
            toast.error("Connexion requise");
            return;
        }
        createBC.mutate({
            ...form,
            demandeur_id: user.id,
            demandeur_type: user.entity_type || 'PCG',
            devise: 'GNF',
            date_bc: new Date().toISOString()
        }, {
            onSuccess: () => setIsCreateOpen(false)
        });
    };

    const handleViewAllTenders = () => {
        toast.info("Accès aux archives des appels d'offres...");
    };

    const isLoading = validateBC.isPending || createBC.isPending;
    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Achats & Marchés Publics</h1>
                    <p className="text-muted-foreground mt-1">Gestion des bons de commande et des appels d'offres internationaux.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={() => toast.info("Ouverture de l'outil de tri avancé...")}
                    >
                        <ArrowUpDown className="h-4 w-4 mr-2" /> Trier
                    </Button>
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
                <Card className="border-none shadow-md overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-4">
                        <div>
                            <CardTitle className="text-xl font-bold font-outfit uppercase">Validations en Attente</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-500">Flux d'approbation (DAF/Comptable)</CardDescription>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FileCheck className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {isLoadingPOs ? (
                                <div className="p-12 text-center text-muted-foreground">
                                    <Loader className="h-8 w-8 animate-spin mx-auto mb-3" />
                                    Récupération des dossiers...
                                </div>
                            ) : errorPOs ? (
                                <div className="p-12 text-center text-red-600 font-bold">
                                    Erreur de connexion au serveur
                                </div>
                            ) : posToValidate.length === 0 ? (
                                <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                                    <FileCheck className="h-10 w-10 opacity-20" />
                                    <p className="font-bold">Aucune validation en attente</p>
                                    <p className="text-xs">Toutes les demandes ont été traitées.</p>
                                </div>
                            ) : (
                                posToValidate.map((po: Record<string, any>, i: number) => (
                                    <div
                                        key={po.id || i}
                                        className="p-5 hover:bg-slate-50 transition-all group flex items-center justify-between cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                                        onClick={() => handleValidatePO(po.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-600 font-black text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">BC</div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-tight">BC-{po.id?.slice(0, 8).toUpperCase()}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                                                    {po.demandeur_id?.slice(0, 15) || 'DPS KINDIA'} • {new Date(po.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">{(parseFloat(po.montant || 0) / 1_000_000).toFixed(1)} M GNF</p>
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-black px-2 py-0 h-4 border-none uppercase tracking-tighter mt-1",
                                                    po.statut === 'urgent' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                )}>{po.statut === 'urgent' ? 'Prioritaire' : 'Standard'}</Badge>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                    <div className="p-4 bg-slate-50/50 border-t text-center">
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-600 hover:text-primary" onClick={() => handleViewAllTenders()}>
                            Voir l'historique complet des engagements →
                        </Button>
                    </div>
                </Card>

                {/* Tenders (Appels d'Offres) */}
                <Card className="border-none shadow-md overflow-hidden bg-slate-900 text-white relative flex flex-col">
                    <CardHeader className="border-b border-white/10 py-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary/20 text-primary-foreground border border-primary/30 text-[9px] font-black tracking-widest uppercase">IA Procurement Matcher</Badge>
                        </div>
                        <CardTitle className="text-xl font-bold font-outfit uppercase">Appels d'Offres & Tenders</CardTitle>
                        <CardDescription className="text-slate-400 text-xs">Analyse assistée par IA pour la sélection du fournisseur optimal.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 flex-1">
                        <div className="space-y-4">
                            {isLoadingTenders ? (
                                <div className="text-center py-10 opacity-50">Analyse des offres en cours...</div>
                            ) : appelsOffres.length > 0 ? (
                                appelsOffres.map((ao: any) => (
                                    <div key={ao.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-5 relative overflow-hidden group hover:bg-white/[0.08] transition-colors">
                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <h4 className="text-sm font-black tracking-tight">{ao.numero_ao}</h4>
                                                <p className="text-xs text-slate-400 mt-1">{ao.objet}</p>
                                            </div>
                                            <Badge className={cn(
                                                "border-none font-bold text-[10px]",
                                                ao.statut === 'PUBLIE' ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                                            )}>{ao.statut}</Badge>
                                        </div>
                                        <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform">
                                            <Gavel className="h-24 w-24" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-5 relative overflow-hidden group hover:bg-white/[0.08] transition-colors">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <h4 className="text-sm font-black tracking-tight">AO-2025-PCG-0023</h4>
                                            <p className="text-xs text-slate-400 mt-1">Acquisition de Réactifs Laboratoire (Fonds Mondial)</p>
                                        </div>
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-bold text-[10px]">ANALYSE TERMINÉE</Badge>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <Cpu className="h-3 w-3 text-primary" /> Choix Recommandé :
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-primary/20 rounded-xl border border-primary/40 ring-1 ring-primary/30">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-amber-400/20 rounded-lg">
                                                    <Trophy className="h-4 w-4 text-amber-400" />
                                                </div>
                                                <span className="text-xs font-black">Bio-Pharma Guinée SARL</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-black text-primary uppercase">Score : 94/100</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg">
                                            <p className="text-[10px] text-slate-300 leading-relaxed italic">
                                                "Facteurs clés : Meilleur prix unitaire (-12%), délais de livraison garantis sous 30 jours, conformité ISO 9001 confirmée."
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform">
                                        <Gavel className="h-24 w-24" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black border-none shadow-xl py-6 rounded-2xl"
                            onClick={handleViewAllTenders}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader className="h-5 w-5 mr-2 animate-spin" /> : <Gavel className="h-5 w-5 mr-2" />}
                            DÉPOUILLER LES OFFRES
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouveau Marché / BC</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Référence BC</Label>
                            <Input
                                value={form.numero_bc}
                                onChange={e => setForm({ ...form, numero_bc: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Fournisseur</Label>
                            <Input
                                placeholder="Nom du fournisseur"
                                value={form.fournisseur_nom}
                                onChange={e => setForm({ ...form, fournisseur_nom: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Montant Total (GNF)</Label>
                            <Input
                                type="number"
                                value={form.montant_total}
                                onChange={e => setForm({ ...form, montant_total: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Priorité</Label>
                            <Select value={form.statut} onValueChange={(v: string) => setForm({ ...form, statut: v as BonCommandeFinance['statut'] })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CREE">Standard</SelectItem>
                                    <SelectItem value="urgent">Prioritaire (Urgent)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                        <Button
                            onClick={submitCreateBC}
                            disabled={createBC.isPending || !form.fournisseur_nom}
                        >
                            {createBC.isPending ? "Création..." : "Confirmer le Marché"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PurchasingPage;
