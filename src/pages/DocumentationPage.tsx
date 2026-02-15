import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, Video, Download, Book, HelpCircle } from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

const guides = [
    { title: 'Guide Super Admin', pages: 45, role: 'central', file: 'super-admin.pdf' },
    { title: 'Guide Admin Central', pages: 30, role: 'central', file: 'admin-central.pdf' },
    { title: 'Guide PCG', pages: 35, role: 'central', file: 'pcg.pdf' },
    { title: 'Guide DNPM', pages: 25, role: 'central', file: 'dnpm.pdf' },
    { title: 'Guide Responsable DRS', pages: 40, role: 'regional', file: 'drs.pdf' },
    { title: 'Guide Logistique DRS', pages: 20, role: 'regional', file: 'drs-logistique.pdf' },
    { title: 'Guide Responsable DPS', pages: 35, role: 'prefectoral', file: 'dps.pdf' },
    { title: 'Guide Agent DPS', pages: 15, role: 'prefectoral', file: 'dps-agent.pdf' },
    { title: 'Guide Pharmacien Hôpital', pages: 30, role: 'structure', file: 'hopital.pdf' },
    { title: 'Guide Centre de Santé', pages: 25, role: 'structure', file: 'centre.pdf' },
    { title: 'Guide Pharmacie Privée', pages: 20, role: 'structure', file: 'pharmacie.pdf' },
    { title: 'Guide Livreur', pages: 18, role: 'livreur', file: 'livreur.pdf' },
];

const videos = [
    { title: 'Première connexion et activation', duration: '3 min', category: 'Démarrage' },
    { title: 'Tour de l\'interface', duration: '5 min', category: 'Démarrage' },
    { title: 'Modifier son profil', duration: '2 min', category: 'Démarrage' },
    { title: 'Activer la 2FA', duration: '4 min', category: 'Sécurité' },
    { title: 'Créer un utilisateur', duration: '6 min', category: 'Administration' },
    { title: 'Gérer les entités', duration: '8 min', category: 'Administration' },
    { title: 'Créer une commande', duration: '7 min', category: 'Pharmaciens' },
    { title: 'Gérer son stock', duration: '10 min', category: 'Pharmaciens' },
    { title: 'Déclarer un effet indésirable', duration: '6 min', category: 'Pharmacovigilance' },
    { title: 'Accepter une mission', duration: '4 min', category: 'Livreurs' },
    { title: 'Finaliser une livraison', duration: '6 min', category: 'Livreurs' },
];

export default function DocumentationPage() {
    const navigate = useNavigate();

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
                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">Documentation LivraMed</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Guide complet d'utilisation de la plateforme - Guides PDF, tutoriels vidéo et FAQ
                    </p>
                </div>
            </section>

            {/* Guides par rôle */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-8">
                        <FileText className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-display font-bold text-foreground">Guides par rôle (PDF)</h2>
                    </div>

                    {/* Niveau Central */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-foreground mb-4">🏛️ Niveau Central</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {guides.filter(g => g.role === 'central').map((guide) => (
                                <Card key={guide.file} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-1">{guide.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-3">{guide.pages} pages</p>
                                        <Button size="sm" variant="outline" className="w-full">
                                            <Download className="h-3 w-3 mr-2" />
                                            Télécharger
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Niveau Régional */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-foreground mb-4">🏙️ Niveau Régional (DRS)</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {guides.filter(g => g.role === 'regional').map((guide) => (
                                <Card key={guide.file} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-1">{guide.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-3">{guide.pages} pages</p>
                                        <Button size="sm" variant="outline" className="w-full">
                                            <Download className="h-3 w-3 mr-2" />
                                            Télécharger
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Niveau Préfectoral */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-foreground mb-4">🏢 Niveau Préfectoral (DPS)</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {guides.filter(g => g.role === 'prefectoral').map((guide) => (
                                <Card key={guide.file} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-1">{guide.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-3">{guide.pages} pages</p>
                                        <Button size="sm" variant="outline" className="w-full">
                                            <Download className="h-3 w-3 mr-2" />
                                            Télécharger
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Structures de Santé */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-foreground mb-4">🏥 Structures de Santé</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {guides.filter(g => g.role === 'structure').map((guide) => (
                                <Card key={guide.file} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-1">{guide.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-3">{guide.pages} pages</p>
                                        <Button size="sm" variant="outline" className="w-full">
                                            <Download className="h-3 w-3 mr-2" />
                                            Télécharger
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Livreurs */}
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">🚚 Livreurs</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {guides.filter(g => g.role === 'livreur').map((guide) => (
                                <Card key={guide.file} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <h4 className="font-semibold text-foreground mb-1">{guide.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-3">{guide.pages} pages</p>
                                        <Button size="sm" variant="outline" className="w-full">
                                            <Download className="h-3 w-3 mr-2" />
                                            Télécharger
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Tutoriels Vidéo */}
            <section className="py-16 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Video className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-display font-bold text-foreground">Tutoriels Vidéo</h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video, index) => (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                                        <Video className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="font-semibold text-foreground text-sm">{video.title}</h4>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">{video.duration}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">{video.category}</p>
                                    <Button size="sm" variant="outline" className="w-full">
                                        Regarder
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-8">
                        <HelpCircle className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-display font-bold text-foreground">Questions Fréquentes (FAQ)</h2>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <h4 className="font-semibold text-foreground mb-2">Comment récupérer mon mot de passe ?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Cliquez sur "Mot de passe oublié" sur la page de connexion, entrez votre email et suivez les instructions.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h4 className="font-semibold text-foreground mb-2">Comment créer une commande urgente ?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Lors de la création de commande, sélectionnez "Urgente" dans le champ priorité. Votre commande sera traitée en priorité.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h4 className="font-semibold text-foreground mb-2">Où est ma livraison ?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Allez dans Menu → Livraisons, cliquez sur votre livraison "En cours" pour voir la carte avec le trajet GPS en temps réel.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="text-center mt-8">
                            <Button onClick={() => navigate('/faq')}>
                                <Book className="h-4 w-4 mr-2" />
                                Voir toutes les FAQ
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-card py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Ministère de la Santé et de l'Hygiène Publique - République de Guinée
                    </p>
                </div>
            </footer>
        </div>
    );
}
