import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle } from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

export default function ConfidentialitePage() {
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
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl font-display font-bold text-foreground">Politique de Confidentialité</h1>
                </div>
                <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 15 février 2025</p>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8">
                    <p className="text-sm text-foreground">
                        Le Ministère de la Santé et de l'Hygiène Publique de la République de Guinée accorde une importance particulière à la protection de vos données personnelles.
                    </p>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Responsable du Traitement</h2>
                            <div className="text-muted-foreground space-y-2">
                                <p><strong>Identité :</strong> Ministère de la Santé et de l'Hygiène Publique de la République de Guinée</p>
                                <p><strong>Adresse :</strong> BP XXXX, Conakry, République de Guinée</p>
                                <p><strong>Email :</strong> dpo@livramed.sante.gov.gn</p>
                                <p><strong>Téléphone :</strong> +224 XXX XX XX XX</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Données Collectées</h2>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.1 Données d'identification</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                                <li>Nom et prénom</li>
                                <li>Email professionnel</li>
                                <li>Numéro de téléphone</li>
                                <li>Rôle et fonction</li>
                                <li>Entité de rattachement (DRS, DPS, Hôpital, etc.)</li>
                                <li>Photo de profil (optionnelle)</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.2 Données de connexion</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                                <li>Adresse IP</li>
                                <li>Date et heure de connexion</li>
                                <li>Type de navigateur et système d'exploitation</li>
                                <li>Historique de connexion</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.3 Données professionnelles</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                                <li>Commandes passées</li>
                                <li>Stocks gérés</li>
                                <li>Livraisons effectuées</li>
                                <li>Déclarations de pharmacovigilance</li>
                                <li>Rapports générés</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">2.4 Données de géolocalisation (Livreurs uniquement)</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>Position GPS pendant les livraisons</li>
                                <li>Trajets effectués</li>
                                <li>Temps de livraison</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Finalités du Traitement</h2>
                            <p className="text-muted-foreground mb-4">Vos données sont collectées et traitées pour :</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li><strong>Gestion de la plateforme :</strong> Création et gestion de votre compte, authentification, gestion des droits</li>
                                <li><strong>Fonctionnalités métier :</strong> Gestion des stocks, traitement des commandes, organisation des livraisons, pharmacovigilance</li>
                                <li><strong>Sécurité et audit :</strong> Prévention de la fraude, détection d'anomalies, traçabilité des opérations</li>
                                <li><strong>Communication :</strong> Notifications, alertes importantes, support technique</li>
                                <li><strong>Amélioration du service :</strong> Statistiques d'utilisation anonymisées, optimisation de l'interface</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Base Légale du Traitement</h2>
                            <p className="text-muted-foreground mb-4">Les traitements de données sont fondés sur :</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li><strong>Mission d'intérêt public :</strong> Gestion du système de santé publique guinéen</li>
                                <li><strong>Obligation légale :</strong> Traçabilité des médicaments, pharmacovigilance</li>
                                <li><strong>Consentement :</strong> Newsletter, communications non obligatoires</li>
                                <li><strong>Intérêt légitime :</strong> Sécurité de la plateforme, prévention de la fraude</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Durée de Conservation</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 text-left">Type de données</th>
                                            <th className="p-2 text-left">Durée de conservation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-muted-foreground">
                                        <tr className="border-b">
                                            <td className="p-2">Compte utilisateur actif</td>
                                            <td className="p-2">Durée d'emploi + 5 ans</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2">Logs de connexion</td>
                                            <td className="p-2">12 mois</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2">Données de commande</td>
                                            <td className="p-2">10 ans (archivage légal)</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2">Déclarations PV</td>
                                            <td className="p-2">25 ans (obligation réglementaire)</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="p-2">Données GPS livraison</td>
                                            <td className="p-2">3 mois</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2">Cookies</td>
                                            <td className="p-2">13 mois maximum</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Vos Droits</h2>
                            <p className="text-muted-foreground mb-4">Vous disposez des droits suivants :</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">Droit d'accès :</strong>
                                        <span className="text-muted-foreground"> Demander une copie de vos données personnelles</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">Droit de rectification :</strong>
                                        <span className="text-muted-foreground"> Corriger des données inexactes ou incomplètes</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">Droit d'effacement :</strong>
                                        <span className="text-muted-foreground"> Demander la suppression de vos données (sauf obligations légales)</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">Droit à la limitation :</strong>
                                        <span className="text-muted-foreground"> Demander la limitation du traitement dans certaines situations</span>
                                    </div>
                                </li>
                            </ul>
                            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                                <p className="text-sm text-foreground mb-2"><strong>Pour exercer vos droits :</strong></p>
                                <p className="text-sm text-muted-foreground">Email : dpo@livramed.sante.gov.gn</p>
                                <p className="text-sm text-muted-foreground">Délai de réponse : Maximum 1 mois</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Sécurité des Données</h2>
                            <p className="text-muted-foreground mb-4">Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :</p>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Mesures techniques</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
                                <li>✅ Chiffrement TLS 1.3 pour toutes les communications</li>
                                <li>✅ Chiffrement des données sensibles en base</li>
                                <li>✅ Authentification forte (2FA disponible)</li>
                                <li>✅ Pare-feu et systèmes anti-intrusion</li>
                                <li>✅ Sauvegardes quotidiennes chiffrées</li>
                                <li>✅ Logs d'audit complets</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Mesures organisationnelles</h3>
                            <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                <li>✅ Accès limité aux seules personnes autorisées</li>
                                <li>✅ Contrôles d'accès stricts (RBAC)</li>
                                <li>✅ Formation du personnel à la sécurité</li>
                                <li>✅ Clauses de confidentialité dans les contrats</li>
                                <li>✅ Procédures de gestion des incidents</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Données de Santé</h2>
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">⚠️ IMPORTANT</p>
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    LivraMed ne collecte PAS directement de données de santé des patients. Les déclarations de pharmacovigilance sont <strong>anonymisées</strong> (pas de nom, seulement âge, sexe, poids).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact</h2>
                            <p className="text-muted-foreground mb-4">
                                <strong>Délégué à la Protection des Données (DPO) :</strong><br />
                                Email : dpo@livramed.sante.gov.gn<br />
                                Téléphone : +224 XXX XX XX XX<br />
                                Courrier : Ministère de la Santé et de l'Hygiène Publique, À l'attention du DPO, BP XXXX, Conakry, République de Guinée
                            </p>
                        </CardContent>
                    </Card>

                    <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center">
                        <Shield className="h-12 w-12 text-primary mx-auto mb-3" />
                        <p className="text-foreground font-semibold mb-2">Votre confiance est notre priorité</p>
                        <p className="text-sm text-muted-foreground">
                            Nous nous engageons à protéger vos données avec le plus grand soin.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border/50 bg-card py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                        <a href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</a>
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
