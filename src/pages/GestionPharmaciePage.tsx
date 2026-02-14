import { Building2 } from 'lucide-react';
import GestionStructure from '@/components/structures/GestionStructure';

export default function GestionPharmaciePage() {
  return (
    <GestionStructure
      typeStructure="PHARMACIE"
      titre="Gestion Pharmacie"
      description="Stocks, saisie temps réel et remontée vers DPS/DRS"
      icon={<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-primary" /></div>}
    />
  );
}
