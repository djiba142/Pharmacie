
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, AlertCircle, Search, Loader } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import ThreeWayMatch from '@/components/finance/ThreeWayMatch';
import { supabase } from '@/integrations/supabase/client';
import { useFinance } from '@/hooks/useFinance';
import { toast } from 'sonner';

const AccountingPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Record<string, any> | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { useFactures } = useFinance();

    // Charger les factures depuis Supabase
    const { data: factures = [], isLoading: isLoadingInvoices, error: errorInvoices } = useFactures();

    // Sélectionner la première facture par défaut
    useEffect(() => {
        if (!selectedInvoice && factures.length > 0) {
            setSelectedInvoice(factures[0]);
        }
    }, [factures, selectedInvoice]);

    // Filtrer les factures
    const filteredFactures = useMemo(() => {
        if (!searchTerm) return factures;
        return factures.filter((f: any) => 
            f.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.fournisseur_nom?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [factures, searchTerm]);

    const handleApproveInvoice = async (invoiceId: string) => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('factures')
                .update({ 
                    statut: 'approved',
                    date_approbation: new Date().toISOString()
                })
                .eq('id', invoiceId)
                .select()
                .single();
            
            if (error) throw error;
            toast.success(`Facture ${invoiceId} approuvée pour paiement`);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors de l\'approbation de la facture');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectInvoice = async (invoiceId: string) => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('factures')
                .update({ 
                    statut: 'rejected',
                    commentaire_verification: 'Discrepancy detected - 3-way match failed'
                })
                .eq('id', invoiceId)
                .select()
                .single();
            
            if (error) throw error;
            toast.success(`Facture ${invoiceId} rejetée - Demande d'avoir créée`);
        } catch (error) {
            console.error('Erreur:', error);
            toast.error('Erreur lors du rejet de la facture');
        } finally {
            setIsLoading(false);
        }
    };
    const matchingItems = [
        { label: "Paracétamol 500mg (Boîte 100)", bc: "500", br: "500", invoice: "500", isMatch: true },
        { label: "Artéméther Injectable", bc: "200", br: "180", invoice: "200", isMatch: false },
        { label: "Amoxicilline 500mg", bc: "1000", br: "1000", invoice: "1000", isMatch: true },
        { label: "Seringues 5ml", bc: "5000", br: "5000", invoice: "5000", isMatch: true },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Comptabilité & Facturation</h1>
                    <p className="text-muted-foreground mt-1">Traitement des factures fournisseurs et rapprochement tripartite.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Rechercher une facture..." 
                        className="pl-10 bg-white shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="verification" className="space-y-6">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="verification" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Vérification (3-Way Match)
                    </TabsTrigger>
                    <TabsTrigger value="factures" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Toutes les Factures
                    </TabsTrigger>
                    <TabsTrigger value="journal" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Journal Comptable
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="verification" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm">
                            <CardHeader className="bg-muted/20 border-b flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Vérification Facture #FAC-PCG-0567</CardTitle>
                                    <CardDescription>Comparaison automatisée entre Commande, Réception et Facture</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En cours</Badge>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ThreeWayMatch
                                    items={matchingItems}
                                    invoiceId="FAC-PCG-2025-0567"
                                    bcId="BC-2025-0234"
                                    brId="BR-2025-0812"
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Résumé Fournisseur</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">PC</div>
                                        <div>
                                            <p className="font-bold text-sm">PCG Centrale</p>
                                            <p className="text-xs text-muted-foreground">Fournisseur National Agréé</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total HT</p>
                                            <p className="text-sm font-bold">1 850 000 GNF</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">TVA (18%)</p>
                                            <p className="text-sm font-bold">333 000 GNF</p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t mt-4">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total TTC</p>
                                        <p className="text-2xl font-black text-slate-900 font-outfit">2 183 000 GNF</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-2">
                                <button 
                                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleApproveInvoice("FAC-PCG-2025-0567")}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Approuver pour Paiement
                                </button>
                                <button 
                                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleRejectInvoice("FAC-PCG-2025-0567")}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
                                    Rejeter / Demander Avoir
                                </button>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="factures">
                    <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            {isLoadingInvoices ? (
                                <div className="text-center py-12">
                                    <Loader className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    <p className="text-muted-foreground mt-2">Chargement des factures...</p>
                                </div>
                            ) : errorInvoices ? (
                                <div className="text-center py-12 text-red-600">
                                    Erreur lors du chargement des factures
                                </div>
                            ) : filteredFactures.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    Aucune facture trouvée
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                                    {filteredFactures.map((facture: Record<string, any>) => (
                                        <div key={facture.id} className="p-4 hover:bg-muted/50 transition-all cursor-pointer flex items-center justify-between group">
                                            <div>
                                                <p className="text-sm font-bold group-hover:text-primary">{facture.id}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {facture.fournisseur_nom} • {new Date(facture.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{(parseFloat(facture.montant_ttc || 0) / 1_000_000).toFixed(0)} M GNF</p>
                                                    <Badge className={cn(
                                                        facture.statut === 'approved' ? "bg-green-100 text-green-700" :
                                                        facture.statut === 'rejected' ? "bg-red-100 text-red-700" :
                                                        "bg-blue-100 text-blue-700"
                                                    )}>{facture.statut || 'Draft'}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AccountingPage;
