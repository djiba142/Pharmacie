import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Mail, Phone, MapPin, FileText, MessageCircle, Clock,
    Send, ArrowLeft, Facebook, Twitter, Linkedin, Youtube
} from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';

export default function ContactPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '',
        entity: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement form submission
        // Form submission handled
    };

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
                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">Contactez-nous</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Notre équipe est à votre disposition pour répondre à toutes vos questions concernant la plateforme LivraMed
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="py-12 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Mail className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Support Technique</h3>
                                <p className="text-sm text-muted-foreground mb-2">support@livramed.sante.gov.gn</p>
                                <p className="text-xs text-muted-foreground">Réponse sous 24h ouvrées</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Phone className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Hotline d'Urgence</h3>
                                <p className="text-sm text-muted-foreground mb-2">+224 XXX XX XX XX</p>
                                <p className="text-xs text-muted-foreground">Disponible 24h/24, 7j/7</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Adresse</h3>
                                <p className="text-sm text-muted-foreground mb-2">DNPM, Conakry</p>
                                <p className="text-xs text-muted-foreground">Lun-Ven: 9h-16h</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-2">Documentation</h3>
                                <p className="text-sm text-muted-foreground mb-2">docs.livramed.gov.gn</p>
                                <p className="text-xs text-muted-foreground">Guides et tutoriels</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-primary" />
                                Formulaire de Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">Prénom *</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Nom *</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Téléphone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="role">Votre rôle</Label>
                                        <select
                                            id="role"
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="">Sélectionnez...</option>
                                            <option value="drs">DRS</option>
                                            <option value="dps">DPS</option>
                                            <option value="hopital">Hôpital</option>
                                            <option value="pharmacie">Pharmacie</option>
                                            <option value="centre">Centre de santé</option>
                                            <option value="livreur">Livreur</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="entity">Entité de rattachement</Label>
                                        <Input
                                            id="entity"
                                            value={formData.entity}
                                            onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="subject">Objet de votre demande *</Label>
                                    <select
                                        id="subject"
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    >
                                        <option value="">Sélectionnez...</option>
                                        <option value="technique">Question technique</option>
                                        <option value="formation">Demande de formation</option>
                                        <option value="demo">Demande de démo</option>
                                        <option value="bug">Signalement de bug</option>
                                        <option value="partenariat">Partenariat</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="message">Votre message *</Label>
                                    <Textarea
                                        id="message"
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full sm:w-auto">
                                    <Send className="h-4 w-4 mr-2" />
                                    Envoyer le message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Before Contacting */}
            <section className="py-12 bg-muted/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Avant de nous contacter
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">Consultez d'abord nos ressources :</p>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <Button variant="outline" className="justify-start" onClick={() => navigate('/faq')}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    FAQ
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => navigate('/guide')}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Guide utilisateur
                                </Button>
                                <Button variant="outline" className="justify-start" onClick={() => navigate('/documentation')}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Documentation
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Social Media */}
            <section className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-display font-bold text-foreground mb-6">Suivez-nous</h2>
                    <div className="flex justify-center gap-4">
                        <a href="#" className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                            <Facebook className="h-5 w-5 text-primary" />
                        </a>
                        <a href="#" className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                            <Twitter className="h-5 w-5 text-primary" />
                        </a>
                        <a href="#" className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                            <Linkedin className="h-5 w-5 text-primary" />
                        </a>
                        <a href="#" className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                            <Youtube className="h-5 w-5 text-primary" />
                        </a>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">@LivraMedGuinee</p>
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
