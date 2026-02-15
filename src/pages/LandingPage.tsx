import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package, Truck, BarChart3, Shield, MapPin, Users, ArrowRight, CheckCircle,
  Building2, Hospital, Stethoscope, TruckIcon, Lock, Globe, Database, Mail,
  Phone, MapPinIcon, FileText, MessageCircle, Facebook, Twitter, Linkedin, Youtube,
  Clock, Target, TrendingUp, Eye, Award, Zap
} from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';
import logoMshp from '@/assets/partners/mshp.png';
import logoOms from '@/assets/partners/oms.png';
import logoUsaid from '@/assets/partners/usaid.jpg';
import logoUnicef from '@/assets/partners/unicef.jpg';
import logoGavi from '@/assets/partners/gavi.png';
import logoFondsMondial from '@/assets/partners/fonds-mondial.jpg';
import logoPcg from '@/assets/partners/pcg.jpg';
import logoMsf from '@/assets/partners/msf.png';
import logoCroixRouge from '@/assets/partners/croix-rouge.jpg';
import logoOnpg from '@/assets/partners/onpg.jpg';
import logoCosephag from '@/assets/partners/cosephag.jpg';
import logoGuinee from '@/assets/partners/guinee.png';
import logoUganc from '@/assets/partners/uganc.png';
import logoSimandou from '@/assets/partners/simandou.png';
import heroMain from '@/assets/heros/banniere-medicale-avec-medecin-tenant-une-tablette.jpg';
import heroPharmacist from '@/assets/heros/homme-travaillant-comme-pharmacien.jpg';
import heroWoman from '@/assets/heros/portrait-d-une-femme-travaillant-dans-l-industrie-pharmaceutique.jpg';
import heroPills from '@/assets/heros/angle-eleve-des-feuilles-de-pilules-et-des-recipients-en-plastique.jpg';

const features = [
  { icon: Package, title: 'Gestion des Stocks', desc: 'Suivi en temps réel des stocks pharmaceutiques avec alertes automatiques sur les seuils critiques et les péremptions.' },
  { icon: Truck, title: 'Livraisons & Traçabilité', desc: 'Suivi GPS des livraisons en temps réel depuis le PCG jusqu\'aux structures de santé périphériques.' },
  { icon: BarChart3, title: 'Rapports & Analytics', desc: 'Tableaux de bord dynamiques adaptés à chaque niveau hiérarchique avec indicateurs clés de performance.' },
  { icon: Shield, title: 'Pharmacovigilance', desc: 'Déclaration et suivi des effets indésirables, rappels de lots et gestion des incidents pharmaceutiques.' },
  { icon: MapPin, title: 'Couverture Nationale', desc: '8 Directions Régionales, 33 Directions Préfectorales et des centaines de structures de santé connectées.' },
  { icon: Users, title: 'Multi-niveaux', desc: 'Accès hiérarchique sécurisé : National, Régional, Préfectoral et Périphérique avec contrôle d\'accès granulaire.' },
];

const stats = [
  { value: '8', label: 'Régions (DRS)', icon: Building2 },
  { value: '33', label: 'Préfectures (DPS)', icon: MapPin },
  { value: '500+', label: 'Structures de santé', icon: Hospital },
  { value: '1000+', label: 'Utilisateurs actifs', icon: Users },
];

const howItWorks = [
  {
    number: '1',
    title: 'Commande',
    desc: 'Les structures de santé commandent via la plateforme',
    detail: 'Validation automatique selon disponibilité stock',
    icon: Package
  },
  {
    number: '2',
    title: 'Validation',
    desc: 'DPS/DRS valident selon leurs stocks',
    detail: 'Escalade automatique si stock insuffisant',
    icon: CheckCircle
  },
  {
    number: '3',
    title: 'Livraison',
    desc: 'Livreur assigné, suivi GPS en temps réel',
    detail: 'Preuve de livraison (signature + photo)',
    icon: Truck
  },
  {
    number: '4',
    title: 'Traçabilité',
    desc: 'Chaque mouvement enregistré et tracé',
    detail: 'Rapports automatiques et pharmacovigilance',
    icon: BarChart3
  },
];

