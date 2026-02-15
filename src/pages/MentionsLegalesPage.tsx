import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building2, MapPin, Hospital, TruckIcon, Shield } from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

export default function MentionsLegalesPage() {
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

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-display font-bold text-foreground mb-4">Mentions Légales</h1>
                <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 15 février 2025</p>

                <div className="prose prose-slate max-w-none">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Éditeur du Site</h2>
                            <div className="space-y-2 text-muted-foreground">
                                <p><strong>Nom de l'organisme :</strong> Ministère de la Santé et de l'Hygiène Publique de la République de Guinée</p>
                                <p><strong>Adresse du siège social :</strong> BP XXXX, Conakry, République de Guinée</p>
                                <p><strong>Téléphone :</strong> +224 XXX XX XX XX</p>
                                <p><strong>Email :</strong> contact@sante.gov.gn</p>
                                <p><strong>Site web :</strong> https://sante.gov.gn</p>
                                <p><strong>Directeur de la publication :</strong> Ministre de la Santé et de l'Hygiène Publique</p>
                                <p><strong>Responsable de la rédaction :</strong> Direction Nationale de la Pharmacie et du Médicament (DNPM)</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Hébergement</h2>
                            <div className="space-y-2 text-muted-foreground">
                                <p><strong>Hébergeur du site :</strong> [Nom de l'hébergeur]</p>
                                <p><strong>Adresse complète :</strong> [Adresse]</p>
                                <p><strong>Téléphone :</strong> [Téléphone]</p>
                                <p><strong>Localisation des serveurs :</strong> [Pays/Ville]</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Propriété Intellectuelle</h2>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Droits d'auteur</h3>
                            <p className="text-muted-foreground mb-4">
                                L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels, etc.) est la propriété exclusive du Ministère de la Santé et de l'Hygiène Publique de la République de Guinée, sauf mention contraire.
                            </p>
                            <p className="text-muted-foreground mb-4">
                                Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit est interdite sans l'autorisation écrite préalable du Ministère.
                            </p>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Marques</h3>
                            <p className="text-muted-foreground mb-4">
                                <strong>LivraMed</strong> est une marque déposée du Ministère de la Santé et de l'Hygiène Publique de la République de Guinée.
                            </p>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Code source</h3>
                            <p className="text-muted-foreground">
                                Le code source de la plateforme LivraMed est la propriété du Ministère de la Santé et de l'Hygiène Publique de la République de Guinée. Toute utilisation, modification ou distribution non autorisée est strictement interdite.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Données Personnelles</h2>
                            <p className="text-muted-foreground mb-4">
                                Le traitement des données personnelles collectées sur ce site est conforme à la réglementation en vigueur en République de Guinée et aux standards internationaux (RGPD européen pris comme référence).
                            </p>
                            <p className="text-muted-foreground mb-4">
                                Pour plus d'informations, consultez notre <a href="/confidentialite" className="text-primary hover:underline">Politique de Confidentialité</a>.
                            </p>
                            <p className="text-muted-foreground">
                                <strong>Responsable du traitement :</strong> Ministère de la Santé et de l'Hygiène Publique<br />
                                <strong>Délégué à la Protection des Données (DPO) :</strong> dpo@livramed.sante.gov.gn
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Responsabilité</h2>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Contenu</h3>
                            <p className="text-muted-foreground mb-4">
                                Le Ministère s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, le Ministère ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
                            </p>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Liens hypertextes</h3>
                            <p className="text-muted-foreground">
                                Ce site peut contenir des liens hypertextes vers d'autres sites. Le Ministère n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Droit Applicable et Juridiction Compétente</h2>
                            <p className="text-muted-foreground mb-4">
                                Les présentes mentions légales sont soumises au droit guinéen.
                            </p>
                            <p className="text-muted-foreground">
                                En cas de litige, et après tentative de résolution amiable, les tribunaux guinéens seront seuls compétents.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
                            <p className="text-muted-foreground mb-2">
                                Pour toute question concernant les mentions légales :
                            </p>
                            <p className="text-muted-foreground">
                                <strong>Email :</strong> legal@livramed.sante.gov.gn<br />
                                <strong>Courrier :</strong> Ministère de la Santé et de l'Hygiène Publique, Direction Juridique, BP XXXX, Conakry, République de Guinée
                            </p>
                        </CardContent>
                    </Card>

                    <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Ministère de la Santé et de l'Hygiène Publique - République de Guinée<br />
                            <strong>Tous droits réservés</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-card py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                        <a href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</a>
                        <span>•</span>
                        <a href="/cgu" className="hover:text-foreground transition-colors">CGU</a>
                        <span>•</span>
                        <a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a>
                        <span>•</span>
                        <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
