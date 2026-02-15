import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft, Search, Lock, Package, ShoppingCart, Truck,
    AlertTriangle, FileText, Shield, Settings, HelpCircle,
    ChevronDown, ChevronUp
} from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqData: FAQItem[] = [
    // COMPTE ET CONNEXION
    {
        category: 'Compte et Connexion',
        question: 'Comment obtenir un compte sur LivraMed ?',
        answer: `Les comptes sont créés uniquement par les administrateurs autorisés. Vous ne pouvez pas créer un compte vous-même.

**Procédure :**
1. Contactez l'administrateur de votre entité (DPS, DRS, Hôpital)
2. Il créera votre compte avec vos informations
3. Vous recevrez un email avec vos identifiants
4. Suivez le lien d'activation dans l'email

**Contact si problème :** support@livramed.sante.gov.gn`
    },
    {
        category: 'Compte et Connexion',
        question: 'J\'ai oublié mon mot de passe, que faire ?',
        answer: `Utilisez la fonction "Mot de passe oublié" sur la page de connexion.

**Étapes :**
1. Cliquez sur "Mot de passe oublié ?"
2. Entrez votre email professionnel
3. Consultez votre boîte mail
4. Cliquez sur le lien de réinitialisation (valide 1 heure)
5. Créez un nouveau mot de passe (12+ caractères)

**Si vous ne recevez pas l'email :**
- Vérifiez vos spams
- Vérifiez que l'email est correct
- Attendez 5 minutes puis réessayez`
    },
    {
        category: 'Compte et Connexion',
        question: 'Mon compte est bloqué après plusieurs tentatives, que faire ?',
        answer: `Pour des raisons de sécurité, après 5 tentatives de connexion échouées, votre compte est automatiquement bloqué pendant 15 minutes.

**Solutions :**
- ⏱️ Attendez 15 minutes puis réessayez
- 🔑 Utilisez "Mot de passe oublié" pour réinitialiser
- 📞 Contactez votre administrateur si urgent`
    },
    // GESTION DES STOCKS
    {
        category: 'Gestion des Stocks',
        question: 'Comment voir l\'état de mon stock ?',
        answer: `1. Menu latéral → Stocks
2. Vous voyez la liste de tous vos médicaments
3. Utilisez les filtres pour affiner

**Indicateurs de couleur :**
- 🟢 Vert : Stock OK
- 🟡 Orange : Alerte
- 🔴 Rouge : Critique
- ⚫ Noir : Périmé ou rappelé`
    },
    {
        category: 'Gestion des Stocks',
        question: 'Comment faire un ajustement de stock ?',
        answer: `**Procédure :**
1. Stocks → Sélectionnez le médicament
2. Bouton "Ajuster le stock"
3. Entrez la nouvelle quantité exacte
4. Sélectionnez le motif (Inventaire, Casse, Péremption, etc.)
5. Ajoutez un commentaire explicatif
6. Validez

**Important :** Les ajustements > 10% nécessitent parfois une validation hiérarchique.`
    },
    // COMMANDES
    {
        category: 'Commandes',
        question: 'Comment créer une commande ?',
        answer: `**Étapes :**
1. Menu → Commandes → Nouvelle commande
2. Le fournisseur est automatiquement sélectionné
3. Cliquez sur "Ajouter un médicament"
4. Recherchez et sélectionnez
5. Entrez la quantité
6. Répétez pour tous les médicaments
7. Sélectionnez la priorité (Normale/Urgente)
8. Soumettre

Vous recevrez une notification à chaque changement de statut.`
    },
    {
        category: 'Commandes',
        question: 'Combien de temps pour qu\'une commande soit validée ?',
        answer: `**Délais moyens :**
- DPS valide commande CS/Hôpital : 24-48h
- DRS valide commande DPS : 48-72h
- PCG valide commande DRS : 3-5 jours

**Facteurs influençant :**
- Disponibilité du stock
- Priorité (urgente traitée plus vite)
- Complexité de la commande`
    },
    // LIVRAISONS
    {
        category: 'Livraisons',
        question: 'Comment suivre ma livraison en temps réel ?',
        answer: `1. Menu → Livraisons
2. Filtrez par "En cours"
3. Cliquez sur votre livraison

**Ce que vous verrez :**
- 🗺️ Carte interactive avec position du livreur
- 🔵 Position actuelle (mise à jour toutes les 2 min)
- ⏱️ Heure d'arrivée estimée
- 📊 Statut actuel`
    },
    {
        category: 'Livraisons',
        question: 'Comment réceptionner une livraison ?',
        answer: `**Procédure :**
1. Vérifiez l'identité du livreur
2. Contrôlez l'état du colis
3. Vérifiez le contenu (médicaments, quantités, dates)
4. Signez électroniquement sur la tablette du livreur
5. Le livreur prend une photo
6. Votre stock est automatiquement mis à jour

**Important :** Ne signez QUE si tout est conforme.`
    },
    // PHARMACOVIGILANCE
    {
        category: 'Pharmacovigilance',
        question: 'Comment déclarer un effet indésirable ?',
        answer: `**Procédure :**
1. Menu → Pharmacovigilance → Nouvelle déclaration
2. Recherchez le médicament suspecté
3. Indiquez le numéro de lot
4. Renseignez les infos patient (ANONYMISÉ : âge, sexe, poids)
5. Décrivez l'effet indésirable
6. Indiquez la gravité
7. Joignez des photos si pertinent
8. Soumettez

Vous recevrez un numéro de déclaration.`
    },
    // RAPPORTS
    {
        category: 'Rapports et Exports',
        question: 'Comment générer un rapport de stock ?',
        answer: `**Procédure :**
1. Menu → Rapports → Rapport de stock
2. Configurez la période et le type
3. Cliquez sur "Générer le rapport"
4. Téléchargez en PDF ou Excel

**Contenu :** Liste des médicaments, quantités, alertes, mouvements, taux de rotation.`
    },
    // PROBLÈMES TECHNIQUES
    {
        category: 'Problèmes Techniques',
        question: 'Le site est lent, que faire ?',
        answer: `**Solutions :**
1. Vérifiez votre connexion internet (min 2 Mbps)
2. Actualisez la page (F5)
3. Videz le cache (Ctrl+Shift+Suppr)
4. Fermez les onglets inutiles
5. Redémarrez votre navigateur
6. Essayez un autre navigateur

Si le problème persiste, contactez le support.`
    },
    // SÉCURITÉ
    {
        category: 'Sécurité',
        question: 'Comment protéger mon compte ?',
        answer: `**10 règles d'or :**
1. Mot de passe robuste (12+ caractères)
2. Activez la 2FA
3. Ne partagez JAMAIS vos identifiants
4. Déconnectez-vous toujours
5. Verrouillez votre écran (Win+L)
6. Méfiez-vous des emails suspects
7. Vérifiez HTTPS (🔒)
8. Changez votre mot de passe tous les 3-6 mois
9. Antivirus à jour
10. Respectez les CGU`
    },
];

