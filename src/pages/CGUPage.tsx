import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, AlertCircle, Shield, UserX } from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

export default function CGUPage() {
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
                    <FileText className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl font-display font-bold text-foreground">Conditions Générales d'Utilisation (CGU)</h1>
                </div>
                <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 15 février 2025</p>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Article 1 - Objet</h2>
                            <p className="text-muted-foreground">
                                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de la plateforme LivraMed, éditée par le Ministère de la Santé et de l'Hygiène Publique de la République de Guinée.
                            </p>
                            <p className="text-muted-foreground mt-2">
                                <strong>L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU.</strong>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Article 2 - Accès à la Plateforme</h2>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Conditions d'accès</h3>
                            <p className="text-muted-foreground mb-4">
                                La plateforme LivraMed est réservée aux professionnels de santé et au personnel autorisé du système de santé guinéen.
                            </p>
                            <p className="text-muted-foreground mb-4">L'accès nécessite :</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Un compte utilisateur créé par un administrateur</li>
                                <li>Des identifiants de connexion (email + mot de passe)</li>
                                <li>Une connexion internet</li>
                                <li>Un navigateur web récent (Chrome, Firefox, Edge, Safari)</li>
                            </ul>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Disponibilité</h3>
                            <p className="text-muted-foreground">
                                <strong>Objectif de disponibilité :</strong> 99,5%
                            </p>
                            <p className="text-muted-foreground mt-2">
                                Le Ministère se réserve le droit de suspendre temporairement l'accès pour maintenance programmée, maintenance d'urgence ou raisons de sécurité.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Article 3 - Gestion du Compte</h2>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Identifiants</h3>
                            <p className="text-muted-foreground mb-4">L'utilisateur s'engage à :</p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-lg">✅</span>
                                    <span className="text-muted-foreground">Conserver ses identifiants confidentiels</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-lg">✅</span>
                                    <span className="text-muted-foreground">Ne jamais partager son compte</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-lg">✅</span>
                                    <span className="text-muted-foreground">Choisir un mot de passe robuste (min 12 caractères)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-lg">✅</span>
                                    <span className="text-muted-foreground">Activer l'authentification à deux facteurs (2FA)</span>
                                </li>
                            </ul>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Responsabilité du compte</h3>
                            <p className="text-muted-foreground">
                                L'utilisateur est entièrement responsable de l'utilisation faite de son compte. En cas de compromission, il doit IMMÉDIATEMENT changer son mot de passe et contacter l'administrateur.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Article 4 - Utilisation de la Plateforme</h2>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Utilisation conforme</h3>
                            <p className="text-muted-foreground mb-4">
                                L'utilisateur s'engage à utiliser la plateforme uniquement pour les finalités professionnelles prévues.
                            </p>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                Utilisations INTERDITES
                            </h3>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-destructive text-lg">❌</span>
                                        <span className="text-muted-foreground">Accéder à des données non autorisées</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-destructive text-lg">❌</span>
                                        <span className="text-muted-foreground">Altérer, modifier ou corrompre le système</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-destructive text-lg">❌</span>
                                        <span className="text-muted-foreground">Utiliser la plateforme à des fins personnelles</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-destructive text-lg">❌</span>
                                        <span className="text-muted-foreground">Partager des informations confidentielles</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-destructive text-lg">❌</span>
                                        <span className="text-muted-foreground">Usurper une identité</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Article 5 - Propriété Intellectuelle</h2>
                            <p className="text-muted-foreground mb-4">
                                La plateforme LivraMed, son code source, son design, ses contenus, sa structure sont la propriété exclusive du Ministère de la Santé et de l'Hygiène Publique.
                            </p>
                            <p className="text-muted-foreground">
                                <strong>Tous droits réservés.</strong> L'utilisateur dispose d'un droit d'utilisation personnel, non exclusif, non transférable, limité à la durée de son compte.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Article 6 - Responsabilités</h2>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Responsabilité du Ministère</h3>
                            <p className="text-muted-foreground mb-4">
                                Le Ministère s'engage à mettre en œuvre tous les moyens pour assurer le bon fonctionnement de la plateforme et protéger les données.
                            </p>
                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Responsabilité de l'utilisateur</h3>
                            <p className="text-muted-foreground">
                                L'utilisateur est seul responsable de l'exactitude des données qu'il saisit, de l'utilisation qu'il fait de la plateforme, et des conséquences de la compromission de ses identifiants.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                                <UserX className="h-6 w-6 text-destructive" />
                                Article 7 - Sanctions
                            </h2>
                            <p className="text-muted-foreground mb-4">En cas de violation des CGU, le Ministère se réserve le droit de :</p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li><strong>Sanctions administratives :</strong> Avertissement, suspension temporaire ou définitive du compte</li>
                                <li><strong>Sanctions disciplinaires :</strong> Signalement à l'employeur, procédure disciplinaire</li>
                                <li><strong>Sanctions pénales :</strong> Dépôt de plainte pour accès frauduleux, violation du secret professionnel, vol ou corruption de données</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Article 8 - Audit et Traçabilité</h2>
                            <p className="text-muted-foreground">
                                Toutes les actions effectuées sur la plateforme sont enregistrées dans des logs d'audit (connexions, consultations, modifications, créations, suppressions, tentatives d'accès non autorisées).
                            </p>
                            <p className="text-muted-foreground mt-2">
                                <strong>Conservation :</strong> 12 mois
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">Article 9 - Droit Applicable</h2>
                            <p className="text-muted-foreground">
                                Les présentes CGU sont soumises au droit guinéen. En cas de litige, après tentative de résolution amiable, compétence exclusive est attribuée aux tribunaux de Conakry, République de Guinée.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Shield className="h-8 w-8 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Acceptation des CGU</h3>
                        </div>
                        <p className="text-muted-foreground">
                            ☑️ En utilisant la plateforme LivraMed, vous déclarez avoir lu, compris et accepté les présentes Conditions Générales d'Utilisation dans leur intégralité.
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">
                            <strong>Version :</strong> 1.0 | <strong>Date de publication :</strong> 15 février 2025
                        </p>
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
                        <a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a>
                        <span>•</span>
                        <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
