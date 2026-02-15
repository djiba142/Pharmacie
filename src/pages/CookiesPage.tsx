import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Cookie, Settings } from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

export default function CookiesPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center gap-3 mb-4">
                    <Cookie className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl font-display font-bold text-foreground">Politique de Cookies</h1>
                </div>
                <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 15 février 2025</p>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Qu'est-ce qu'un cookie ?</h2>
                            <p className="text-muted-foreground mb-4">
                                Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone lors de votre visite sur notre site.
                            </p>
                            <p className="text-muted-foreground mb-4">Les cookies permettent de :</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>✅ Vous reconnaître lors de vos visites</li>
                                <li>✅ Mémoriser vos préférences</li>
                                <li>✅ Améliorer votre expérience de navigation</li>
                                <li>✅ Analyser l'utilisation du site</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies Utilisés sur LivraMed</h2>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-3">1️⃣ Cookies Strictement Nécessaires (Pas de consentement requis)</h3>
                            <p className="text-muted-foreground mb-4">
                                Ces cookies sont essentiels au fonctionnement de la plateforme. Ils ne peuvent pas être désactivés.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 text-left">Nom</th>
                                            <th className="p-2 text-left">Durée</th>
                                            <th className="p-2 text-left">Finalité</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b">
                                            <td className="p-2 font-mono text-xs">session_token</td>
                                            <td className="p-2">Session</td>
                                            <td className="p-2">Gestion de votre session</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2 font-mono text-xs">csrf_token</td>
                                            <td className="p-2">Session</td>
                                            <td className="p-2">Protection CSRF</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2 font-mono text-xs">auth_token</td>
                                            <td className="p-2">7 jours</td>
                                            <td className="p-2">Maintien de la connexion</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 font-mono text-xs">lang</td>
                                            <td className="p-2">1 an</td>
                                            <td className="p-2">Langue choisie</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">2️⃣ Cookies de Performance (Consentement requis)</h3>
                            <p className="text-muted-foreground mb-4">
                                Ces cookies nous aident à comprendre comment vous utilisez la plateforme pour l'améliorer.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 text-left">Nom</th>
                                            <th className="p-2 text-left">Durée</th>
                                            <th className="p-2 text-left">Finalité</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b">
                                            <td className="p-2 font-mono text-xs">_ga</td>
                                            <td className="p-2">2 ans</td>
                                            <td className="p-2">Google Analytics - Comptage visiteurs</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2 font-mono text-xs">_gid</td>
                                            <td className="p-2">24h</td>
                                            <td className="p-2">Google Analytics - Session</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 font-mono text-xs">analytics_consent</td>
                                            <td className="p-2">13 mois</td>
                                            <td className="p-2">Mémorisation consentement</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">
                                <strong>Données collectées (anonymisées) :</strong> Pages visitées, durée de visite, actions effectuées, type de navigateur
                            </p>

                            <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">3️⃣ Cookies Fonctionnels (Consentement requis)</h3>
                            <p className="text-muted-foreground mb-4">
                                Ces cookies améliorent votre confort d'utilisation mais ne sont pas essentiels.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 text-left">Nom</th>
                                            <th className="p-2 text-left">Durée</th>
                                            <th className="p-2 text-left">Finalité</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b">
                                            <td className="p-2 font-mono text-xs">dashboard_prefs</td>
                                            <td className="p-2">6 mois</td>
                                            <td className="p-2">Préférences d'affichage</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2 font-mono text-xs">table_filters</td>
                                            <td className="p-2">30 jours</td>
                                            <td className="p-2">Filtres de tableaux</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 font-mono text-xs">sidebar_collapsed</td>
                                            <td className="p-2">6 mois</td>
                                            <td className="p-2">État du menu latéral</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <Settings className="h-6 w-6 text-primary" />
                                Gestion de vos Cookies
                            </h2>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Accepter ou Refuser les cookies</h3>
                            <p className="text-muted-foreground mb-4">
                                Lors de votre première visite, un bandeau vous demande votre consentement. Vous pouvez :
                            </p>
                            <ul className="space-y-2 text-muted-foreground mb-4">
                                <li>✅ <strong>Tout accepter</strong> : Tous les cookies sont activés</li>
                                <li>⚙️ <strong>Personnaliser</strong> : Choisir cookie par cookie</li>
                                <li>❌ <strong>Tout refuser</strong> : Seuls les cookies strictement nécessaires sont activés</li>
                            </ul>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Modifier vos préférences</h3>
                            <p className="text-muted-foreground mb-4">
                                Vous pouvez modifier vos choix à tout moment :
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Cliquez sur l'icône 🍪 en bas de page</li>
                                <li>Ou allez dans <strong>Mon profil → Confidentialité → Gestion des cookies</strong></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Pas de Publicité</h2>
                            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                                <p className="text-foreground font-semibold mb-2">✅ LivraMed ne contient AUCUNE publicité</p>
                                <p className="text-muted-foreground text-sm">
                                    Nous n'utilisons donc pas de cookies publicitaires ou de tracking à des fins marketing.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Tableau Récapitulatif</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 text-left">Type de cookie</th>
                                            <th className="p-2 text-left">Finalité</th>
                                            <th className="p-2 text-left">Consentement</th>
                                            <th className="p-2 text-left">Désactivable</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b">
                                            <td className="p-2"><strong>Strictement nécessaires</strong></td>
                                            <td className="p-2">Fonctionnement</td>
                                            <td className="p-2">Non requis</td>
                                            <td className="p-2">❌ Non</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2"><strong>Performance/Stats</strong></td>
                                            <td className="p-2">Amélioration</td>
                                            <td className="p-2">Requis</td>
                                            <td className="p-2">✅ Oui</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2"><strong>Fonctionnels</strong></td>
                                            <td className="p-2">Confort</td>
                                            <td className="p-2">Requis</td>
                                            <td className="p-2">✅ Oui</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2"><strong>Publicitaires</strong></td>
                                            <td className="p-2"><em>Non utilisés</em></td>
                                            <td className="p-2">-</td>
                                            <td className="p-2">-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
                            <p className="text-muted-foreground">
                                Pour toute question sur les cookies :<br />
                                <strong>Email :</strong> dpo@livramed.sante.gov.gn<br />
                                <strong>Téléphone :</strong> +224 XXX XX XX XX
                            </p>
                        </CardContent>
                    </Card>

                    <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center">
                        <Cookie className="h-12 w-12 text-primary mx-auto mb-3" />
                        <p className="text-foreground font-semibold mb-2">Votre vie privée est importante pour nous</p>
                        <p className="text-sm text-muted-foreground">
                            Nous utilisons les cookies de manière responsable et transparente.
                        </p>
                        <Button className="mt-4" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Gérer mes préférences cookies
                        </Button>
                    </div>
                </div>
            </div>

            <footer className="border-t border-border/50 bg-card py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                        <a href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</a>
                        <span>•</span>
                        <a href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</a>
                        <span>•</span>
                        <a href="/cgu" className="hover:text-foreground transition-colors">CGU</a>
                        <span>•</span>
                        <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
