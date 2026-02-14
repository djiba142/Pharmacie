import { Hospital } from 'lucide-react';
import GestionStructure from '@/components/structures/GestionStructure';

export default function GestionHopitalPage() {
  return (
    <GestionStructure
      typeStructure="HOPITAL"
      titre="Gestion Hôpital"
      description="Stocks hospitaliers, saisie temps réel et remontée vers DPS/DRS"
      icon={<div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center"><Hospital className="h-5 w-5 text-info" /></div>}
    />
  );
}
