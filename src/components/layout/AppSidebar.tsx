import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Pill,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ROLE_LABELS, RoleCode } from '@/types/auth';
import { NavLink } from '@/components/NavLink';
import logoLivramed from '@/assets/logo-livramed.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';

const mainNav = [
  { title: 'Tableau de bord', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Stocks', url: '/stocks', icon: Package },
  { title: 'Médicaments', url: '/medicaments', icon: Pill },
  { title: 'Commandes', url: '/commandes', icon: ShoppingCart },
  { title: 'Livraisons', url: '/livraisons', icon: Truck },
  { title: 'Pharmacovigilance', url: '/pharmacovigilance', icon: AlertTriangle },
  { title: 'Rapports', url: '/rapports', icon: BarChart3 },
];

const adminNav = [
  { title: 'Utilisateurs', url: '/utilisateurs', icon: Users },
  { title: 'Paramètres', url: '/parametres', icon: Settings },
];

const ADMIN_ROLES: RoleCode[] = [
  RoleCode.SUPER_ADMIN,
  RoleCode.ADMIN_CENTRAL,
  RoleCode.ADMIN_DRS,
  RoleCode.ADMIN_DPS,
];

export function AppSidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-accent-foreground">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
