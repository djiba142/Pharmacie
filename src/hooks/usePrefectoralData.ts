import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useUserLevel } from './useUserLevel';

// --- Interfaces partagées (réutilisez celles de useStructureData si besoin) ---
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

export interface Structure {
    id: string;
    nom: string;
    type: string;
    dps_id: string;
}

export interface DPS {
    id: string;
    nom: string;
    drs_id: string;
    prefecture: string;
}

export interface PrefectoralDataResult {
    dps: DPS | null;
    structures: Structure[];
    stocks: Stock[];
    commandes: Commande[];
    livraisons: Livraison[];
    stats: {
        totalStocks: number;
        totalCommandes: number;
        totalLivraisons: number;
        alertes: number;
        stockTotalQuantity: number;
        structuresCount: number;
    };
    structurePerformance: Array<{
        structureId: string;
        structureName: string;
        type: string;
        stocks: number;
        alertes: number;
    }>;
}

export function usePrefectoralData() {
    const { user } = useAuthStore();
    const { entityId } = useUserLevel();

    return useQuery<PrefectoralDataResult>({
        queryKey: ['prefectoral-dashboard', entityId],
        queryFn: async () => {
            if (!entityId) throw new Error('Entity ID non disponible');

            // 1. Récupérer la DPS
            const { data: dps, error: dpsError } = await supabase
                .from('dps')
                .select('*')
                .eq('id', entityId)
                .single();

            if (dpsError) throw new Error(`Erreur DPS: ${dpsError.message}`);

            // 2. Récupérer les structures de cette DPS
            const { data: structures, error: structuresError } = await supabase
                .from('structures')
                .select('*')
                .eq('dps_id', entityId);

            if (structuresError) console.warn('Erreur structures:', structuresError);

            const structuresList = (structures as Structure[]) || [];
            const structureIds = structuresList.map(s => s.id);

            // 3. Lancer les requêtes en parallèle pour les données liées
            const stocksQuery = supabase
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
                .in('entite_id', [entityId, ...structureIds]);

            const commandesQuery = (supabase
                .from('commandes') as any)
                .select('*')
                .eq('entite_origine_id', entityId);

            const livraisonsQuery = (supabase
                .from('livraisons') as any)
                .select('*')
                .eq('entite_destination_id', entityId);

            const [stocksRes, commandesRes, livraisonsRes] = await Promise.all([
                stocksQuery,
                commandesQuery,
                livraisonsQuery
            ]);

            if (stocksRes.error) console.warn('Erreur stocks:', stocksRes.error);
            if (commandesRes.error) console.warn('Erreur commandes:', commandesRes.error);
            if (livraisonsRes.error) console.warn('Erreur livraisons:', livraisonsRes.error);

            const stocks: Stock[] = (stocksRes.data || []).map((item: any) => ({
                id: item.id,
                nom: item.lot?.medicament?.nom_commercial || item.lot?.medicament?.dci || 'Médicament inconnu',
                quantite_actuelle: item.quantite_actuelle,
                seuil_alerte: item.seuil_alerte,
                date_peremption: item.lot?.date_peremption || null,
                entite_id: item.entite_id,
                prix_unitaire: item.prix_unitaire // Assuming this might exist or be undefined
            }));
            const commandes = (commandesRes.data || []) as Commande[];
            const livraisons = (livraisonsRes.data || []) as Livraison[];

            // 4. Calculs métier
            const alertStocks = stocks.filter(s => s.quantite_actuelle <= s.seuil_alerte);

            // Performance par structure
            const structurePerformance = structuresList.map(struct => {
                const structStocks = stocks.filter(s => s.entite_id === struct.id);
                return {
                    structureId: struct.id,
                    structureName: struct.nom,
                    type: struct.type,
                    stocks: structStocks.length,
                    alertes: structStocks.filter(s => s.quantite_actuelle <= s.seuil_alerte).length
                };
            });

            return {
                dps: dps as DPS,
                structures: structuresList,
                stocks,
                commandes,
                livraisons,
                stats: {
                    totalStocks: stocks.length,
                    totalCommandes: commandes.length,
                    totalLivraisons: livraisons.length,
                    alertes: alertStocks.length,
                    stockTotalQuantity: stocks.reduce((sum, s) => sum + (s.quantite_actuelle || 0), 0),
                    structuresCount: structuresList.length
                },
                structurePerformance
            };
        },
        enabled: !!user && !!entityId,
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000
    });
}
