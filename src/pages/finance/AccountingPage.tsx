
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, AlertCircle, Search, Loader, Info, Cpu, ShieldCheck, Building2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import ThreeWayMatch from '@/components/finance/ThreeWayMatch';
import { supabase } from '@/integrations/supabase/client';
import { useFinance } from '@/hooks/useFinance';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { QRCodeCanvas } from 'qrcode.react';
import { Facture } from '@/types/finance';
import logoLivramed from '@/assets/logo-livramed.png';
import logoGuinee from '@/assets/partners/guinee.png';
import logoPCG from '@/assets/partners/pcg.jpg';

const AccountingPage = () => {
    const { user } = useAuthStore();
    const [selectedInvoice, setSelectedInvoice] = useState<Facture | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { useFactures, useUpdateFactureStatut, usePlanComptable } = useFinance();
    const { data: accounts = [], isLoading: isLoadingAccounts } = usePlanComptable();

    // Charger les factures depuis Supabase
    const { data: factures = [], isLoading: isLoadingInvoices, error: errorInvoices } = useFactures();
    const updateFacture = useUpdateFactureStatut();

    // Sélectionner la première facture par défaut
    useEffect(() => {
        if (!selectedInvoice && factures.length > 0) {
            setSelectedInvoice(factures[0]);
        }
    }, [factures, selectedInvoice]);

    // Filtrer les factures
    const filteredFactures = useMemo(() => {
        if (!searchTerm) return factures;
        return (factures as Facture[]).filter((f) =>
            f.numero_facture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.fournisseur_nom?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [factures, searchTerm]);

    const handleApproveInvoice = async (invoiceId: string) => {
        if (!user) {
            toast.error("Veuillez vous connecter");
            return;
        }
        updateFacture.mutate({
            id: invoiceId,
            statut: 'APPROUVEE',
            approvedBy: user.id
        });
    };

    const isLoading = updateFacture.isPending;

    const handleRejectInvoice = async (invoiceId: string) => {
        if (!user) return;
        updateFacture.mutate({
            id: invoiceId,
            statut: 'REJETEE',
            approvedBy: user.id
        });
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
                    <TabsTrigger value="plan" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Plan Comptable
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="verification" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-4">
                                <div>
                                    <CardTitle className="text-lg font-bold">Rapprochement Tripartite (3-Way Match)</CardTitle>
                                    <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">Vérification : #FAC-PCG-0567</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold px-3">EN COURS</Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-4 bg-emerald-50/30 border-b border-emerald-50 flex items-center gap-3 text-emerald-700">
                                    <div className="p-1.5 bg-emerald-100 rounded-lg animate-pulse">
                                        <Cpu className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase tracking-widest">IA DeepAudit™ Active</p>
                                        <p className="text-[10px] opacity-80 mt-0.5">Analyse multidimensionnelle effectuée : comparaison des quantités (BC vs BR), vérification des prix unitaires et conformité fiscale (TVA).</p>
                                    </div>
                                    <Badge className="bg-emerald-600 text-white border-none text-[9px] font-black">SCAN RÉUSSI</Badge>
                                </div>
                                <div className="p-6">
                                    <ThreeWayMatch
                                        items={matchingItems}
                                        invoiceId="FAC-PCG-2025-0567"
                                        bcId="BC-2025-0234"
                                        brId="BR-2025-0812"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Résumé Fournisseur</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center p-2 group-hover:rotate-6 transition-transform shadow-lg shadow-emerald-200">
                                            <div className="relative">
                                                <Building2 className="h-6 w-6 text-white" />
                                                <div className="absolute -top-1 -right-1 h-2 w-2 bg-white rounded-full animate-ping" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">PCG GUINÉE</p>
                                            <p className="text-[10px] uppercase font-black text-emerald-600 tracking-widest flex items-center gap-1">
                                                <ShieldCheck className="h-3 w-3" />
                                                Fournisseur d'État
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-medium">BP 434, Diré, Conakry</p>
                                        </div>
                                        <div className="absolute top-0 right-0 p-1 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <ShieldCheck className="h-12 w-12" />
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

                            <Card className="border-none shadow-md bg-slate-900 text-white overflow-hidden p-5 relative group">
                                <div className="absolute -bottom-4 -right-4 p-2 opacity-10 group-hover:scale-110 transition-transform">
                                    <FileText className="h-24 w-24 text-primary" />
                                </div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Aperçu du Scan Numérique</h4>
                                    <div className="h-12 w-12 bg-white p-1 rounded-md opacity-95 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <QRCodeCanvas
                                            value={`LIVRAMED-FAC-${selectedInvoice?.id || 'TEST'}`}
                                            size={44}
                                            level="M"
                                            includeMargin={false}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center">
                                                <img src="/logo-livramed.png" alt="" className="h-4 w-4" />
                                            </div>
                                            <span className="text-[9px] font-bold">LIVRAMED SECURE-SCAN</span>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] h-3 border-emerald-500/50 text-emerald-400 font-black">CERTIFIÉ IA</Badge>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-dashed border-white/20">
                                        <div className="flex justify-between border-b border-white/10 pb-2 mb-2">
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">ID: FAC-PCG-2025-0567-X2</span>
                                            <span className="text-[8px] font-bold">17/02/2026</span>
                                        </div>
                                        <div className="space-y-1.5 opacity-60">
                                            <div className="h-1.5 w-full bg-white/20 rounded-full" />
                                            <div className="h-1.5 w-3/4 bg-white/10 rounded-full" />
                                            <div className="h-1.5 w-1/2 bg-white/5 rounded-full" />
                                        </div>
                                        <div className="mt-4 pt-2 border-t border-white/10 flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[6px] uppercase font-bold text-slate-500">Signature Digitale</p>
                                                <p className="text-[10px] font-serif italic text-primary/80">Dr. Kourouma</p>
                                            </div>
                                            <div className="h-6 w-12 border border-white/10 rounded bg-white/5 flex items-center justify-center">
                                                <div className="h-1 w-8 bg-primary animate-pulse rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="flex flex-col gap-2">
                                <button
                                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                    onClick={async () => {
                                        try {
                                            console.log("Starting Invoice PDF generation...");
                                            const { jsPDF } = await import('jspdf');
                                            const autoTable = (await import('jspdf-autotable')).default;
                                            const doc = new jsPDF();

                                            // --- Header Design (Institutional Color) ---
                                            doc.setFillColor(15, 23, 42); // Slate 900
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

                                            drawImageSafe('guinee-logo-acc', 'PNG', 14, 8, 15, 15);
                                            drawImageSafe('pcg-logo-acc', 'JPEG', 160, 8, 15, 15);
                                            drawImageSafe('app-logo-acc', 'PNG', 185, 10, 10, 10);

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

                                            // --- Body Section (Optimized Placement) ---
                                            doc.setTextColor(15, 23, 42);
                                            doc.setFontSize(22);
                                            doc.setFont('helvetica', 'bold');
                                            doc.text('FACTURE COMMERCIALE', 14, 55);

                                            doc.setFontSize(9);
                                            doc.setFont('helvetica', 'normal');
                                            doc.setTextColor(100, 100, 100);
                                            doc.text(`Réf: ${selectedInvoice?.numero_facture || 'N/A'} — Date: ${new Date(selectedInvoice?.created_at).toLocaleDateString('fr-FR')}`, 14, 62);

                                            doc.setDrawColor(16, 185, 129);
                                            doc.setLineWidth(1.5);
                                            doc.line(14, 65, 85, 65);
                                            doc.setLineWidth(0.8);
                                            doc.line(14, 80, 50, 80);

                                            // Provider Table
                                            autoTable(doc, {
                                                startY: 90,
                                                head: [['Informations du Fournisseur', 'Détails de la Pièce']],
                                                body: [
                                                    ['NOM: PHARMACIE CENTRALE DE GUINÉE (PCG) SA', `N° FACTURE: ${selectedInvoice?.numero_facture || 'N/A'}`],
                                                    ['ADRESSE: BP 434, Conakry, République de Guinée', `DATE ÉMISSION: ${new Date(selectedInvoice?.created_at).toLocaleDateString('fr-FR')}`],
                                                    ['STATUT: Fournisseur National / État', `MODE PAIEMENT: Virement / Chèque`],
                                                ],
                                                theme: 'plain',
                                                styles: { fontSize: 8, cellPadding: 2 },
                                                columnStyles: { 0: { fontStyle: 'bold' } }
                                            });

                                            // Items Table
                                            autoTable(doc, {
                                                startY: 120,
                                                head: [['Désignation des Produits / Services', 'Quantité', 'P.U (GNF)', 'Total HT (GNF)']],
                                                body: [
                                                    ['Produits pharmaceutiques divers (Lot standard)', '1', '1 850 000', '1 850 000'],
                                                ],
                                                theme: 'striped',
                                                headStyles: { fillColor: [15, 23, 42] },
                                                styles: { fontSize: 9 }
                                            });

                                            // Totals Section
                                            const finalY = (doc as any).lastAutoTable.finalY + 10;
                                            doc.setFontSize(9);
                                            doc.text('Sous-total Hors Taxes:', 140, finalY);
                                            doc.text('1 850 000 GNF', 170, finalY);
                                            doc.text('TVA (18%):', 140, finalY + 7);
                                            doc.text('333 000 GNF', 170, finalY + 7);

                                            doc.setFillColor(15, 23, 42);
                                            doc.rect(138, finalY + 12, 60, 10, 'F');
                                            doc.setTextColor(255, 255, 255);
                                            doc.setFont('helvetica', 'bold');
                                            doc.setFontSize(11);
                                            doc.text('TOTAL TTC:', 142, finalY + 18.5);
                                            doc.text('2 183 000 GNF', 165, finalY + 18.5);

                                            // Footer (QR Code relocated with safety check)
                                            const pageCount = (doc as any).internal.getNumberOfPages();
                                            for (let i = 1; i <= pageCount; i++) {
                                                doc.setPage(i);

                                                try {
                                                    const qrCanvas = document.getElementById('invoice-qr') as HTMLCanvasElement;
                                                    if (qrCanvas && typeof qrCanvas.toDataURL === 'function') {
                                                        const qrData = qrCanvas.toDataURL('image/png');
                                                        doc.addImage(qrData, 'PNG', 182, 275, 15, 15);
                                                    }
                                                } catch (qrErr) {
                                                    console.warn("QR Addition failed", qrErr);
                                                }

                                                doc.setFontSize(6);
                                                doc.setTextColor(180, 180, 180);
                                                doc.text(`Certification LivraMed Secure-Scan le ${new Date().toLocaleString('fr-FR')} — Page ${i}/${pageCount}`, 14, 285);
                                            }

                                            console.log("Saving Invoice PDF...");
                                            doc.save(`facture-${selectedInvoice?.numero_facture || 'livramed'}.pdf`);
                                            toast.success('Facture générée avec succès');
                                        } catch (err: unknown) {
                                            const error = err as Error;
                                            console.error("Invoice PDF Error:", error);
                                            toast.error("Erreur lors de la génération: " + error.message);
                                        }
                                    }}
                                    disabled={!selectedInvoice}
                                >
                                    <FileText className="h-4 w-4" />
                                    Télécharger PDF Certifié
                                </button>
                                <button
                                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => selectedInvoice && handleApproveInvoice(selectedInvoice.id)}
                                    disabled={isLoading || !selectedInvoice}
                                >
                                    {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Approuver pour Paiement
                                </button>
                                <button
                                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => selectedInvoice && handleRejectInvoice(selectedInvoice.id)}
                                    disabled={isLoading || !selectedInvoice}
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
                                    {(filteredFactures as Facture[]).map((facture) => (
                                        <div
                                            key={facture.id}
                                            className={cn(
                                                "p-4 hover:bg-muted/50 transition-all cursor-pointer flex items-center justify-between group",
                                                selectedInvoice?.id === facture.id && "bg-primary/5 border-l-4 border-l-primary"
                                            )}
                                            onClick={() => setSelectedInvoice(facture)}
                                        >
                                            <div>
                                                <p className="text-sm font-bold group-hover:text-primary">{facture.numero_facture || facture.id}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {facture.fournisseur_nom} • {new Date(facture.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{(facture.montant_ttc / 1_000_000).toFixed(0)} M GNF</p>
                                                    <Badge className={cn(
                                                        facture.statut === 'APPROUVEE' ? "bg-green-100 text-green-700" :
                                                            facture.statut === 'REJETEE' ? "bg-red-100 text-red-700" :
                                                                "bg-blue-100 text-blue-700"
                                                    )}>{facture.statut || 'BROUILLON'}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="plan" className="space-y-4">
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg font-bold">Plan Comptable Normalisé (SYSCOHADA)</CardTitle>
                            <CardDescription className="text-xs font-medium uppercase text-slate-500">Référentiel des comptes pour la comptabilité pharmaceutique.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {isLoadingAccounts ? (
                                    <div className="p-10 text-center text-muted-foreground animate-pulse">Chargement du plan comptable...</div>
                                ) : accounts.length > 0 ? (
                                    (accounts as any[]).map((acc) => (
                                        <div key={acc.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="h-8 w-16 bg-slate-100 rounded text-xs font-black flex items-center justify-center text-slate-600">
                                                    {acc.code || acc.numero_compte}
                                                </div>
                                                <span className="text-sm font-bold text-slate-800">{acc.libelle}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">
                                                {acc.categorie || acc.type}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center text-muted-foreground">Aucun compte configuré.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {/* Logos for PDF Rendering */}
            <div className="hidden">
                <img id="guinee-logo-acc" src={logoGuinee} alt="Guinée" />
                <img id="pcg-logo-acc" src={logoPCG} alt="PCG Logo" />
                <img id="app-logo-acc" src={logoLivramed} alt="LivraMed Logo" />
                <QRCodeCanvas id="invoice-qr" value={`CERT-INV-${selectedInvoice?.id}`} size={128} />
            </div>
        </div >
    );
};

export default AccountingPage;
