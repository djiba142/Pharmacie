
-- Table for registration requests (demandes d'inscription)
CREATE TABLE public.demandes_inscription (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_suivi TEXT NOT NULL UNIQUE,
  type_structure TEXT NOT NULL,
  region TEXT NOT NULL,
  prefecture TEXT NOT NULL,
  nom_structure TEXT NOT NULL,
  adresse TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  telephone TEXT,
  email TEXT,
  responsable_nom TEXT NOT NULL,
  responsable_prenom TEXT NOT NULL,
  responsable_telephone TEXT,
  responsable_email TEXT,
  responsable_num_ordre TEXT,
  statut TEXT NOT NULL DEFAULT 'SOUMISE',
  motif_rejet TEXT,
  validated_by_dps UUID,
  validated_by_drs UUID,
  validated_by_pcg UUID,
  date_validation_dps TIMESTAMPTZ,
  date_validation_drs TIMESTAMPTZ,
  date_validation_pcg TIMESTAMPTZ,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.demandes_inscription ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit registration" ON public.demandes_inscription
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated can view
CREATE POLICY "Authenticated can view registrations" ON public.demandes_inscription
FOR SELECT TO authenticated USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage registrations" ON public.demandes_inscription
FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Admins can update registrations
CREATE POLICY "Admins can update registrations" ON public.demandes_inscription
FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_demandes_inscription_updated_at
BEFORE UPDATE ON public.demandes_inscription
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for registration documents
INSERT INTO storage.buckets (id, name, public) VALUES ('registration-documents', 'registration-documents', false);

CREATE POLICY "Authenticated can upload documents" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'registration-documents');

CREATE POLICY "Authenticated can view documents" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'registration-documents');

CREATE POLICY "Anon can upload registration docs" ON storage.objects
FOR INSERT TO anon WITH CHECK (bucket_id = 'registration-documents');

-- Enable realtime for demandes_inscription
ALTER PUBLICATION supabase_realtime ADD TABLE public.demandes_inscription;
