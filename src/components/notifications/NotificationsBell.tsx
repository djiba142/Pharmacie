import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check, AlertTriangle, ShoppingCart, Package, Info } from 'lucide-react';

const TYPE_ICONS: Record<string, any> = {
  ALERTE_STOCK: AlertTriangle,
  COMMANDE: ShoppingCart,
  LIVRAISON: Package,
  INFO: Info,
};

const TYPE_COLORS: Record<string, string> = {
  ALERTE_STOCK: 'text-warning',
  COMMANDE: 'text-info',
  LIVRAISON: 'text-primary',
  INFO: 'text-muted-foreground',
};

export function NotificationsBell() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.user_id,
    refetchInterval: 30000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.user_id) return;
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.user_id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.user_id, queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('notifications').update({ lu: true }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user?.user_id) return;
      await supabase.from('notifications').update({ lu: true }).eq('user_id', user.user_id).eq('lu', false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n: any) => !n.lu).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="font-display font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => markAllRead.mutate()}>
              <Check className="h-3 w-3 mr-1" /> Tout lire
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Aucune notification</div>
          ) : (
            notifications.map((n: any) => {
              const Icon = TYPE_ICONS[n.type] || Info;
              const color = TYPE_COLORS[n.type] || 'text-muted-foreground';
              return (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors ${!n.lu ? 'bg-primary/5' : ''}`}
                  onClick={() => !n.lu && markAsRead.mutate(n.id)}
                >
                  <div className="flex gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.lu ? 'font-medium' : 'text-muted-foreground'}`}>{n.titre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(n.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.lu && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  </div>
                </div>
              );
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
