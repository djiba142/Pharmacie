
-- Commandes table
CREATE TABLE public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_commande TEXT NOT NULL UNIQUE,
  statut TEXT NOT NULL DEFAULT 'BROUILLON',
  entite_demandeur_id UUID NOT NULL,
  entite_demandeur_type TEXT NOT NULL,
  entite_fournisseur_id UUID,
  entite_fournisseur_type TEXT,
  date_commande TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_livraison_souhaitee DATE,
  commentaire TEXT,
  created_by UUID REFERENCES auth.users(id),
  validated_by UUID REFERENCES auth.users(id),
  date_validation TIMESTAMPTZ,
  priorite TEXT DEFAULT 'NORMALE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commandes visible to authenticated" ON public.commandes FOR SELECT USING (true);
CREATE POLICY "Admins can manage commandes" ON public.commandes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert commandes" ON public.commandes FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own draft commandes" ON public.commandes FOR UPDATE USING (auth.uid() = created_by AND statut = 'BROUILLON');

-- Lignes commande
CREATE TABLE public.lignes_commande (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID NOT NULL REFERENCES public.commandes(id) ON DELETE CASCADE,
  medicament_id UUID NOT NULL REFERENCES public.medicaments(id),
  quantite_demandee INTEGER NOT NULL,
  quantite_approuvee INTEGER DEFAULT 0,
  quantite_livree INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lignes_commande ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lignes visible to authenticated" ON public.lignes_commande FOR SELECT USING (true);
CREATE POLICY "Admins can manage lignes" ON public.lignes_commande FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert lignes for own commandes" ON public.lignes_commande FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.commandes WHERE id = commande_id AND created_by = auth.uid())
);

-- Livraisons table
CREATE TABLE public.livraisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID REFERENCES public.commandes(id),
  numero_livraison TEXT NOT NULL UNIQUE,
  statut TEXT NOT NULL DEFAULT 'PREPAREE',
  livreur_id UUID REFERENCES auth.users(id),
  entite_origine_id UUID NOT NULL,
  entite_origine_type TEXT NOT NULL,
  entite_destination_id UUID NOT NULL,
  entite_destination_type TEXT NOT NULL,
  date_depart TIMESTAMPTZ,
  date_arrivee_estimee TIMESTAMPTZ,
  date_arrivee_reelle TIMESTAMPTZ,
  latitude_actuelle NUMERIC,
  longitude_actuelle NUMERIC,
  commentaire TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.livraisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Livraisons visible to authenticated" ON public.livraisons FOR SELECT USING (true);
CREATE POLICY "Admins can manage livraisons" ON public.livraisons FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can insert livraisons" ON public.livraisons FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Livreurs can update their livraisons" ON public.livraisons FOR UPDATE USING (auth.uid() = livreur_id);

-- Triggers for updated_at
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON public.commandes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_livraisons_updated_at BEFORE UPDATE ON public.livraisons FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable realtime for livraisons (GPS tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.livraisons;
