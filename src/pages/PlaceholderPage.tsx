import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const titles: Record<string, string> = {
  '/stocks': 'Gestion des Stocks',
  '/medicaments': 'Médicaments',
  '/commandes': 'Gestion des Commandes',
  '/livraisons': 'Gestion des Livraisons',
  '/pharmacovigilance': 'Pharmacovigilance',
  '/rapports': 'Rapports & Analytics',
  '/utilisateurs': 'Gestion des Utilisateurs',
  '/parametres': 'Paramètres Système',
};

const PlaceholderPage = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] || 'Page';

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-display font-bold mb-6">{title}</h1>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <Construction className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-display font-semibold">Module en construction</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Ce module sera disponible prochainement. L'interface complète de {title.toLowerCase()} est en cours de développement.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
