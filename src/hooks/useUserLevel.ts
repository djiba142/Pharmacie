import { useAuthStore } from '@/store/authStore';

export type UserLevel = 'national' | 'regional' | 'prefectoral' | 'peripheral';

const NATIONAL_ROLES = [
  'SUPER_ADMIN', 'ADMIN_CENTRAL',
  'MIN_CABINET', 'MIN_SG', 'MIN_IG',
  'DNPM_DIR', 'DNPM_ADJ', 'DNPM_CHEF_SECTION',
  'PCG_DIR', 'PCG_ADJ', 'PCG_DIR_ACHATS', 'PCG_DIR_STOCK', 'PCG_DIR_DISTRIB',
];

const REGIONAL_ROLES = [
  'ADMIN_DRS', 'DRS_DIR', 'DRS_ADJ', 'DRS_RESP_PHARMA', 'DRS_LOGISTIQUE', 'DRS_EPIDEMIO',
  'LIVREUR_DRS',
];

const PREFECTORAL_ROLES = [
  'ADMIN_DPS', 'DPS_DIR', 'DPS_ADJ', 'DPS_RESP_PHARMA', 'DPS_APPRO', 'DPS_AGENT',
  'LIVREUR_DPS',
];

// Everything else is peripheral (HOP, CS, CLIN, PHARM, etc.)

export function getUserLevel(role?: string): UserLevel {
  if (!role) return 'peripheral';
  if (NATIONAL_ROLES.includes(role)) return 'national';
  if (REGIONAL_ROLES.includes(role)) return 'regional';
  if (PREFECTORAL_ROLES.includes(role)) return 'prefectoral';
  return 'peripheral';
}

export const LEVEL_LABELS: Record<UserLevel, string> = {
  national: 'Vue nationale',
  regional: 'Vue régionale',
  prefectoral: 'Vue préfectorale',
  peripheral: 'Vue structure',
};

export function useUserLevel() {
  const user = useAuthStore((s) => s.user);
  const level = getUserLevel(user?.role);
  return { level, entityId: user?.entity_id, entityType: user?.entity_type, user };
}
