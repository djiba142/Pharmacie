import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft, Search, BookOpen, Play, Users, Package,
    Settings, AlertTriangle, FileText, Zap, ChevronRight,
    Download, Video, CheckCircle, Lock, Truck, ShoppingCart
} from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

interface GuideSection {
    id: string;
    title: string;
    icon: React.ElementType;
    description: string;
    subsections?: { id: string; title: string; }[];
}

const guideSections: GuideSection[] = [
    {
        id: 'intro',
        title: 'Introduction',
        icon: BookOpen,
        description: 'Bienvenue sur LivraMed, conventions et présentation',
        subsections: [
            { id: 'welcome', title: 'Bienvenue sur LivraMed' },
            { id: 'about', title: 'À propos de ce guide' },
            { id: 'conventions', title: 'Conventions utilisées' },
        ]
    },
    {
        id: 'quickstart',
        title: 'Démarrage Rapide',
        icon: Zap,
        description: 'Premiers pas pour tous les utilisateurs',
        subsections: [
            { id: 'first-login', title: 'Première connexion' },
            { id: 'interface', title: 'Découverte de l\'interface' },
            { id: 'profile', title: 'Personnaliser son profil' },
            { id: '2fa', title: 'Activer la 2FA' },
            { id: 'navigation', title: 'Navigation de base' },
        ]
    },
    {
        id: 'roles',
        title: 'Guides par Rôle',
        icon: Users,
        description: 'Guides spécifiques selon votre fonction',
        subsections: [
            { id: 'super-admin', title: 'Super Admin' },
            { id: 'admin-central', title: 'Admin Central' },
            { id: 'admin-drs', title: 'Admin DRS' },
            { id: 'admin-dps', title: 'Admin DPS' },
            { id: 'ministere', title: 'Ministère' },
            { id: 'dnpm', title: 'DNPM' },
            { id: 'pcg', title: 'PCG' },
            { id: 'drs', title: 'DRS (Directeurs, Pharmaciens, Logistique)' },
            { id: 'dps', title: 'DPS (Directeurs, Pharmaciens, Agents)' },
            { id: 'hopital', title: 'Hôpitaux' },
            { id: 'centre-sante', title: 'Centres de Santé' },
            { id: 'pharmacie', title: 'Pharmacies Privées' },
            { id: 'livreur', title: 'Livreurs' },
        ]
    },
    {
        id: 'features',
        title: 'Fonctionnalités Détaillées',
        icon: Settings,
        description: 'Maîtriser toutes les fonctionnalités',
        subsections: [
            { id: 'stocks', title: 'Gestion des Stocks' },
            { id: 'commandes', title: 'Gestion des Commandes' },
            { id: 'livraisons', title: 'Gestion des Livraisons' },
            { id: 'pv', title: 'Pharmacovigilance' },
            { id: 'rapports', title: 'Rapports et Analytics' },
            { id: 'exports', title: 'Exports (DHIS2, e-LMIS)' },
        ]
    },
    {
        id: 'advanced',
        title: 'Procédures Avancées',
        icon: AlertTriangle,
        description: 'Workflows et cas complexes',
        subsections: [
            { id: 'inventaires', title: 'Inventaires' },
            { id: 'peremptions', title: 'Gestion des péremptions' },
            { id: 'rappels', title: 'Rappels de lots' },
            { id: 'workflows', title: 'Workflows de validation' },
            { id: 'optimisation', title: 'Optimisation des commandes' },
        ]
    },
    {
        id: 'annexes',
        title: 'Annexes',
        icon: FileText,
        description: 'Références et ressources',
        subsections: [
            { id: 'glossaire', title: 'Glossaire' },
            { id: 'erreurs', title: 'Codes d\'erreur' },
            { id: 'raccourcis', title: 'Raccourcis clavier' },
            { id: 'depannage', title: 'Dépannage' },
            { id: 'support', title: 'Support et formation' },
        ]
    },
];

