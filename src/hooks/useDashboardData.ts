import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserLevel } from '@/hooks/useUserLevel';

export interface DashboardStats {
  totalStocks: number;
  stocksEnAlerte: number;
  stocksCritiques: number;
  totalMedicaments: number;
  totalStructures: number;
  totalLots: number;
  lotsPerimes: number;
  lotsBientotPerimes: number;
}

export interface RegionStockSummary {
  region: string;
  total: number;
  alertes: number;
}

export function useDashboardData(level: UserLevel, entityId?: string) {
  // Fetch stocks with related lot + medicament info
  const stocksQuery = useQuery({
    queryKey: ['dashboard-stocks', level, entityId],
    queryFn: async () => {
      let query = supabase.from('stocks').select('*, lots!inner(*, medicaments!inner(*))');

      // Filter by entity for non-national levels
      if (level === 'regional' && entityId) {
        query = query.eq('entite_type', 'DRS').eq('entite_id', entityId);
      } else if (level === 'prefectoral' && entityId) {
        query = query.eq('entite_type', 'DPS').eq('entite_id', entityId);
      } else if (level === 'peripheral' && entityId) {
        query = query.eq('entite_id', entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch structures count
  const structuresQuery = useQuery({
    queryKey: ['dashboard-structures', level, entityId],
    queryFn: async () => {
      let query = supabase.from('structures').select('id, type, dps_id, nom', { count: 'exact' });

      if (level === 'prefectoral' && entityId) {
        query = query.eq('dps_id', entityId);
      }
      // For regional, we'd need to join DPS->DRS, but for now fetch all and filter client-side

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch DRS for regional summary
  const drsQuery = useQuery({
    queryKey: ['dashboard-drs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('drs').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: level === 'national',
  });

  // Fetch DPS for prefectoral view
  const dpsQuery = useQuery({
    queryKey: ['dashboard-dps', entityId],
    queryFn: async () => {
      let query = supabase.from('dps').select('*');
      if (entityId) query = query.eq('drs_id', entityId);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: level === 'regional',
  });

  const isLoading = stocksQuery.isLoading || structuresQuery.isLoading;

  // Compute stats from stocks data
  const stocks = stocksQuery.data || [];
  const now = new Date();
  const in3Months = new Date();
  in3Months.setMonth(in3Months.getMonth() + 3);

  const stats: DashboardStats = {
    totalStocks: stocks.length,
    stocksEnAlerte: stocks.filter((s: any) => s.quantite_actuelle <= s.seuil_alerte && s.quantite_actuelle > s.seuil_minimal).length,
    stocksCritiques: stocks.filter((s: any) => s.quantite_actuelle <= s.seuil_minimal).length,
    totalMedicaments: new Set(stocks.map((s: any) => s.lots?.medicament_id)).size,
    totalStructures: structuresQuery.data || 0,
    totalLots: stocks.length,
    lotsPerimes: stocks.filter((s: any) => new Date(s.lots?.date_peremption) < now).length,
    lotsBientotPerimes: stocks.filter((s: any) => {
      const exp = new Date(s.lots?.date_peremption);
      return exp >= now && exp <= in3Months;
    }).length,
  };

  // Group stocks by entite_id for regional chart
  const regionSummary: RegionStockSummary[] = (drsQuery.data || []).map((drs: any) => {
    const drsStocks = stocks.filter((s: any) => s.entite_id === drs.id);
    return {
      region: drs.nom.replace('DRS ', ''),
      total: drsStocks.length,
      alertes: drsStocks.filter((s: any) => s.quantite_actuelle <= s.seuil_alerte).length,
    };
  });

  return {
    stats,
    stocks,
    regionSummary,
    drs: drsQuery.data || [],
    dps: dpsQuery.data || [],
    isLoading,
  };
}
