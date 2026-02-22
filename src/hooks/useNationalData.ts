import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

// --- Interfaces ---
export interface Stock {
    id: string;
    nom: string;
    quantite_actuelle: number;
    seuil_alerte: number;
    date_peremption: string | null;
    entite_id: string;
    prix_unitaire?: number;
}

export interface Commande {
    id: string;
    statut: string;
    created_at: string;
    entite_origine_id: string;
}

export interface Livraison {
    id: string;
    created_at: string;
    entite_destination_id: string;
}

export interface DRS {
    id: string;
    nom: string;
    region?: string;
}

interface DashboardStats {
    totalStocks: number;
    totalCommandes: number;
    totalLivraisons: number;
    alertes: number;
    stockTotalQuantity: number;
    activeUsers: number;
}

export interface RegionPerformance {
    regionId: string;
    regionName: string;
    performance: number;
    stocks: number;
    commandes: number;
}

export interface CriticalStockAlert {
    id: string;
    medicament: string;
    entite_nom: string;
    quantite: number;
    seuil_minimal: number;
    region: string;
}

export interface NationalDataResult {
    stats: DashboardStats;
    stocks: Stock[];
    commandes: Commande[];
    livraisons: Livraison[];
    drs: DRS[];
    regionPerformance: RegionPerformance[];
    criticalStockAlerts: CriticalStockAlert[];
}

interface StockWithLot {
    id: string;
    quantite_actuelle: number;
    seuil_alerte: number;
    seuil_minimal?: number;
    entite_id: string;
    entite_type?: string;
    prix_unitaire?: number;
    lot?: {
        date_peremption: string | null;
        medicament?: {
            nom_commercial: string;
            dci: string;
        };
    };
}

export function useNationalData() {
    const { user } = useAuthStore();

    return useQuery<NationalDataResult>({
        queryKey: ['national-dashboard', user?.id],
        queryFn: async () => {
            // Récupérer toutes les données nationales en parallèle
            const [stocksRes, commandesRes, livraisonsRes, drsRes, dpsRes, structuresRes, profilesCountRes] = await Promise.all([
                supabase.from('stocks').select(`
                    *,
                    lot:lots (
                        date_peremption,
                        medicament:medicaments (
                            nom_commercial,
                            dci
                        )
                    )
                `),
                supabase.from('commandes').select('*'),
                supabase.from('livraisons').select('*'),
                supabase.from('drs').select('*'),
                supabase.from('dps').select('id, drs_id'),
                supabase.from('structures').select('id, dps_id'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true)
            ]);

            // Gestion des erreurs
            if (stocksRes.error) throw new Error(`Erreur stocks: ${stocksRes.error.message}`);
            if (commandesRes.error) throw new Error(`Erreur commandes: ${commandesRes.error.message}`);
            if (livraisonsRes.error) throw new Error(`Erreur livraisons: ${livraisonsRes.error.message}`);
            if (drsRes.error) throw new Error(`Erreur DRS: ${drsRes.error.message}`);

            const stocksRaw = (stocksRes.data as unknown as StockWithLot[]) || [];
            const stocks: Stock[] = stocksRaw.map((item) => ({
                id: item.id,
                nom: item.lot?.medicament?.nom_commercial || item.lot?.medicament?.dci || 'Médicament inconnu',
                quantite_actuelle: item.quantite_actuelle,
                seuil_alerte: item.seuil_alerte,
                date_peremption: item.lot?.date_peremption || null,
                entite_id: item.entite_id,
                prix_unitaire: item.prix_unitaire
            }));
            const commandes = (commandesRes.data as unknown as Commande[]) || [];
            const livraisons = (livraisonsRes.data as unknown as Livraison[]) || [];
            const drs = (drsRes.data as unknown as DRS[]) || [];
            const dpsMapping = (dpsRes.data || []) as unknown as { id: string, drs_id: string }[];
            const structureMapping = (structuresRes.data || []) as unknown as { id: string, dps_id: string }[];

            // Construire une map entite_id -> drs_id
            const entityToDrsMap: Record<string, string> = {};

            // 1. Les DRS eux-mêmes
            drs.forEach(d => { entityToDrsMap[d.id] = d.id; });

            // 2. Les DPS mappent vers leur DRS
            dpsMapping.forEach(d => { entityToDrsMap[d.id] = d.drs_id; });

            // 3. Les structures mappent vers le DRS de leur DPS
            structureMapping.forEach(s => {
                const dpsId = s.dps_id;
                const drsId = dpsMapping.find(d => d.id === dpsId)?.drs_id;
                if (drsId) {
                    entityToDrsMap[s.id] = drsId;
                }
            });

            // Calculs métier
            const alertStocks = stocks.filter(s => s.quantite_actuelle <= s.seuil_alerte);

            // Calculer les KPIs nationaux
            const stats: DashboardStats = {
                totalStocks: stocks.length,
                totalCommandes: commandes.length,
                totalLivraisons: livraisons.length,
                alertes: alertStocks.length,
                stockTotalQuantity: stocks.reduce((sum, s) => sum + (s.quantite_actuelle || 0), 0),
                activeUsers: profilesCountRes.count || 0
            };

            // Performance par région
            const regionPerformance: RegionPerformance[] = drs.map(d => {
                // Filtrer les stocks et commandes appartenant à ce DRS ou ses sous-entités
                const regionStocks = stocks.filter(s => entityToDrsMap[s.entite_id] === d.id);
                const regionCommandes = commandes.filter(c => entityToDrsMap[c.entite_origine_id] === d.id);

                return {
                    regionId: d.id,
                    regionName: d.region || d.nom,
                    stocks: regionStocks.length,
                    commandes: regionCommandes.length,
                    performance: regionStocks.length > 0
                        ? (1 - (regionStocks.filter(s => s.quantite_actuelle <= s.seuil_alerte).length / regionStocks.length)) * 100
                        : 100
                };
            });

            // Alertes de stock critique (quantité <= seuil_minimal) pour toutes les structures
            const criticalStockAlerts: CriticalStockAlert[] = stocksRaw
                .filter((item) => item.quantite_actuelle <= (item.seuil_minimal || 5))
                .map((item) => {
                    const drsId = entityToDrsMap[item.entite_id];
                    const regionName = drs.find(d => d.id === drsId)?.region || drs.find(d => d.id === drsId)?.nom || 'Inconnue';
                    return {
                        id: item.id,
                        medicament: item.lot?.medicament?.dci || 'N/A',
                        entite_nom: item.entite_type + " " + item.entite_id, // On pourrait faire mieux avec plus de mappings
                        quantite: item.quantite_actuelle,
                        seuil_minimal: item.seuil_minimal || 5,
                        region: regionName
                    };
                });

            return {
                stats,
                stocks,
                commandes,
                livraisons,
                drs,
                regionPerformance,
                criticalStockAlerts
            };
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000
    });
}
