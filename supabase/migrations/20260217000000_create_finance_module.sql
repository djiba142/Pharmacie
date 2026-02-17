
-- ============================================
-- MODULE FINANCIER - LIVRAMED
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update app_role enum
-- Note: In Supabase, you can't easily update an ENUM in a migration without transactional issues.
-- However, we'll try to add the values if they don't exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'DAF_NATIONAL') THEN
        ALTER TYPE public.app_role ADD VALUE 'DAF_NATIONAL';
        ALTER TYPE public.app_role ADD VALUE 'COMPTABLE_NATIONAL';
        ALTER TYPE public.app_role ADD VALUE 'AUDITEUR_INTERNE';
        ALTER TYPE public.app_role ADD VALUE 'TRESORIER_NATIONAL';
        ALTER TYPE public.app_role ADD VALUE 'DAF_DRS';
        ALTER TYPE public.app_role ADD VALUE 'COMPTABLE_DRS';
        ALTER TYPE public.app_role ADD VALUE 'GESTIONNAIRE_DPS';
        ALTER TYPE public.app_role ADD VALUE 'COMPTABLE_DPS';
        ALTER TYPE public.app_role ADD VALUE 'COMPTABLE_HOP';
        ALTER TYPE public.app_role ADD VALUE 'GESTIONNAIRE_CS';
    END IF;
END
$$;

-- Budget annuel par entité et catégorie
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entite_id UUID NOT NULL,
  entite_type VARCHAR(50) NOT NULL,
  annee INTEGER NOT NULL,
  categorie VARCHAR(100) DEFAULT 'MEDICAMENTS_ESSENTIELS',
  
  montant_alloue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  montant_engage DECIMAL(15, 2) DEFAULT 0,
  montant_liquide DECIMAL(15, 2) DEFAULT 0,
  montant_paye DECIMAL(15, 2) DEFAULT 0,
  
  devise VARCHAR(3) DEFAULT 'GNF',
  statut VARCHAR(50) DEFAULT 'ACTIF',
  approuve_par UUID REFERENCES auth.users(id),
  date_approbation TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(entite_id, entite_type, annee, categorie)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Budgets visible to authenticated" ON public.budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Finance managers can manage budgets" ON public.budgets FOR ALL USING (
  public.has_role(auth.uid(), 'DAF_NATIONAL') OR 
  public.has_role(auth.uid(), 'COMPTABLE_NATIONAL') OR 
  public.is_admin(auth.uid())
);

-- Plan comptable
CREATE TABLE IF NOT EXISTS public.plan_comptable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_compte VARCHAR(20) UNIQUE NOT NULL,
  libelle VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'ACTIF', 'PASSIF', 'CHARGE', 'PRODUIT'
  parent_compte VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.plan_comptable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plan comptable visible to authenticated" ON public.plan_comptable FOR SELECT TO authenticated USING (true);

