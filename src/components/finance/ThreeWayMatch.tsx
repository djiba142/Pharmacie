
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MatchItem {
    label: string;
    bc: string | number;
    br: string | number;
    invoice: string | number;
    isMatch: boolean;
}

interface ThreeWayMatchProps {
    items: MatchItem[];
    invoiceId: string;
    bcId: string;
    brId: string;
}

const ThreeWayMatch: React.FC<ThreeWayMatchProps> = ({ items, invoiceId, bcId, brId }) => {
    return (
        <div className="space-y-4">
            <div className="flex gap-4 text-xs font-medium mb-4">
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    <span className="opacity-70">BC:</span> <span>{bcId}</span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    <span className="opacity-70">BR:</span> <span>{brId}</span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-800 rounded">
                    <span className="opacity-70">Facture:</span> <span>{invoiceId}</span>
                </div>
            </div>

            <Table>
                <TableHeader className="bg-muted/50 text-[10px] uppercase tracking-wider">
                    <TableRow>
                        <TableHead>Désignation</TableHead>
                        <TableHead className="text-center">Bon Commande</TableHead>
                        <TableHead className="text-center">Bon Réception</TableHead>
                        <TableHead className="text-center">Facture</TableHead>
                        <TableHead className="text-right">État</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item, idx) => (
                        <TableRow key={idx} className="group hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium text-sm">{item.label}</TableCell>
                            <TableCell className="text-center text-sm">{item.bc}</TableCell>
                            <TableCell className="text-center text-sm">{item.br}</TableCell>
                            <TableCell className="text-center text-sm">{item.invoice}</TableCell>
                            <TableCell className="text-right">
                                {item.isMatch ? (
                                    <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600">
                                        <Check className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 animate-pulse">
                                        <X className="h-4 w-4" />
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {!items.every(i => i.isMatch) && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 mt-4">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                        <h5 className="text-sm font-bold text-red-800">Écart Détecté</h5>
                        <p className="text-xs text-red-700">Des différences ont été identifiées entre les documents. Le paiement est bloqué jusqu'à résolution.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThreeWayMatch;