const categories = [
    { name: 'Compte et Connexion', icon: Lock, color: 'text-blue-500' },
    { name: 'Gestion des Stocks', icon: Package, color: 'text-green-500' },
    { name: 'Commandes', icon: ShoppingCart, color: 'text-purple-500' },
    { name: 'Livraisons', icon: Truck, color: 'text-orange-500' },
    { name: 'Pharmacovigilance', icon: AlertTriangle, color: 'text-red-500' },
    { name: 'Rapports et Exports', icon: FileText, color: 'text-indigo-500' },
    { name: 'Problèmes Techniques', icon: Settings, color: 'text-gray-500' },
    { name: 'Sécurité', icon: Shield, color: 'text-yellow-600' },
];

export default function FAQPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

    const toggleItem = (index: number) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedItems(newExpanded);
    };

    const filteredFAQ = faqData.filter(item => {
        const matchesSearch = searchQuery === '' ||
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
                        <HelpCircle className="h-10 w-10 text-primary" />
                        <h1 className="text-4xl font-display font-bold text-foreground">Questions Fréquentes (FAQ)</h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Trouvez rapidement des réponses aux questions les plus courantes sur LivraMed
                    </p>
                </div>
            </section>

            {/* Search */}
            <section className="py-8 bg-muted/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="💡 Tapez votre question ou un mot-clé..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 text-base"
                        />
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">📑 Catégories</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card
                            className={`cursor-pointer transition-all hover:shadow-md ${!selectedCategory ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            <CardContent className="pt-6 text-center">
                                <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                                <p className="font-semibold text-foreground">Toutes</p>
                                <p className="text-xs text-muted-foreground mt-1">{faqData.length} questions</p>
                            </CardContent>
                        </Card>
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const count = faqData.filter(item => item.category === cat.name).length;
                            return (
                                <Card
                                    key={cat.name}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedCategory === cat.name ? 'ring-2 ring-primary' : ''}`}
                                    onClick={() => setSelectedCategory(cat.name)}
                                >
                                    <CardContent className="pt-6 text-center">
                                        <Icon className={`h-8 w-8 ${cat.color} mx-auto mb-2`} />
                                        <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{count} questions</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ Items */}
            <section className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {selectedCategory && (
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-foreground">{selectedCategory}</h2>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCategory(null)}>
                                Voir toutes les catégories
                            </Button>
                        </div>
                    )}

                    {filteredFAQ.length === 0 ? (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                                <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Aucune question trouvée pour "{searchQuery}"</p>
                                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                                    Réinitialiser la recherche
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredFAQ.map((item, index) => {
                                const isExpanded = expandedItems.has(index);
                                return (
                                    <Card key={index} className="hover:shadow-md transition-shadow">
                                        <CardContent className="pt-6">
                                            <button
                                                onClick={() => toggleItem(index)}
                                                className="w-full flex items-start justify-between gap-4 text-left"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-semibold text-foreground mb-1">❓ {item.question}</p>
                                                    {!selectedCategory && (
                                                        <p className="text-xs text-muted-foreground">{item.category}</p>
                                                    )}
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                )}
                                            </button>
                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-border/50">
                                                    <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                                                        {item.answer}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-display font-bold text-foreground mb-4">
                        Vous n'avez pas trouvé votre réponse ?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Notre équipe de support est là pour vous aider
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/contact')}>
                            📧 Contacter le support
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate('/documentation')}>
                            📚 Consulter la documentation
                        </Button>
                    </div>
                    <div className="mt-8 text-sm text-muted-foreground">
                        <p><strong>Support technique :</strong> support@livramed.sante.gov.gn</p>
                        <p><strong>Téléphone :</strong> +224 610 05 87 34</p>
                        <p><strong>Horaires :</strong> Lun-Ven, 8h-17h (GMT)</p>
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
                </div>
            </footer>
        </div>
    );
}
