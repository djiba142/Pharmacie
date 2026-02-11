import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Truck, BarChart3, Shield, MapPin, Users, ArrowRight, CheckCircle } from 'lucide-react';
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

const features = [
  { icon: Package, title: 'Gestion des Stocks', desc: 'Suivi en temps réel des stocks pharmaceutiques avec alertes automatiques sur les seuils critiques et les péremptions.' },
  { icon: Truck, title: 'Livraisons & Traçabilité', desc: 'Suivi GPS des livraisons en temps réel depuis le PCG jusqu\'aux structures de santé périphériques.' },
  { icon: BarChart3, title: 'Rapports & Analytics', desc: 'Tableaux de bord dynamiques adaptés à chaque niveau hiérarchique avec indicateurs clés de performance.' },
  { icon: Shield, title: 'Pharmacovigilance', desc: 'Déclaration et suivi des effets indésirables, rappels de lots et gestion des incidents pharmaceutiques.' },
  { icon: MapPin, title: 'Couverture Nationale', desc: '8 Directions Régionales, 33 Directions Préfectorales et des centaines de structures de santé connectées.' },
  { icon: Users, title: 'Multi-niveaux', desc: 'Accès hiérarchique sécurisé : National, Régional, Préfectoral et Périphérique avec contrôle d\'accès granulaire.' },
];

const stats = [
  { value: '8', label: 'Régions sanitaires' },
  { value: '33', label: 'Préfectures couvertes' },
  { value: '500+', label: 'Structures de santé' },
  { value: '1000+', label: 'Médicaments suivis' },
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
          <div className="flex items-center gap-3">
            <img src={logoLivramed} alt="LivraMed" className="h-9 w-9 rounded-lg" />
            <span className="font-display font-bold text-lg text-foreground">LivraMed</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Se connecter</Button>
            <Button size="sm" onClick={() => navigate('/login')}>
              Accéder à la plateforme <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="login-gradient py-20 sm:py-28 lg:py-36">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoMshp} alt="MSHP" className="h-12 w-12 rounded-full bg-primary-foreground/90 p-1 object-contain" />
                <div>
                  <p className="text-primary-foreground/80 text-xs">Ministère de la Santé et de l'Hygiène Publique</p>
                  <p className="text-primary-foreground/50 text-[10px]">République de Guinée</p>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Plateforme Nationale de Gestion Pharmaceutique
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl">
                Système intégré de gestion, suivi et distribution des médicaments essentiels
                pour l'ensemble du territoire guinéen.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="font-semibold">
                  Accéder à la plateforme <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-primary-foreground/5 translate-x-1/3" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-primary-foreground/5" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-display font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
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

      {/* Workflow */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">Circuit de distribution</h2>
            <p className="mt-3 text-muted-foreground">Du PCG jusqu'au patient</p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
            {['PCG (Central)', 'DRS (Régional)', 'DPS (Préfectoral)', 'Structure de santé'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="bg-card rounded-xl border border-border/50 px-6 py-4 text-center shadow-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{step}</p>
                </div>
                {i < 3 && <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold text-foreground">Nos partenaires</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {partners.map((p) => (
              <div key={p.name} className="h-14 w-20 bg-card rounded-lg border border-border/50 flex items-center justify-center p-2 hover:shadow-sm transition-shadow">
                <img src={p.logo} alt={p.name} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoLivramed} alt="LivraMed" className="h-7 w-7 rounded-md" />
            <span className="text-sm font-display font-semibold text-foreground">LivraMed</span>
            <span className="text-xs text-muted-foreground">— République de Guinée</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ministère de la Santé et de l'Hygiène Publique. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
