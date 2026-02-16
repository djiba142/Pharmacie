import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileDown, Search, Filter, ShieldAlert, Eye, Info } from 'lucide-react';
import { AuditLog } from '@/types/audit';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";

export default function AuditPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');
    const { logs, isLoading } = useAuditLogs({ search: searchTerm, status: statusFilter });
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const handleExport = (format: 'csv' | 'json') => {
        const dataStr = format === 'json'
            ? JSON.stringify(logs, null, 2)
            : logs.map(l => `${l.timestamp},${l.user_name},${l.action},${l.entity_type},${l.status}`).join('\n');

        const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${new Date().toISOString()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Journal d'Audit
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Traçabilité complète et sécurisée des opérations système
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExport('csv')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('json')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export JSON
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="logs" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="logs">Logs Système</TabsTrigger>
                    <TabsTrigger value="info">Documentation & Règles</TabsTrigger>
                </TabsList>

                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtres de recherche</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Rechercher par utilisateur, action, ID..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                                    <SelectTrigger className="w-[180px]">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            <SelectValue placeholder="Statut" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous les statuts</SelectItem>
                                        <SelectItem value="SUCCESS">Succès</SelectItem>
                                        <SelectItem value="FAILURE">Échec</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date / Heure</TableHead>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Entité</TableHead>
                                        <TableHead>IP</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Détails</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                Chargement des logs...
                                            </TableCell>
                                        </TableRow>
                                    ) : logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                Aucun log trouvé pour ces critères.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id} className="hover:bg-gray-50/50">
                                                <TableCell className="font-medium text-xs">
                                                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{log.user_name}</span>
                                                        <span className="text-xs text-gray-500">{log.user_role}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {log.entity_type}
                                                        <span className="text-xs text-gray-400 block">{log.entity_id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-gray-500">
                                                    {log.ip_address}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}>
                                                        {log.status === 'SUCCESS' ? 'Succès' : 'Échec'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Sheet>
                                                        <SheetTrigger asChild>
                                                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                                                                <Eye className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                        </SheetTrigger>
                                                        <SheetContent className="overflow-y-auto sm:max-w-[540px]">
                                                            <SheetHeader className="mb-6">
                                                                <SheetTitle className="text-xl flex items-center gap-2">
                                                                    <Info className="h-5 w-5 text-blue-600" />
                                                                    Détails du Log
                                                                </SheetTitle>
                                                                <SheetDescription>
                                                                    ID: <span className="font-mono text-xs">{log.id}</span>
                                                                </SheetDescription>
                                                            </SheetHeader>

                                                            <div className="space-y-6">
                                                                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <span className="text-gray-500">Utilisateur:</span>
                                                                        <span className="font-medium">{log.user_name}</span>

                                                                        <span className="text-gray-500">Email:</span>
                                                                        <span className="font-medium">{log.user_email}</span>

                                                                        <span className="text-gray-500">Rôle:</span>
                                                                        <span className="font-medium">{log.user_role}</span>

                                                                        <span className="text-gray-500">Action:</span>
                                                                        <Badge variant="outline">{log.action}</Badge>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Contexte Technique</h3>
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <span className="text-gray-500">IP:</span>
                                                                        <span className="font-mono">{log.ip_address}</span>
                                                                        <span className="text-gray-500">Navigateur:</span>
                                                                        <span className="text-xs text-gray-600 break-words">{log.user_agent}</span>
                                                                    </div>
                                                                </div>

                                                                {log.changes && (
                                                                    <div className="space-y-2">
                                                                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Modifications</h3>
                                                                        <div className="bg-slate-900 text-slate-50 p-3 rounded-md text-xs font-mono overflow-x-auto">
                                                                            <div className="mb-2">
                                                                                <span className="text-red-400">- AVANT:</span>
                                                                                <pre>{JSON.stringify(log.changes.before, null, 2)}</pre>
                                                                            </div>
                                                                            <div>
                                                                                <span className="text-green-400">+ APRÈS:</span>
                                                                                <pre>{JSON.stringify(log.changes.after, null, 2)}</pre>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {log.metadata && (
                                                                    <div className="space-y-2">
                                                                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Métadonnées</h3>
                                                                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                                                                            {JSON.stringify(log.metadata, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </SheetContent>
                                                    </Sheet>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-orange-500" />
                                Politique d'Audit et Sécurité
                            </CardTitle>
                            <CardDescription>
                                Informations sur la rétention, la conformité et l'interprétation des logs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="prose max-w-none text-sm text-gray-700 space-y-6">

                            <section>
                                <h3 className="text-lg font-semibold text-gray-900">1. Qui peut accéder aux logs ?</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>Accès complet :</strong> SUPER_ADMIN, ADMIN_CENTRAL, MIN_IG (Inspection Générale).</li>
                                    <li><strong>Accès partiel :</strong> ADMIN_DRS, ADMIN_DPS (limité à leur périmètre géographique).</li>
                                    <li><strong>Aucun accès :</strong> Personnel de soins, Pharmacies privées, Livreurs.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-gray-900">2. Rétention des données</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                        <span className="font-semibold block text-blue-900">Authentification</span>
                                        12 mois (Sécurité & Conformité)
                                    </div>
                                    <div className="bg-green-50 p-3 rounded border border-green-100">
                                        <span className="font-semibold block text-green-900">Mouvements de Stocks</span>
                                        10 ans (Traçabilité Pharmaceutique)
                                    </div>
                                    <div className="bg-purple-50 p-3 rounded border border-purple-100">
                                        <span className="font-semibold block text-purple-900">Pharmacovigilance</span>
                                        25 ans (Réglementation OMS/DNPM)
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold text-gray-900">3. Interprétation des logs suspects</h3>
                                <div className="space-y-3 mt-2">
                                    <div className="flex items-start gap-3">
                                        <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
                                        <div>
                                            <strong className="text-gray-900">Brute Force Attack :</strong>
                                            <p>Plus de 10 échecs de connexion (LOGIN_FAILED) depuis la même IP en moins de 5 minutes.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
                                        <div>
                                            <strong className="text-gray-900">Accès Hors Horaires :</strong>
                                            <p>Connexions ou modifications de stock effectuées la nuit (ex: 03h00) ou les weekends sans astreinte.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5" />
                                        <div>
                                            <strong className="text-gray-900">Modifications Massives :</strong>
                                            <p>Suppression ou mise à jour de plus de 50 articles de stock en une seule session.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
                                <p className="font-medium text-yellow-800">Note sur l'intégrité</p>
                                <p className="text-yellow-700 mt-1">
                                    Les logs sont enregistrés sur un support immuable. Il est techniquement impossible de modifier ou supprimer une entrée de journal une fois celle-ci créée, garantissant une preuve fiable en cas d'audit légal.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
