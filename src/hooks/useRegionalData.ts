import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useUserLevel } from './useUserLevel';

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

export interface DPS {
    id: string;
    nom: string;
    drs_id: string;
}

export interface DRS {
    id: string;
    nom: string;
    region?: string;
}

export interface RegionalDataResult {
    drs: DRS | null;
    dps: DPS[];
    stocks: Stock[];
    commandes: Commande[];
    livraisons: Livraison[];
    stats: {
        totalStocks: number;
        totalCommandes: number;
        totalLivraisons: number;
        alertes: number;
        stockTotalQuantity: number;
        dpsCount: number;
    };
    dpsPerformance: Array<{
        dpsId: string;
        dpsName: string;
        stocks: number;
        alertes: number;
        performance: number;
    }>;
}

export function useRegionalData() {
    const { user } = useAuthStore();
    const { entityId } = useUserLevel();

    return useQuery<RegionalDataResult>({
        queryKey: ['regional-dashboard', entityId],
        queryFn: async () => {
            if (!entityId) throw new Error('Entity ID non disponible');

            // 1. Récupérer la DRS
            const { data: drs, error: drsError } = await supabase
                .from('drs')
                .select('*')
                .eq('id', entityId)
                .single();

            if (drsError) throw new Error(`Erreur DRS: ${drsError.message}`);

            // 2. Récupérer les DPS de cette DRS
            const { data: dps, error: dpsError } = await supabase
                .from('dps')
                .select('*')
                .eq('drs_id', entityId);

            if (dpsError) throw new Error(`Erreur DPS: ${dpsError.message}`);

            const dpsList = (dps as DPS[]) || [];
            const dpsIds = dpsList.map(d => d.id);
            const allEntityIds = [entityId, ...dpsIds];

            // 3. Lancer les requêtes en parallèle
            const [stocksRes, commandesRes, livraisonsRes] = await Promise.all([
                // Stocks de la région (DRS + toutes les DPS)
                supabase
                    .from('stocks')
                    .select(`
                        *,
                        lot:lots (
                            date_peremption,
                            medicament:medicaments (
                                nom_commercial,
                                dci
                            )
                        )
                    `)
                    .in('entite_id', allEntityIds),

                // Commandes de la région
                (supabase
                    .from('commandes')
                    .select('*') as any)
                    .in('entite_origine_id', allEntityIds),

                // Livraisons vers la région
                (supabase
                    .from('livraisons')
                    .select('*') as any)
                    .in('entite_destination_id', allEntityIds)
            ]);

            if (stocksRes.error) throw new Error(`Erreur stocks: ${stocksRes.error.message}`);
            if (commandesRes.error) throw new Error(`Erreur commandes: ${commandesRes.error.message}`);
            if (livraisonsRes.error) throw new Error(`Erreur livraisons: ${livraisonsRes.error.message}`);

            const stocks: Stock[] = (stocksRes.data || []).map((item: any) => ({
                id: item.id,
                nom: item.lot?.medicament?.nom_commercial || item.lot?.medicament?.dci || 'Médicament inconnu',
                quantite_actuelle: item.quantite_actuelle,
                seuil_alerte: item.seuil_alerte,
                date_peremption: item.lot?.date_peremption || null,
                entite_id: item.entite_id,
                prix_unitaire: item.prix_unitaire
            }));
            const commandes = (commandesRes.data as Commande[]) || [];
            const livraisons = (livraisonsRes.data as Livraison[]) || [];

            // 4. Calculs métier
            const alertStocks = stocks.filter(s => s.quantite_actuelle <= s.seuil_alerte);

            // Performance par DPS
            const dpsPerformance = dpsList.map(d => {
                const dpsStocks = stocks.filter(s => s.entite_id === d.id);
                const dpsAlertes = dpsStocks.filter(s => s.quantite_actuelle <= s.seuil_alerte);
                return {
                    dpsId: d.id,
                    dpsName: d.nom,
                    stocks: dpsStocks.length,
                    alertes: dpsAlertes.length,
                    performance: dpsStocks.length > 0
                        ? (1 - (dpsAlertes.length / dpsStocks.length)) * 100
                        : 100
                };
            });

            return {
                drs: drs as DRS,
                dps: dpsList,
                stocks,
                commandes,
                livraisons,
                stats: {
                    totalStocks: stocks.length,
                    totalCommandes: commandes.length,
                    totalLivraisons: livraisons.length,
                    alertes: alertStocks.length,
                    stockTotalQuantity: stocks.reduce((sum, s) => sum + (s.quantite_actuelle || 0), 0),
                    dpsCount: dpsList.length
                },
                dpsPerformance
            };
        },
        enabled: !!user && !!entityId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000
    });
}
