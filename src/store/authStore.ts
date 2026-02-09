import { create } from 'zustand';
import { type AuthState, RoleCode, type User } from '@/types/auth';

// Demo users for testing
const DEMO_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'superadmin@sante.gov.gn',
    password: 'SuperAdmin2025!',
    firstName: 'Super',
    lastName: 'Administrateur',
    role: RoleCode.SUPER_ADMIN,
    isActive: true,
  },
  {
    id: '2',
    email: 'admin.central@sante.gov.gn',
    password: 'Admin2025!',
    firstName: 'Mamadou',
    lastName: 'Barry',
    role: RoleCode.ADMIN_CENTRAL,
    isActive: true,
  },
  {
    id: '3',
    email: 'drs.conakry@sante.gov.gn',
    password: 'DRS2025!',
    firstName: 'Fatoumata',
    lastName: 'Diallo',
    role: RoleCode.DRS_RESP_PHARMA,
    entityType: 'DRS',
    isActive: true,
  },
  {
    id: '4',
    email: 'pharma.donka@sante.gov.gn',
    password: 'Pharma2025!',
    firstName: 'Aïssatou',
    lastName: 'Sow',
    role: RoleCode.HOP_PHARMA,
    entityType: 'HOPITAL',
    isActive: true,
  },
  {
    id: '5',
    email: 'livreur1@sante.gov.gn',
    password: 'Livreur2025!',
    firstName: 'Ibrahima',
    lastName: 'Sylla',
    role: RoleCode.LIVREUR_DRS,
    entityType: 'DRS',
    isActive: true,
  },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email: string, password: string) => {
    const found = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      const { password: _, ...user } = found;
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
