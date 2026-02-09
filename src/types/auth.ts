export enum RoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_CENTRAL = 'ADMIN_CENTRAL',
  MIN_CABINET = 'MIN_CABINET',
  MIN_SG = 'MIN_SG',
  MIN_IG = 'MIN_IG',
  DNPM_DIR = 'DNPM_DIR',
  DNPM_ADJ = 'DNPM_ADJ',
  DNPM_CHEF_SECTION = 'DNPM_CHEF_SECTION',
  PCG_DIR = 'PCG_DIR',
  PCG_ADJ = 'PCG_ADJ',
  PCG_DIR_ACHATS = 'PCG_DIR_ACHATS',
  PCG_DIR_STOCK = 'PCG_DIR_STOCK',
  PCG_DIR_DISTRIB = 'PCG_DIR_DISTRIB',
  ADMIN_DRS = 'ADMIN_DRS',
  DRS_DIR = 'DRS_DIR',
  DRS_ADJ = 'DRS_ADJ',
  DRS_RESP_PHARMA = 'DRS_RESP_PHARMA',
  DRS_LOGISTIQUE = 'DRS_LOGISTIQUE',
  DRS_EPIDEMIO = 'DRS_EPIDEMIO',
  ADMIN_DPS = 'ADMIN_DPS',
  DPS_DIR = 'DPS_DIR',
  DPS_ADJ = 'DPS_ADJ',
  DPS_RESP_PHARMA = 'DPS_RESP_PHARMA',
  DPS_APPRO = 'DPS_APPRO',
  DPS_AGENT = 'DPS_AGENT',
  HOP_DIR = 'HOP_DIR',
  HOP_PHARMA = 'HOP_PHARMA',
  CS_RESP = 'CS_RESP',
  CS_AGENT = 'CS_AGENT',
  CLIN_DIR = 'CLIN_DIR',
  CLIN_PHARMA = 'CLIN_PHARMA',
  PHARM_REDIST = 'PHARM_REDIST',
  PHARM_RESP = 'PHARM_RESP',
  LIVREUR_PCG = 'LIVREUR_PCG',
  LIVREUR_DRS = 'LIVREUR_DRS',
  LIVREUR_DPS = 'LIVREUR_DPS',
  LIVREUR_HOP = 'LIVREUR_HOP',
  LIVREUR_PHARM_REDIST = 'LIVREUR_PHARM_REDIST',
}

export const ROLE_LABELS: Record<RoleCode, string> = {
  [RoleCode.SUPER_ADMIN]: 'Super Administrateur',
  [RoleCode.ADMIN_CENTRAL]: 'Administrateur Central',
  [RoleCode.MIN_CABINET]: 'Cabinet du Ministère',
  [RoleCode.MIN_SG]: 'Secrétariat Général',
  [RoleCode.MIN_IG]: 'Inspection Générale',
  [RoleCode.DNPM_DIR]: 'Directeur DNPM',
  [RoleCode.DNPM_ADJ]: 'Adjoint DNPM',
  [RoleCode.DNPM_CHEF_SECTION]: 'Chef de Section DNPM',
  [RoleCode.PCG_DIR]: 'Directeur PCG',
  [RoleCode.PCG_ADJ]: 'Adjoint PCG',
  [RoleCode.PCG_DIR_ACHATS]: 'Dir. Achats PCG',
  [RoleCode.PCG_DIR_STOCK]: 'Dir. Stock PCG',
  [RoleCode.PCG_DIR_DISTRIB]: 'Dir. Distribution PCG',
  [RoleCode.ADMIN_DRS]: 'Admin DRS',
  [RoleCode.DRS_DIR]: 'Directeur DRS',
  [RoleCode.DRS_ADJ]: 'Adjoint DRS',
  [RoleCode.DRS_RESP_PHARMA]: 'Resp. Pharmacie DRS',
  [RoleCode.DRS_LOGISTIQUE]: 'Logistique DRS',
  [RoleCode.DRS_EPIDEMIO]: 'Épidémiologie DRS',
  [RoleCode.ADMIN_DPS]: 'Admin DPS',
  [RoleCode.DPS_DIR]: 'Directeur DPS',
  [RoleCode.DPS_ADJ]: 'Adjoint DPS',
  [RoleCode.DPS_RESP_PHARMA]: 'Resp. Pharmacie DPS',
  [RoleCode.DPS_APPRO]: 'Approvisionnement DPS',
  [RoleCode.DPS_AGENT]: 'Agent DPS',
  [RoleCode.HOP_DIR]: 'Directeur Hôpital',
  [RoleCode.HOP_PHARMA]: 'Pharmacien Hôpital',
  [RoleCode.CS_RESP]: 'Responsable Centre de Santé',
  [RoleCode.CS_AGENT]: 'Agent Centre de Santé',
  [RoleCode.CLIN_DIR]: 'Directeur Clinique',
  [RoleCode.CLIN_PHARMA]: 'Pharmacien Clinique',
  [RoleCode.PHARM_REDIST]: 'Pharmacie Redistribution',
  [RoleCode.PHARM_RESP]: 'Responsable Pharmacie',
  [RoleCode.LIVREUR_PCG]: 'Livreur PCG',
  [RoleCode.LIVREUR_DRS]: 'Livreur DRS',
  [RoleCode.LIVREUR_DPS]: 'Livreur DPS',
  [RoleCode.LIVREUR_HOP]: 'Livreur Hôpital',
  [RoleCode.LIVREUR_PHARM_REDIST]: 'Livreur Pharmacie',
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleCode;
  entityType?: string;
  entityId?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}