const userLevels = [
  { icon: Building2, title: 'Niveau Central', subtitle: 'Ministère, DNPM, PCG', desc: 'Pilotage national, régulation, achats' },
  { icon: MapPinIcon, title: 'Niveau Régional', subtitle: 'DRS (8 régions)', desc: 'Coordination régionale, stocks régionaux' },
  { icon: MapPin, title: 'Niveau Préfectoral', subtitle: 'DPS (33 préfectures)', desc: 'Gestion préfectorale, distribution locale' },
  { icon: Hospital, title: 'Structures de Santé', subtitle: 'Hôpitaux, Centres, Cliniques', desc: 'Commandes, stocks, dispensation' },
  { icon: TruckIcon, title: 'Logistique', subtitle: 'Livreurs', desc: 'Livraison, suivi GPS, preuves' },
];

const benefits = [
  { icon: TrendingUp, title: 'Réduction des ruptures de stock', desc: 'Alertes automatiques et prévisions intelligentes' },
  { icon: Eye, title: 'Traçabilité complète', desc: 'Chaque lot suivi de la PCG jusqu\'au patient' },
  { icon: Clock, title: 'Gain de temps', desc: 'Commandes en ligne, validation automatique' },
  { icon: Target, title: 'Transparence totale', desc: 'Visibilité temps réel pour tous les niveaux' },
  { icon: Shield, title: 'Sécurité renforcée', desc: 'Lutte contre la contrefaçon et le marché noir' },
  { icon: BarChart3, title: 'Rapports automatiques', desc: 'Exports DHIS2, e-LMIS, tableaux de bord' },
];

const testimonials = [
  {
    name: 'Dr. Mamadou Diallo',
    role: 'Directeur DRS Conakry',
    text: 'LivraMed a transformé notre gestion des stocks. Nous avons réduit les ruptures de 60% en 6 mois.',
    avatar: '👨‍⚕️'
  },
  {
    name: 'Fatoumata Camara',
    role: 'Pharmacienne, Hôpital Ignace Deen',
    text: 'La traçabilité en temps réel nous permet de mieux servir nos patients et d\'éviter les pénuries.',
    avatar: '👩‍⚕️'
  },
  {
    name: 'Ibrahima Sow',
    role: 'Responsable Centre de Santé',
    text: 'Les commandes sont maintenant validées en quelques heures au lieu de plusieurs jours. Un vrai gain de temps !',
    avatar: '👨‍💼'
  },
];

const techSpecs = [
  { icon: Lock, title: 'Sécurité', desc: 'Chiffrement TLS 1.3, Authentification 2FA, RBAC' },
  { icon: Globe, title: 'Interopérabilité', desc: 'Compatible DHIS2, e-LMIS, Standards OMS' },
  { icon: Award, title: 'Normes Internationales', desc: 'Inspiré des systèmes FDA (USA), ANSM (France), HSA (Singapour)' },
  { icon: Database, title: 'Disponibilité', desc: 'Uptime 99.5%, Backups quotidiens, Mode offline mobile' },
];

