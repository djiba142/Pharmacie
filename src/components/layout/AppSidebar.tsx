import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, AlertTriangle,
  BarChart3, Users, Settings, LogOut, Pill, ClipboardCheck, User, Info,
  Building2, Hospital, HeartPulse, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROLE_LABELS, RoleCode } from '@/types/auth';
import { NavLink } from '@/components/NavLink';
import logoLivramed from '@/assets/logo-livramed.png';
import { useUserLevel, UserLevel } from '@/hooks/useUserLevel';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader,
} from '@/components/ui/sidebar';

type NavItem = {
  title: string; url: string; icon: any;
  levels?: UserLevel[];
};

const mainNav: NavItem[] = [
  { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Stocks', url: '/stocks', icon: Package },
  { title: 'Médicaments', url: '/medicaments', icon: Pill, levels: ['national', 'regional'] },
  { title: 'Commandes', url: '/commandes', icon: ShoppingCart },
  { title: 'Livraisons', url: '/livraisons', icon: Truck, levels: ['national', 'regional', 'prefectoral'] },
  { title: 'Pharmacovigilance', url: '/pharmacovigilance', icon: AlertTriangle, levels: ['national', 'regional'] },
  { title: 'Rapports', url: '/rapports', icon: BarChart3, levels: ['national', 'regional', 'prefectoral'] },
];

const adminNav: NavItem[] = [
  { title: 'Utilisateurs', url: '/utilisateurs', icon: Users },
  { title: 'Inscriptions', url: '/validation-inscriptions', icon: ClipboardCheck },
  { title: 'Journal d\'Audit', url: '/audit', icon: Shield },
  { title: 'Paramètres', url: '/parametres', icon: Settings },
];

const structureNav: NavItem[] = [
  { title: 'Pharmacie', url: '/gestion-pharmacie', icon: Building2 },
  { title: 'Hôpital', url: '/gestion-hopital', icon: Hospital },
  { title: 'Centre de Santé', url: '/gestion-centre-sante', icon: HeartPulse },
];

const userNav: NavItem[] = [
  { title: 'Mon profil', url: '/profil', icon: User },
  { title: 'À propos', url: '/a-propos', icon: Info },
];

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN_CENTRAL', 'ADMIN_DRS', 'ADMIN_DPS'];

export function AppSidebar() {
  const user = useAuthStore((s) => s.user);
  const logoutFn = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const { level } = useUserLevel();
  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role);

  const filteredMainNav = mainNav.filter((item) => !item.levels || item.levels.includes(level));

  const handleLogout = async () => {
    await logoutFn();
    navigate('/login');
  };

  const linkClass = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors";
  const activeClass = "bg-sidebar-accent text-sidebar-accent-foreground font-medium";

  return (
    <Sidebar className="sidebar-gradient border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logoLivramed} alt="LivraMed" className="h-9 w-9 rounded-lg" />
          <div>
            <h2 className="font-display font-bold text-sm text-sidebar-foreground">LivraMed</h2>
            <p className="text-[10px] text-sidebar-foreground/60">Gestion Pharmaceutique</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={linkClass} activeClassName={activeClass}>
                      <item.icon className="h-4 w-4 shrink-0" /><span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={linkClass} activeClassName={activeClass}>
                        <item.icon className="h-4 w-4 shrink-0" /><span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3">Structures</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {structureNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={linkClass} activeClassName={activeClass}>
                      <item.icon className="h-4 w-4 shrink-0" /><span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3">Compte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={linkClass} activeClassName={activeClass}>
                      <item.icon className="h-4 w-4 shrink-0" /><span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-accent-foreground">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.first_name} {user.last_name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.role ? (ROLE_LABELS[user.role as RoleCode] || user.role) : 'Utilisateur'}</p>
            </div>
            <button onClick={handleLogout} className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors" title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
