
-- ============================================
-- ROLES ENUM AND TABLE
-- ============================================
CREATE TYPE public.app_role AS ENUM (
  'SUPER_ADMIN','ADMIN_CENTRAL','MIN_CABINET','MIN_SG','MIN_IG',
  'DNPM_DIR','DNPM_ADJ','DNPM_CHEF_SECTION',
  'PCG_DIR','PCG_ADJ','PCG_DIR_ACHATS','PCG_DIR_STOCK','PCG_DIR_DISTRIB',
  'ADMIN_DRS','DRS_DIR','DRS_ADJ','DRS_RESP_PHARMA','DRS_LOGISTIQUE','DRS_EPIDEMIO',
  'ADMIN_DPS','DPS_DIR','DPS_ADJ','DPS_RESP_PHARMA','DPS_APPRO','DPS_AGENT',
  'HOP_DIR','HOP_PHARMA','CS_RESP','CS_AGENT','CLIN_DIR','CLIN_PHARMA',
  'PHARM_REDIST','PHARM_RESP',
  'LIVREUR_PCG','LIVREUR_DRS','LIVREUR_DPS','LIVREUR_HOP','LIVREUR_PHARM_REDIST'
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Helper: check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('SUPER_ADMIN','ADMIN_CENTRAL','ADMIN_DRS','ADMIN_DPS')
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.is_admin(auth.uid()));

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  entity_id UUID,
  entity_type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin(auth.uid()));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STRUCTURE HIÉRARCHIQUE
-- ============================================
CREATE TABLE public.drs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  region VARCHAR(100) NOT NULL,
  adresse TEXT,
  telephone VARCHAR(20),
  email VARCHAR(255),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.drs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "DRS visible to authenticated" ON public.drs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage DRS" ON public.drs FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.dps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  prefecture VARCHAR(100) NOT NULL,
  drs_id UUID NOT NULL REFERENCES public.drs(id) ON DELETE CASCADE,
  adresse TEXT,
  telephone VARCHAR(20),
  email VARCHAR(255),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.dps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "DPS visible to authenticated" ON public.dps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage DPS" ON public.dps FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  type VARCHAR(50) NOT NULL,
  dps_id UUID REFERENCES public.dps(id) ON DELETE CASCADE,
  adresse TEXT,
  commune VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  telephone VARCHAR(20),
  email VARCHAR(255),
  nombre_lits INTEGER,
  capacite_stockage_m3 DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  date_ouverture DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Structures visible to authenticated" ON public.structures FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage structures" ON public.structures FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================
-- MÉDICAMENTS ET STOCKS
-- ============================================
CREATE TABLE public.medicaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_national VARCHAR(50) UNIQUE,
  dci VARCHAR(255) NOT NULL,
  nom_commercial VARCHAR(255),
  forme_pharmaceutique VARCHAR(100),
  dosage VARCHAR(100),
  conditionnement VARCHAR(100),
  classe_therapeutique VARCHAR(100),
  categorie VARCHAR(50) DEFAULT 'ESSENTIEL',
  amm_code VARCHAR(100),
  statut_commercialisation VARCHAR(50) DEFAULT 'AUTORISE',
  temperature_stockage_min DECIMAL(5,2),
  temperature_stockage_max DECIMAL(5,2),
  necessite_chaine_froid BOOLEAN DEFAULT false,
  prix_unitaire_pcg DECIMAL(10,2),
  prix_public_indicatif DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.medicaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Medicaments visible to authenticated" ON public.medicaments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage medicaments" ON public.medicaments FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicament_id UUID NOT NULL REFERENCES public.medicaments(id) ON DELETE CASCADE,
  numero_lot VARCHAR(100) NOT NULL,
  code_barre VARCHAR(100) UNIQUE,
  date_fabrication DATE NOT NULL,
  date_peremption DATE NOT NULL,
  fabricant VARCHAR(255),
  pays_origine VARCHAR(100),
  quantite_initiale INTEGER NOT NULL,
  unite_mesure VARCHAR(20) DEFAULT 'unité',
  statut VARCHAR(50) DEFAULT 'DISPONIBLE',
  motif_rappel TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(numero_lot, medicament_id)
);
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lots visible to authenticated" ON public.lots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage lots" ON public.lots FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  entite_id UUID NOT NULL,
  entite_type VARCHAR(50) NOT NULL,
  quantite_actuelle INTEGER NOT NULL DEFAULT 0,
  quantite_reservee INTEGER DEFAULT 0,
  seuil_alerte INTEGER NOT NULL DEFAULT 10,
  seuil_minimal INTEGER NOT NULL DEFAULT 5,
  zone_stockage VARCHAR(100),
  derniere_entree TIMESTAMPTZ,
  derniere_sortie TIMESTAMPTZ,
  derniere_maj TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stocks visible to authenticated" ON public.stocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage stocks" ON public.stocks FOR ALL USING (public.is_admin(auth.uid()));

CREATE TABLE public.mouvements_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES public.stocks(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  quantite INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  effectue_par UUID REFERENCES auth.users(id),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.mouvements_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mouvements visible to authenticated" ON public.mouvements_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage mouvements" ON public.mouvements_stock FOR ALL USING (public.is_admin(auth.uid()));

-- ============================================
-- SEED DATA: 8 DRS regions
-- ============================================
INSERT INTO public.drs (nom, code, region, latitude, longitude) VALUES
  ('DRS Conakry', 'DRS-CNK', 'Conakry', 9.6412, -13.5784),
  ('DRS Kindia', 'DRS-KND', 'Kindia', 10.0560, -12.8620),
  ('DRS Boké', 'DRS-BOK', 'Boké', 10.9400, -14.2900),
  ('DRS Kankan', 'DRS-KNK', 'Kankan', 10.3850, -9.3057),
  ('DRS Faranah', 'DRS-FAR', 'Faranah', 10.0404, -10.7456),
  ('DRS Mamou', 'DRS-MAM', 'Mamou', 10.3756, -12.0861),
  ('DRS Labé', 'DRS-LAB', 'Labé', 11.3183, -12.2860),
  ('DRS N''Zérékoré', 'DRS-NZR', 'N''Zérékoré', 7.7562, -8.8179);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_structures_updated_at BEFORE UPDATE ON public.structures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_medicaments_updated_at BEFORE UPDATE ON public.medicaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
