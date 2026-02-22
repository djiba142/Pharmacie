-- ============================================
-- MODULE FINANCIER ÉLARGI - LIVRAMED
-- ============================================

-- 1. Lignes de Bons de Commande (missing in initial migration)
CREATE TABLE IF NOT EXISTS public.lignes_bc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bc_id UUID NOT NULL REFERENCES public.bons_commande(id) ON DELETE CASCADE,
  medicament_id UUID REFERENCES public.medicaments(id),
  
  designation VARCHAR(255) NOT NULL, -- Backup if medicament_id is null
  quantite_commandee INTEGER NOT NULL,
  quantite_recue INTEGER DEFAULT 0,
  prix_unitaire DECIMAL(15, 2) NOT NULL,
  montant_total DECIMAL(15, 2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lignes_bc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lignes BC visible to authenticated" ON public.lignes_bc FOR SELECT TO authenticated USING (true);

-- 2. Bons de Réception
CREATE TABLE IF NOT EXISTS public.bons_reception (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_br VARCHAR(50) UNIQUE NOT NULL,
  -- Format : BR-2025-DPS-DBK-0234
  
  bc_id UUID REFERENCES public.bons_commande(id),
  livraison_id UUID REFERENCES public.livraisons(id),
  
  recepteur_id UUID REFERENCES auth.users(id),
  entite_id UUID NOT NULL,
  entite_type VARCHAR(50) NOT NULL,
  
  date_reception TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  statut VARCHAR(50) DEFAULT 'SIGNE', -- BROUILLON, SIGNE, VALIDE
  
  commentaires TEXT,
  signature_url VARCHAR(500),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bons_reception ENABLE ROW LEVEL SECURITY;
CREATE POLICY "BR visible to authenticated" ON public.bons_reception FOR SELECT TO authenticated USING (true);

-- 3. Lignes de Bons de Réception
CREATE TABLE IF NOT EXISTS public.lignes_br (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  br_id UUID NOT NULL REFERENCES public.bons_reception(id) ON DELETE CASCADE,
  ligne_bc_id UUID REFERENCES public.lignes_bc(id),
  medicament_id UUID REFERENCES public.medicaments(id),
  
  designation VARCHAR(255),
  quantite_commandee INTEGER NOT NULL,
  quantite_recue INTEGER NOT NULL,
  quantite_acceptee INTEGER NOT NULL,
  quantite_rejetee INTEGER DEFAULT 0,
  
  motif_rejet TEXT,
  prix_unitaire DECIMAL(15, 2),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lignes_br ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lignes BR visible to authenticated" ON public.lignes_br FOR SELECT TO authenticated USING (true);

-- 4. Update Factures to link to BR
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factures' AND column_name = 'br_id') THEN
        ALTER TABLE public.factures ADD COLUMN br_id UUID REFERENCES public.bons_reception(id);
    END IF;
END
$$;

-- 5. Offres des Fournisseurs
CREATE TABLE IF NOT EXISTS public.offres_fournisseurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ao_id UUID NOT NULL REFERENCES public.appels_offres(id) ON DELETE CASCADE,
  
  fournisseur_nom VARCHAR(255) NOT NULL,
  fournisseur_contact VARCHAR(255),
  fournisseur_email VARCHAR(255),
  
  montant_propose DECIMAL(15, 2) NOT NULL,
  delai_livraison_jours INTEGER,
  validite_offre DATE,
  
  documents_url TEXT[], -- Array of URLs for technical/financial offers
  
  score_qualite DECIMAL(5, 2),
  score_prix DECIMAL(5, 2),
  score_delai DECIMAL(5, 2),
  score_experience DECIMAL(5, 2),
  score_total DECIMAL(5, 2),
  
  statut VARCHAR(50) DEFAULT 'RECUE', -- RECUE, EN_EVALUATION, SELECTIONNEE, REJETEE
  
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.offres_fournisseurs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Offres visible to authenticated" ON public.offres_fournisseurs FOR SELECT TO authenticated USING (true);

-- 6. Indices for Performance
CREATE INDEX IF NOT EXISTS idx_lignes_bc_bc_id ON public.lignes_bc(bc_id);
CREATE INDEX IF NOT EXISTS idx_bons_reception_bc_id ON public.bons_reception(bc_id);
CREATE INDEX IF NOT EXISTS idx_lignes_br_br_id ON public.lignes_br(br_id);
CREATE INDEX IF NOT EXISTS idx_offres_ao_id ON public.offres_fournisseurs(ao_id);

-- 7. Triggers for updated_at on new tables (if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
        -- Add updated_at column to BR if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bons_reception' AND column_name = 'updated_at') THEN
            ALTER TABLE public.bons_reception ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
        END IF;
        
        DROP TRIGGER IF EXISTS update_bons_reception_updated_at ON public.bons_reception;
        CREATE TRIGGER update_bons_reception_updated_at BEFORE UPDATE ON public.bons_reception FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    END IF;
END
$$;
