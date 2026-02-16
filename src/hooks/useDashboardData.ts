import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserLevel } from '@/hooks/useUserLevel';
import { DRS } from '@/hooks/useNationalData';

interface StockData {
  id: string;
  entite_id: string;
  quantite_actuelle: number;
  seuil_alerte: number;
  seuil_minimal: number;
  lots?: {
    medicament_id: string;
    date_peremption: string;
  };
}

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
  // Récupérer les stocks avec les informations liées au lot et au médicament
  const stocksQuery = useQuery({
    queryKey: ['dashboard-stocks', level, entityId],
    queryFn: async () => {
      let query = supabase.from('stocks').select('*, lots!inner(*, medicaments!inner(*))');

      // Filtrer par entité pour les niveaux non nationaux
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

  // Récupérer le nombre de structures
  const structuresQuery = useQuery({
    queryKey: ['dashboard-structures', level, entityId],
    queryFn: async () => {
      let query = supabase.from('structures').select('id, type, dps_id, nom', { count: 'exact' });

      if (level === 'prefectoral' && entityId) {
        query = query.eq('dps_id', entityId);
      }
      // Pour le niveau régional, nous devrions joindre DPS->DRS, mais pour l'instant récupérer tout et filtrer côté client

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  // Récupérer les DRS pour le résumé régional
  const drsQuery = useQuery({
    queryKey: ['dashboard-drs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('drs').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: level === 'national',
  });

  // Récupérer les DPS pour la vue préfectorale
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

  // Calculer les statistiques à partir des données de stocks
  const stocks = stocksQuery.data || [];
  const now = new Date();
  const in3Months = new Date();
  in3Months.setMonth(in3Months.getMonth() + 3);

  const stats: DashboardStats = {
    totalStocks: stocks.length,
    stocksEnAlerte: stocks.filter((s: StockData) => s.quantite_actuelle <= s.seuil_alerte && s.quantite_actuelle > s.seuil_minimal).length,
    stocksCritiques: stocks.filter((s: StockData) => s.quantite_actuelle <= s.seuil_minimal).length,
    totalMedicaments: new Set(stocks.map((s: StockData) => s.lots?.medicament_id)).size,
    totalStructures: structuresQuery.data || 0,
    totalLots: stocks.length,
    lotsPerimes: stocks.filter((s: StockData) => new Date(s.lots?.date_peremption || '').getTime() < now.getTime()).length,
    lotsBientotPerimes: stocks.filter((s: StockData) => {
      if (!s.lots?.date_peremption) return false;
      const exp = new Date(s.lots.date_peremption);
      return exp >= now && exp <= in3Months;
    }).length,
  };

  // Grouper les stocks par entite_id pour le graphique régional
  const regionSummary: RegionStockSummary[] = (drsQuery.data || []).map((drs: DRS) => {
    const drsStocks = stocks.filter((s: StockData) => s.entite_id === drs.id);
    return {
      region: drs.nom.replace('DRS ', ''),
      total: drsStocks.length,
      alertes: drsStocks.filter((s: StockData) => s.quantite_actuelle <= s.seuil_alerte).length,
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
