-- Migration pour ajouter la colonne image_url à la table medicaments

ALTER TABLE public.medicaments
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.medicaments.image_url IS 'URL de l''image du produit stockée dans Supabase Storage ou externe';