-- Bons de commande (Financier)
CREATE TABLE IF NOT EXISTS public.bons_commande (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_bc VARCHAR(50) UNIQUE NOT NULL,
  commande_id UUID REFERENCES public.commandes(id),
  budget_id UUID REFERENCES public.budgets(id),
  
  demandeur_id UUID NOT NULL,
  demandeur_type VARCHAR(50) NOT NULL,
  fournisseur_id UUID,
  fournisseur_type VARCHAR(50),
  fournisseur_nom VARCHAR(255),
  
  montant_total DECIMAL(15, 2) NOT NULL,
  devise VARCHAR(3) DEFAULT 'GNF',
  
  statut VARCHAR(50) DEFAULT 'CREE',
  date_bc DATE NOT NULL DEFAULT CURRENT_DATE,
  date_livraison_prevue DATE,
  
  approuve_par UUID REFERENCES auth.users(id),
  date_approbation TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bons_commande ENABLE ROW LEVEL SECURITY;
CREATE POLICY "BC visible to authenticated" ON public.bons_commande FOR SELECT TO authenticated USING (true);

-- Factures fournisseurs
CREATE TABLE IF NOT EXISTS public.factures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_facture VARCHAR(100) NOT NULL,
  numero_interne VARCHAR(50) UNIQUE NOT NULL,
  
  bc_id UUID REFERENCES public.bons_commande(id),
  
  fournisseur_nom VARCHAR(255) NOT NULL,
  fournisseur_contact VARCHAR(255),
  
  montant_ht DECIMAL(15, 2) NOT NULL,
  montant_tva DECIMAL(15, 2) DEFAULT 0,
  montant_ttc DECIMAL(15, 2) NOT NULL,
  montant_valide DECIMAL(15, 2),
  devise VARCHAR(3) DEFAULT 'GNF',
  
  date_facture DATE NOT NULL,
  date_reception DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance DATE NOT NULL,
  
  statut VARCHAR(50) DEFAULT 'RECUE',
  
  verifie_par UUID REFERENCES auth.users(id),
  date_verification TIMESTAMPTZ,
  commentaire_verification TEXT,
  
  approuve_par UUID REFERENCES auth.users(id),
  date_approbation TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.factures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Factures visible to authenticated" ON public.factures FOR SELECT TO authenticated USING (true);

-- Paiements
CREATE TABLE IF NOT EXISTS public.paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_paiement VARCHAR(50) UNIQUE NOT NULL,
  facture_id UUID NOT NULL REFERENCES public.factures(id),
  budget_id UUID REFERENCES public.budgets(id),
  
  montant DECIMAL(15, 2) NOT NULL,
  devise VARCHAR(3) DEFAULT 'GNF',
  
  mode_paiement VARCHAR(50) NOT NULL,
  reference_paiement VARCHAR(255),
  
  date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
  statut VARCHAR(50) DEFAULT 'EN_ATTENTE',
  
  execute_par UUID REFERENCES auth.users(id),
  approuve_par UUID REFERENCES auth.users(id),
  date_execution TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paiements visible to authenticated" ON public.paiements FOR SELECT TO authenticated USING (true);

-- Écritures comptables
CREATE TABLE IF NOT EXISTS public.ecritures_comptables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal VARCHAR(50) NOT NULL,
  libelle TEXT NOT NULL,
  
  compte_debit VARCHAR(20) NOT NULL,
  compte_credit VARCHAR(20) NOT NULL,
  montant DECIMAL(15, 2) NOT NULL,
  devise VARCHAR(3) DEFAULT 'GNF',
  
  reference_type VARCHAR(50),
  reference_id UUID,
  
  entite_id UUID,
  entite_type VARCHAR(50),
  
  exercice_annee INTEGER NOT NULL,
  periode_mois INTEGER NOT NULL,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ecritures_comptables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ecritures visible to authenticated" ON public.ecritures_comptables FOR SELECT TO authenticated USING (true);

-- Appels d'offres
CREATE TABLE IF NOT EXISTS public.appels_offres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ao VARCHAR(50) UNIQUE NOT NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  
  entite_id UUID NOT NULL,
  entite_type VARCHAR(50) NOT NULL,
  
  montant_estime DECIMAL(15, 2),
  devise VARCHAR(3) DEFAULT 'GNF',
  
  date_publication TIMESTAMPTZ,
  date_cloture TIMESTAMPTZ NOT NULL,
  date_attribution TIMESTAMPTZ,
  
  statut VARCHAR(50) DEFAULT 'BROUILLON',
  criteres_evaluation JSONB,
  
  gagnant_fournisseur_id UUID,
  montant_attribue DECIMAL(15, 2),
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appels_offres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AO visible to authenticated" ON public.appels_offres FOR SELECT TO authenticated USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bons_commande_updated_at BEFORE UPDATE ON public.bons_commande FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_factures_updated_at BEFORE UPDATE ON public.factures FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Initial Seed: Plan Comptable
INSERT INTO public.plan_comptable (numero_compte, libelle, type) VALUES
('31', 'Stocks médicaments', 'ACTIF'),
('310', 'Médicaments essentiels', 'ACTIF'),
('311', 'Antipaludéens', 'ACTIF'),
('40', 'Fournisseurs', 'PASSIF'),
('401', 'Fournisseurs PCG', 'PASSIF'),
('51', 'Trésorerie', 'ACTIF'),
('511', 'Banque', 'ACTIF'),
('512', 'Mobile Money', 'ACTIF'),
('60', 'Achats médicaments', 'CHARGE'),
('70', 'Dotations / Subventions', 'PRODUIT')
ON CONFLICT (numero_compte) DO NOTHING;
