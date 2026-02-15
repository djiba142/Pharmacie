import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { OfficialHeader } from '@/components/layout/OfficialHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationsBell } from '@/components/notifications/NotificationsBell';

export default function DashboardLayout() {
  const { user, isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full flex-col">
        <OfficialHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground">{user.role || 'Utilisateur'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NotificationsBell />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