const partners = [
  { logo: logoMshp, name: 'MSHP' },
  { logo: logoOms, name: 'OMS' },
  { logo: logoUsaid, name: 'USAID' },
  { logo: logoUnicef, name: 'UNICEF' },
  { logo: logoGavi, name: 'GAVI' },
  { logo: logoFondsMondial, name: 'Fonds Mondial' },
  { logo: logoPcg, name: 'PCG' },
  { logo: logoMsf, name: 'MSF' },
  { logo: logoCroixRouge, name: 'Croix-Rouge' },
  { logo: logoOnpg, name: 'ONPG' },
  { logo: logoCosephag, name: 'COSEPHAG' },
  { logo: logoGuinee, name: 'Guinée' },
  { logo: logoUganc, name: 'UGANC' },
  { logo: logoSimandou, name: 'Simandou' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logoLivramed} alt="LivraMed" className="h-9 w-9 rounded-lg shadow-sm" />
            <span className="font-display font-bold text-lg text-foreground tracking-tight">LivraMed</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="hidden sm:inline-flex">Se connecter</Button>
            <Button size="sm" onClick={() => navigate('/login')} className="shadow-md hover:shadow-lg transition-all">
              Accéder à la plateforme <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" id="accueil">
        <div className="login-gradient py-20 sm:py-28 lg:py-36 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-left duration-700">
                  <img src={logoMshp} alt="MSHP" className="h-14 w-14 rounded-full bg-white p-1.5 object-contain shadow-lg" />
                  <div>
                    <p className="text-white font-medium text-xs uppercase tracking-wider">Ministère de la Santé et de l'Hygiène Publique</p>
                    <p className="text-white/60 text-[10px] font-bold">République de Guinée</p>
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-white leading-[1.1] animate-in fade-in slide-in-from-left duration-1000">
                  Plateforme Nationale de <span className="text-white underline decoration-white/30 decoration-4 underline-offset-8">Gestion Pharmaceutique</span>
                </h1>
                <p className="mt-8 text-xl text-white/90 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-left duration-1000 delay-200">
                  Le système officiel de traçabilité, de distribution et de gestion des stocks pour assurer la souveraineté sanitaire en Guinée.
                </p>
                <div className="mt-10 flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                  <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="font-bold px-8 h-14 text-primary hover:scale-105 transition-transform shadow-xl">
                    🔐 Connexion Sécurisée
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/inscription')} className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold px-8 h-14 backdrop-blur-sm">
                    🚀 Inscription Structure
                  </Button>
                </div>
                <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80 animate-in fade-in duration-1000 delay-700">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-white" />
                    <span className="font-medium">Protection des Données</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-white" />
                    <span className="font-medium">Temps Réel National</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/0 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <img src={heroMain} alt="Plateforme LivraMed" className="relative rounded-3xl shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform duration-500 object-cover aspect-[4/3]" />
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-2xl animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Activité Aujourd'hui</p>
                      <p className="text-sm font-bold text-foreground">+127 Livraisons</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Animated decorative elements */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24" id="fonctionnalites">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">Comment fonctionne la plateforme ?</h2>
            <div className="h-1.5 w-20 bg-primary mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Un processus digitalisé de bout en bout pour garantir la disponibilité des produits de santé pour chaque Guinéen.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step) => (
              <Card key={step.number} className="hover:shadow-md transition-shadow border-border/50 relative">
                <CardContent className="pt-6">
                  <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{step.desc}</p>
                  <p className="text-xs text-muted-foreground/70 italic">→ {step.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">Fonctionnalités clés</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Une plateforme complète pour la gestion de la chaîne d'approvisionnement pharmaceutique
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow border-border/50">
                <CardContent className="pt-6">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Levels */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">À qui s'adresse la plateforme ?</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Une solution adaptée à chaque niveau de la chaîne d'approvisionnement
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {userLevels.map((level) => (
              <Card key={level.title} className="hover:shadow-md transition-shadow border-border/50 text-center">
                <CardContent className="pt-6">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <level.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{level.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{level.subtitle}</p>
                  <p className="text-xs text-muted-foreground/70">→ {level.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16 bg-muted/50 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">Circuit de distribution national</h2>
            <div className="h-1.5 w-16 bg-primary mx-auto mt-4 rounded-full"></div>
            <p className="mt-6 text-muted-foreground">Une chaîne d'approvisionnement sécurisée et transparente</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8">
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-4">
                {['PCG (Central)', 'DRS (Régional)', 'DPS (Préfectoral)', 'Structure de santé'].map((step, i) => (
                  <div key={step} className="flex-1 flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full bg-card rounded-2xl border border-border/50 px-6 py-8 text-center shadow-sm hover:shadow-md transition-all group flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="font-bold text-sm italic">0{i + 1}</span>
                      </div>
                      <p className="text-sm font-bold text-foreground leading-tight">{step}</p>
                    </div>
                    {i < 3 && <ArrowRight className="h-6 w-6 text-muted-foreground/30 hidden md:block" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4">
              <img src={heroPills} alt="Gestion des produits" className="rounded-2xl shadow-lg border border-border/50 object-cover aspect-square" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">Pourquoi choisir LivraMed ?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Une solution éprouvée qui apporte des bénéfices concrets à tous les acteurs du système de santé guinéen.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-card transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-green-500/5 rounded-[40px] -rotate-2"></div>
              <img src={heroWoman} alt="Professionnelle de santé" className="relative rounded-[32px] shadow-xl hover:scale-[1.01] transition-transform duration-500 aspect-square object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">Ce qu'en disent nos utilisateurs</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Témoignages de professionnels de santé
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="hover:shadow-md transition-shadow border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Specs */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">Technologies et conformité</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Une plateforme moderne, sécurisée et conforme aux normes internationales
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techSpecs.map((spec) => (
              <Card key={spec.title} className="hover:shadow-md transition-shadow border-border/50 text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <spec.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{spec.title}</h3>
                  <p className="text-xs text-muted-foreground">{spec.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners section updated with ID for smooth scrolling or better structure */}
      <section className="py-16 bg-muted/50 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-8">Ils nous soutiennent</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {partners.map((p) => (
              <div key={p.name} className="h-10 md:h-12 w-24 md:w-32 flex items-center justify-center group" title={p.name}>
                <img src={p.logo} alt={p.name} className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:drop-shadow-md transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Support */}
      <section className="py-16 sm:py-28" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-6">Besoin d'aide ou d'information ?</h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Notre équipe de support technique et d'accompagnement est à votre disposition pour vous aider dans l'utilisation de la plateforme.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">Email Support</p>
                    <p className="text-lg font-medium text-foreground">support@livramed.gov.gn</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">Téléphone</p>
                    <p className="text-lg font-medium text-foreground">+224 610 05 87 34</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase">Base de Connaissances</p>
                    <p className="text-lg font-medium text-foreground">docs.livramed.gov.gn</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate('/inscription')} className="px-8 shadow-lg hover:shadow-xl transition-all h-14 font-bold">
                  Demander une démo
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/contact')} className="px-8 h-14 font-bold">
                  Contactez-nous
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-[40px] rotate-3"></div>
              <img src={heroPharmacist} alt="Support LivraMed" className="relative rounded-[32px] shadow-2xl border border-border/50 object-cover aspect-video" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Prêt à transformer votre gestion pharmaceutique ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez les 1000+ professionnels de santé qui font confiance à LivraMed pour une chaîne
            d'approvisionnement efficace et sécurisée.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoLivramed} alt="LivraMed" className="h-8 w-8 rounded-md" />
                <span className="font-display font-bold text-foreground">LivraMed</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Plateforme Nationale de Gestion Pharmaceutique de la République de Guinée
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Liens rapides</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#accueil" className="hover:text-primary transition-colors">Accueil</a></li>
                <li><a href="/login" className="hover:text-primary transition-colors">Se connecter</a></li>
                <li><a href="#fonctionnalites" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Ressources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/documentation" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="/faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="/guide" className="hover:text-foreground transition-colors">Guide</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Légal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</a></li>
                <li><a href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</a></li>
                <li><a href="/cgu" className="hover:text-foreground transition-colors">CGU</a></li>
                <li><a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Ministère de la Santé et de l'Hygiène Publique. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
