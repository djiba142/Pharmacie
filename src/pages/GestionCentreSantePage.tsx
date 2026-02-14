import { HeartPulse } from 'lucide-react';
import GestionStructure from '@/components/structures/GestionStructure';

export default function GestionCentreSantePage() {
  return (
    <GestionStructure
      typeStructure="CENTRE_SANTE"
      titre="Gestion Centre de Santé"
      description="Stocks du centre, saisie temps réel et remontée vers DPS/DRS"
      icon={<div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"><HeartPulse className="h-5 w-5 text-success" /></div>}
    />
  );
}
