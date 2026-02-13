import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Package, Truck, BarChart3, AlertTriangle, MapPin, Users, CheckCircle } from 'lucide-react';
import logoLivramed from '@/assets/logo-livramed.png';
import logoMshp from '@/assets/partners/mshp.png';

const features = [
  { icon: Package, title: 'Gestion des Stocks', desc: 'Suivi en temps réel avec alertes automatiques sur seuils critiques et péremptions.' },
  { icon: Truck, title: 'Livraisons GPS', desc: 'Suivi temps réel des livraisons du PCG aux structures périphériques.' },
  { icon: BarChart3, title: 'Rapports & PDF', desc: 'Tableaux de bord dynamiques et génération de rapports PDF par niveau.' },
  { icon: AlertTriangle, title: 'Pharmacovigilance', desc: 'Déclaration d\'effets indésirables et rappels de lots avec escalade.' },
  { icon: MapPin, title: 'Couverture nationale', desc: '8 DRS, 33 DPS et des centaines de structures connectées.' },
  { icon: Users, title: 'Rôles granulaires', desc: '35+ rôles avec contrôle d\'accès hiérarchique à 4 niveaux.' },
];

export default function AProposPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <img src={logoLivramed} alt="LivraMed" className="h-14 w-14 rounded-xl" />
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">LivraMed</h1>
          <p className="text-sm text-muted-foreground">Plateforme Nationale de Gestion Pharmaceutique</p>
          <Badge variant="secondary" className="mt-1">Version 1.0</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoMshp} alt="MSHP" className="h-12 w-12 rounded-full bg-muted p-1 object-contain" />
            <div>
              <p className="font-semibold text-sm">Ministère de la Santé et de l'Hygiène Publique</p>
              <p className="text-xs text-muted-foreground">République de Guinée</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            LivraMed est un système intégré de gestion, suivi et distribution des médicaments essentiels
            pour l'ensemble du territoire guinéen. Inspiré des modèles FDA et DP-Ruptures, il couvre
            l'ensemble de la chaîne d'approvisionnement pharmaceutique, du PCG central jusqu'aux
            structures de santé périphériques.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-display font-bold mb-4">Fonctionnalités</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <Card key={f.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-display font-bold mb-3">Architecture hiérarchique</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            {['National (PCG/DNPM)', 'Régional (8 DRS)', 'Préfectoral (33 DPS)', 'Périphérique'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="bg-muted rounded-lg px-4 py-3 text-center">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-xs font-medium">{step}</p>
                </div>
                {i < 3 && <span className="text-muted-foreground hidden md:block">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()} LivraMed — Ministère de la Santé et de l'Hygiène Publique, République de Guinée
      </p>
    </div>
  );
}
