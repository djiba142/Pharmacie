
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Budget, BonCommandeFinance, Facture, Paiement, EcritureComptable } from "@/types/finance";
import { toast } from "sonner";

export const useFinance = () => {
    const queryClient = useQueryClient();

    // --- Budgets ---
    const useBudgets = (entiteId?: string, annee?: number) => {
        return useQuery({
            queryKey: ["budgets", entiteId, annee],
            queryFn: async () => {
                let query = supabase.from("budgets").select("*");
                if (entiteId) query = query.eq("entite_id", entiteId);
                if (annee) query = query.eq("annee", annee);

                const { data, error } = await query;
                if (error) throw error;
                return data as Budget[];
            },
        });
    };

    const useCreateBudget = () => {
        return useMutation({
            mutationFn: async (budget: any) => {
                const { data, error } = await supabase.from("budgets").insert(budget).select().single();
                if (error) throw error;
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["budgets"] });
                toast.success("Budget créé avec succès");
            },
            onError: (error) => {
                console.error("Erreur creation budget:", error);
                toast.error("Erreur lors de la création du budget");
            },
        });
    };

    // --- Bons de Commande ---
    const useBonsCommande = (entiteId?: string) => {
        return useQuery({
            queryKey: ["bons_commande", entiteId],
            queryFn: async () => {
                let query = supabase.from("bons_commande").select("*, orders:commande_id(*)");
                if (entiteId) query = query.eq("demandeur_id", entiteId);

                const { data, error } = await query;
                if (error) throw error;
                return data as (BonCommandeFinance & { orders: any })[];
            },
        });
    };

    // --- Factures ---
    const useFactures = (fournisseurNom?: string) => {
        return useQuery({
            queryKey: ["factures", fournisseurNom],
            queryFn: async () => {
                let query = supabase.from("factures").select("*");
                if (fournisseurNom) query = query.ilike("fournisseur_nom", `%${fournisseurNom}%`);

                const { data, error } = await query;
                if (error) throw error;
                return data as Facture[];
            },
        });
    };

    // --- Paiements ---
    const usePaiements = (factureId?: string) => {
        return useQuery({
            queryKey: ["paiements", factureId],
            queryFn: async () => {
                let query = supabase.from("paiements").select("*");
                if (factureId) query = query.eq("facture_id", factureId);

                const { data, error } = await query;
                if (error) throw error;
                return data as Paiement[];
            },
        });
    };

    // --- Ecritures Comptables ---
    const useEcritures = (exercice?: number, mois?: number) => {
        return useQuery({
            queryKey: ["ecritures", exercice, mois],
            queryFn: async () => {
                let query = supabase.from("ecritures_comptables").select("*");
                if (exercice) query = query.eq("exercice_annee", exercice);
                if (mois) query = query.eq("periode_mois", mois);

                const { data, error } = await query;
                if (error) throw error;
                return data as EcritureComptable[];
            },
        });
    };

    return {
        useBudgets,
        useCreateBudget,
        useBonsCommande,
        useFactures,
        usePaiements,
        useEcritures
    };
};
