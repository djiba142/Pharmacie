import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useUserLevel } from './useUserLevel';

// --- Interfaces pour le typage (à adapter selon votre schéma DB réel) ---
export interface Stock {
    id: string;
    nom: string; // ou lien vers table médicaments
    quantite_actuelle: number;
    seuil_alerte: number;
    date_peremption: string | null;
    prix_unitaire?: number;
    updated_at?: string;
    created_at?: string;
}

export interface Commande {
    id: string;
    numero_commande: string;
    statut: string;
    items: unknown[];
    created_at: string;
    entite_demandeur_id?: string;
}

export interface Livraison {
    id: string;
    created_at: string;
    // ... autres champs
}

export interface Structure {
    id: string;
    nom: string;
    type: string;
    // ... autres champs
}

export interface StructureDataResult {
    structure: Structure | null;
    stocks: Stock[];
    commandes: Commande[];
    livraisons: Livraison[];
    stats: {
        totalStocks: number;
        stocksEnAlerte: number;
        stocksPerimes: number;      // Pour compatibilité dashboard - compte items proches de péremption
        stocksBientotPerimes: number; // Périment dans < 30 jours
        commandesEnAttente: number;
        derniereLivraison: string | null;
        stockValue: number; // Gardé pour la compatibilité avec le dashboard
        stockTotalQuantity: number; // Renommé pour clarté (c'est la somme des quantités)
    };
    alertStocks: Stock[];
    expiringStocks: Stock[];
}

export function useStructureData() {
    const { user } = useAuthStore();
    const { entityId } = useUserLevel();

    return useQuery<StructureDataResult>({
        queryKey: ['structure-dashboard', entityId],
        queryFn: async () => {
            if (!entityId) throw new Error('Entity ID non disponible');

            // 1. Récupérer la structure
            const { data: structure, error: structureError } = await supabase
                .from('structures') // Vérifiez que c'est bien le nom de la table (parfois 'pharmacies' ou 'drs')
                .select('*')
                .eq('id', entityId)
                .single();

            if (structureError) throw new Error(`Erreur structure: ${structureError.message}`);

            // 2. Lancer les requêtes liées en parallèle pour la performance

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
                .eq('entite_id', entityId);

            const commandesQuery = supabase
                .from('commandes')
                .select(`
                    id,
                    numero_commande,
                    statut,
                    created_at,
                    entite_demandeur_id,
                    items:lignes_commande(id)
                `)
                .eq('entite_demandeur_id', entityId)
                .order('created_at', { ascending: false })
                .limit(10) as any;

            const livraisonsQuery = supabase
                .from('livraisons')
                .select('*')
                .eq('entite_destination_id', entityId)
                .order('created_at', { ascending: false })
                .limit(10);

            const [stocksRes, commandesRes, livraisonsRes] = await Promise.all([
                stocksQuery,
                commandesQuery,
                livraisonsQuery
            ]);

            // Gestion des erreurs groupée
            if (stocksRes.error) console.warn('Erreur stocks:', stocksRes.error);
            if (commandesRes.error) console.warn('Erreur commandes:', commandesRes.error);
            if (livraisonsRes.error) console.warn('Erreur livraisons:', livraisonsRes.error);

            interface StockWithLot {
                id: string;
                quantite_actuelle: number;
                seuil_alerte: number;
                entite_id: string;
                created_at: string;
                derniere_maj?: string;
                lot?: {
                    date_peremption: string | null;
                    medicament?: {
                        nom_commercial: string;
                        dci: string;
                    };
                };
            }

            // Transformation des données pour correspondre à l'interface Stock
            const stocks: Stock[] = (stocksRes.data as unknown as StockWithLot[] || []).map((item) => ({
                id: item.id,
                nom: item.lot?.medicament?.nom_commercial || item.lot?.medicament?.dci || 'Médicament inconnu',
                quantite_actuelle: item.quantite_actuelle,
                seuil_alerte: item.seuil_alerte,
                date_peremption: item.lot?.date_peremption || null,
                created_at: item.created_at,
                updated_at: item.derniere_maj
            }));
            const commandes = (commandesRes.data as Commande[]) || [];
            const livraisons = (livraisonsRes.data as Livraison[]) || [];

            // 3. Calculs et logique métier
            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);

            // Filtrage des stocks
            const alertStocks = stocks.filter(s => s.quantite_actuelle <= s.seuil_alerte);

            // Logique de péremption
            // ExpiringStocks = produits qui périment entre maintenant et 60 jours (pour l'affichage liste)
            const expiringStocks = stocks.filter(s => {
                if (!s.date_peremption) return false;
                const peremption = new Date(s.date_peremption);
                // On exclut ce qui est déjà périmé pour cette liste "à surveiller", ou on inclut tout ? 
                // Ici : on prend ce qui n'est pas encore périmé mais proche (< 60 jours)
                return peremption > now && peremption <= new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
            }).sort((a, b) => new Date(a.date_peremption!).getTime() - new Date(b.date_peremption!).getTime());

            // Stats compteurs
            const stocksBientotPerimesCount = stocks.filter(s => {
                if (!s.date_peremption) return false;
                const d = new Date(s.date_peremption);
                return d >= now && d <= thirtyDaysFromNow; // Entre aujourd'hui et +30j
            }).length;

            const stockTotalQuantity = stocks.reduce((sum, s) => sum + (s.quantite_actuelle || 0), 0);

            return {
                structure: structure as Structure,
                stocks,
                commandes,
                livraisons,
                stats: {
                    totalStocks: stocks.length,
                    stocksEnAlerte: alertStocks.length,
                    stocksPerimes: stocksBientotPerimesCount, // Dashboard utilise ce nom pour afficher "Péremption Proche"
                    stocksBientotPerimes: stocksBientotPerimesCount,
                    commandesEnAttente: commandes.filter(c => ['BROUILLON', 'EN_ATTENTE', 'EN_COURS'].includes(c.statut)).length,
                    derniereLivraison: livraisons[0]?.created_at || null,
                    stockValue: stockTotalQuantity, // Pour compatibilité dashboard (était mal nommé)
                    stockTotalQuantity: stockTotalQuantity,
                },
                alertStocks,
                expiringStocks
            };
        },
        // Ne s'exécute que si user et entityId sont présents
        enabled: !!user && !!entityId,
        staleTime: 60 * 1000, // Données considérées fraîches pendant 1 minute
        gcTime: 5 * 60 * 1000 // Garder en cache 5 minutes (remplace cacheTime en v5)
    });
}