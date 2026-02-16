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

export interface NationalDataResult {
    stats: DashboardStats;
    stocks: Stock[];
    commandes: Commande[];
    livraisons: Livraison[];
    drs: DRS[];
    regionPerformance: RegionPerformance[];
}

export function useNationalData() {
    const { user } = useAuthStore();

    return useQuery<NationalDataResult>({
        queryKey: ['national-dashboard', user?.id],
        queryFn: async () => {
            // Récupérer toutes les données nationales en parallèle
            const [stocksRes, commandesRes, livraisonsRes, drsRes] = await Promise.all([
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
                supabase.from('commandes').select('*') as any,
                supabase.from('livraisons').select('*') as any,
                supabase.from('drs').select('*') as any
            ]);

            // Gestion des erreurs
            if (stocksRes.error) throw new Error(`Erreur stocks: ${stocksRes.error.message}`);
            if (commandesRes.error) throw new Error(`Erreur commandes: ${commandesRes.error.message}`);
            if (livraisonsRes.error) throw new Error(`Erreur livraisons: ${livraisonsRes.error.message}`);
            if (drsRes.error) throw new Error(`Erreur DRS: ${drsRes.error.message}`);

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
            const drs = (drsRes.data as DRS[]) || [];

            // Calculs métier
            const alertStocks = stocks.filter(s => s.quantite_actuelle <= s.seuil_alerte);

            // Calculer les KPIs nationaux
            const stats: DashboardStats = {
                totalStocks: stocks.length,
                totalCommandes: commandes.length,
                totalLivraisons: livraisons.length,
                alertes: alertStocks.length,
                stockTotalQuantity: stocks.reduce((sum, s) => sum + (s.quantite_actuelle || 0), 0),
                activeUsers: 0 // À implémenter avec une requête vers la table users
            };

            // Performance par région
            // Pour chaque DRS, calculer les stocks et commandes qui lui sont liés
            const regionPerformance: RegionPerformance[] = drs.map(d => {
                // Ici vous pourriez faire un filtre sur stocks si vous avez un lien DRS-entité
                // Pour l'instant, on fait une distribution simple
                const regionStocks = stocks.filter(s => s.entite_id.startsWith(d.id.substring(0, 3))); // Exemple simplifié
                const regionCommandes = commandes.filter(c => c.entite_origine_id.startsWith(d.id.substring(0, 3))); // Exemple simplifié

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

            return {
                stats,
                stocks,
                commandes,
                livraisons,
                drs,
                regionPerformance
            };
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000
    });
}
