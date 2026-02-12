
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INFO',
  lu BOOLEAN NOT NULL DEFAULT false,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Pharmacovigilance: declarations
CREATE TABLE public.declarations_ei (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  statut TEXT NOT NULL DEFAULT 'NOUVELLE',
  gravite TEXT NOT NULL DEFAULT 'NON_GRAVE',
  medicament_id UUID REFERENCES public.medicaments(id),
  lot_id UUID REFERENCES public.lots(id),
  patient_initiales TEXT,
  patient_age INTEGER,
  patient_sexe TEXT,
  description_ei TEXT NOT NULL,
  date_survenue DATE,
  date_declaration DATE DEFAULT CURRENT_DATE,
  actions_prises TEXT,
  evolution TEXT,
  declarant_id UUID REFERENCES auth.users(id),
  entite_id UUID,
  entite_type TEXT,
  commentaire_evaluateur TEXT,
  evaluated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.declarations_ei ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Declarations visible to authenticated" ON public.declarations_ei FOR SELECT USING (true);
CREATE POLICY "Users can create declarations" ON public.declarations_ei FOR INSERT WITH CHECK (auth.uid() = declarant_id);
CREATE POLICY "Admins can manage declarations" ON public.declarations_ei FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can update own draft declarations" ON public.declarations_ei FOR UPDATE USING (auth.uid() = declarant_id AND statut = 'NOUVELLE');

CREATE TRIGGER update_declarations_ei_updated_at BEFORE UPDATE ON public.declarations_ei FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Rappels de lots
CREATE TABLE public.rappels_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES public.lots(id),
  motif TEXT NOT NULL,
  niveau TEXT NOT NULL DEFAULT 'CLASSE_III',
  statut TEXT NOT NULL DEFAULT 'INITIE',
  date_rappel DATE DEFAULT CURRENT_DATE,
  instructions TEXT,
  initie_par UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rappels_lots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rappels visible to authenticated" ON public.rappels_lots FOR SELECT USING (true);
CREATE POLICY "Admins can manage rappels" ON public.rappels_lots FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Users can create rappels" ON public.rappels_lots FOR INSERT WITH CHECK (auth.uid() = initie_par);

CREATE TRIGGER update_rappels_lots_updated_at BEFORE UPDATE ON public.rappels_lots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
