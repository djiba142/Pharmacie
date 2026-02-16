import { useUserLevel } from '@/hooks/useUserLevel';
import NationalDashboard from './dashboards/NationalDashboard';
import RegionalDashboard from './dashboards/RegionalDashboard';
import PrefectoralDashboard from './dashboards/PrefectoralDashboard';
import StructureDashboard from './dashboards/StructureDashboard';

/**
 * Point d'entrée principal du dashboard
 * Affiche automatiquement le dashboard approprié selon le niveau de l'utilisateur
 * 
 * Niveaux:
 * - National: SUPER_ADMIN, ADMIN_CENTRAL, MIN_*, DNPM_*, PCG_*
 * - Régional: ADMIN_DRS, DRS_DIR, DRS_*
 * - Préfectoral: ADMIN_DPS, DPS_DIR, DPS_*
 * - Structure: HOP_*, CS_*, CLIN_*, PHARM_*, etc.
 */
export default function DashboardPage() {
  const { level } = useUserLevel();

  // Routage conditionnel basé sur le niveau de l'utilisateur
  switch (level) {
    case 'national':
      return <NationalDashboard />;

    case 'regional':
      return <RegionalDashboard />;

    case 'prefectoral':
      return <PrefectoralDashboard />;

    case 'peripheral':
    default:
      return <StructureDashboard />;
  }
}
