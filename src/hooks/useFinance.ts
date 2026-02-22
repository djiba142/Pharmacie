
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
            mutationFn: async (budget: Omit<Budget, "id" | "created_at" | "updated_at">) => {
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
                let query = supabase.from("bons_commande").select("*");
                if (entiteId) query = query.eq("demandeur_id", entiteId);

                const { data, error } = await query;
                if (error) throw error;
                return data as BonCommandeFinance[];
            },
        });
    };

    const useCreateBonCommande = () => {
        return useMutation({
            mutationFn: async (bc: Omit<BonCommandeFinance, "id" | "created_at" | "updated_at">) => {
                const { data, error } = await supabase.from("bons_commande").insert(bc).select().single();
                if (error) throw error;
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["bons_commande"] });
                toast.success("Bon de commande créé");
            },
        });
    };

    const useValidateBC = () => {
        return useMutation({
            mutationFn: async ({ id, approvedBy }: { id: string; approvedBy: string }) => {
                const { data, error } = await supabase
                    .from("bons_commande")
                    .update({
                        statut: 'APPROUVE',
                        approuve_par: approvedBy,
                        date_approbation: new Date().toISOString()
                    })
                    .eq("id", id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["bons_commande"] });
                toast.success("BC validé avec succès");
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

    const useUpdatePaiementStatut = () => {
        return useMutation({
            mutationFn: async ({ id, statut, executeBy }: { id: string; statut: string; executeBy?: string }) => {
                const updateData: Partial<Record<string, unknown>> = { statut };
                if (executeBy) {
                    updateData.execute_par = executeBy;
                    updateData.date_execution = new Date().toISOString();
                }
                const { data, error } = await supabase
                    .from("paiements")
                    .update(updateData)
                    .eq("id", id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["paiements"] });
                toast.success("Statut du paiement mis à jour");
            },
        });
    };

    const useCreatePaiement = () => {
        return useMutation({
            mutationFn: async (paiement: Omit<Paiement, "id" | "created_at">) => {
                const { data, error } = await supabase.from("paiements").insert(paiement).select().single();
                if (error) throw error;
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["paiements"] });
                toast.success("Virement/Paiement initié avec succès");
            },
        });
    };

    // --- Dashboard Aggregate Stats ---
    const useFinanceStats = () => {
        return useQuery({
            queryKey: ["finance_stats"],
            queryFn: async () => {
                const { data: budgets } = await supabase.from("budgets").select("montant_alloue, montant_engage");
                const { data: paiements } = await supabase.from("paiements").select("montant, statut");
                const { data: recursiveBC } = await supabase.from("bons_commande").select("id").eq("statut", "CREE");

                const totalBudget = budgets?.reduce((acc, b) => acc + (b.montant_alloue || 0), 0) || 0;
                const totalEngage = budgets?.reduce((acc, b) => acc + (b.montant_engage || 0), 0) || 0;
                const pendingValidations = recursiveBC?.length || 0;

                const totalAvailable = paiements?.filter(p => p.statut === 'EXECUTE').reduce((acc, p) => acc + (p.montant || 0), 0) || 0;
                const totalDue = paiements?.filter(p => p.statut === 'EN_ATTENTE').reduce((acc, p) => acc + (p.montant || 0), 0) || 0;

                return {
                    totalBudget,
                    totalEngage,
                    pendingValidations,
                    totalAvailable,
                    totalDue
                };
            }
        });
    };

    const useUpdateFactureStatut = () => {
        return useMutation({
            mutationFn: async ({ id, statut, approvedBy }: { id: string; statut: string; approvedBy: string }) => {
                const { data, error } = await supabase
                    .from("factures")
                    .update({
                        statut,
                        approuve_par: approvedBy,
                        date_approbation: new Date().toISOString()
                    })
                    .eq("id", id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["factures"] });
                toast.success("Statut de la facture mis à jour");
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

    // --- Appels d'Offres ---
    const useAppelsOffres = (statut?: string) => {
        return useQuery({
            queryKey: ["appels_offres", statut],
            queryFn: async () => {
                let query = supabase.from("appels_offres").select("*");
                if (statut) query = query.eq("statut", statut);
                const { data, error } = await query;
                if (error) throw error;
                return data;
            },
        });
    };

    // --- Plan Comptable ---
    const usePlanComptable = () => {
        return useQuery({
            queryKey: ["plan_comptable"],
            queryFn: async () => {
                const { data, error } = await supabase.from("plan_comptable").select("*").order('code');
                if (error) throw error;
                return data;
            },
        });
    };

    return {
        useBudgets,
        useCreateBudget,
        useBonsCommande,
        useCreateBonCommande,
        useValidateBC,
        useFactures,
        usePaiements,
        useCreatePaiement,
        useUpdatePaiementStatut,
        useUpdateFactureStatut,
        useEcritures,
        useAppelsOffres,
        usePlanComptable,
        useFinanceStats
    };
};