export default function GuidePage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    const filteredSections = guideSections.filter(section =>
        searchQuery === '' ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logoLivramed} alt="LivraMed" className="h-9 w-9 rounded-lg" />
                        <span className="font-display font-bold text-lg text-foreground">LivraMed</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à l'accueil
                    </Button>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="h-10 w-10 text-primary" />
                        <h1 className="text-4xl font-display font-bold text-foreground">Guide Utilisateur LivraMed</h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                        Plateforme Nationale de Gestion et de Livraison de Médicaments
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" variant="outline">
                            <Download className="h-5 w-5 mr-2" />
                            Télécharger PDF complet
                        </Button>
                        <Button size="lg" variant="outline">
                            <Video className="h-5 w-5 mr-2" />
                            Tutoriels vidéo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Search */}
            <section className="py-8 bg-muted/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="🔍 Rechercher dans le guide..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 text-base"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Start Banner */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Play className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Nouveau sur LivraMed ?</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Commencez par le guide de démarrage rapide pour configurer votre compte et découvrir l'interface.
                                    </p>
                                    <Button onClick={() => setSelectedSection('quickstart')}>
                                        Démarrage rapide
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Main Sections */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">📑 Table des Matières</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <Card key={section.id} className="hover:shadow-lg transition-all cursor-pointer group">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground mb-1">{section.title}</h3>
                                                <p className="text-sm text-muted-foreground">{section.description}</p>
                                            </div>
                                        </div>
                                        {section.subsections && (
                                            <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                                                {section.subsections.slice(0, 3).map((sub) => (
                                                    <div key={sub.id} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                                        <ChevronRight className="h-3 w-3" />
                                                        <span>{sub.title}</span>
                                                    </div>
                                                ))}
                                                {section.subsections.length > 3 && (
                                                    <div className="text-sm text-primary font-medium">
                                                        +{section.subsections.length - 3} autres sections
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <Button variant="ghost" className="w-full mt-4" onClick={() => setSelectedSection(section.id)}>
                                            Consulter
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Popular Topics */}
            <section className="py-16 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">🔥 Sujets populaires</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <Lock className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                                <p className="font-semibold text-foreground mb-1">Première connexion</p>
                                <p className="text-xs text-muted-foreground">Activer votre compte</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <Package className="h-8 w-8 text-green-500 mx-auto mb-3" />
                                <p className="font-semibold text-foreground mb-1">Gérer les stocks</p>
                                <p className="text-xs text-muted-foreground">Ajustements et alertes</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <ShoppingCart className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                                <p className="font-semibold text-foreground mb-1">Créer une commande</p>
                                <p className="text-xs text-muted-foreground">Procédure complète</p>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="pt-6 text-center">
                                <Truck className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                                <p className="font-semibold text-foreground mb-1">Suivre une livraison</p>
                                <p className="text-xs text-muted-foreground">GPS en temps réel</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Resources */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">📚 Ressources complémentaires</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <Video className="h-10 w-10 text-primary mb-4" />
                                <h3 className="font-semibold text-foreground mb-2">Tutoriels vidéo</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Plus de 30 vidéos explicatives par rôle et fonctionnalité
                                </p>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/documentation')}>
                                    Voir les vidéos
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <FileText className="h-10 w-10 text-primary mb-4" />
                                <h3 className="font-semibold text-foreground mb-2">Documentation</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Guides PDF téléchargeables par rôle (12 guides disponibles)
                                </p>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/documentation')}>
                                    Télécharger les guides
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <AlertTriangle className="h-10 w-10 text-primary mb-4" />
                                <h3 className="font-semibold text-foreground mb-2">FAQ</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Réponses aux questions fréquentes (50+ questions)
                                </p>
                                <Button variant="outline" className="w-full" onClick={() => navigate('/faq')}>
                                    Consulter la FAQ
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Support */}
            <section className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                        Besoin d'aide supplémentaire ?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Notre équipe de support est disponible pour vous accompagner
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/contact')}>
                            📧 Contacter le support
                        </Button>
                        <Button size="lg" variant="outline">
                            📞 Hotline : +224 610 05 87 34
                        </Button>
                    </div>
                    <div className="mt-8 text-sm text-muted-foreground">
                        <p><strong>Horaires :</strong> Lun-Ven, 8h-17h (GMT)</p>
                        <p><strong>Email :</strong> support@livramed.sante.gov.gn</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-card py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground mb-4">
                        <a href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</a>
                        <span>•</span>
                        <a href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</a>
                        <span>•</span>
                        <a href="/cgu" className="hover:text-foreground transition-colors">CGU</a>
                        <span>•</span>
                        <a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Ministère de la Santé et de l'Hygiène Publique - République de Guinée
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Version du guide : 1.0 • Dernière mise à jour : 15 février 2025
                    </p>
                </div>
            </footer>
        </div>
    );
}
