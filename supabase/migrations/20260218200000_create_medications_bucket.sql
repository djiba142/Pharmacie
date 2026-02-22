-- Migration pour créer le bucket medications dans Supabase Storage

-- Créer le bucket pour les images de produits
INSERT INTO storage.buckets (id, name, public)
VALUES ('medications', 'medications', true)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS: Tout le monde peut voir les images (bucket public)
CREATE POLICY "Medication images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'medications');

-- Politique RLS: Les administrateurs peuvent uploader des images
CREATE POLICY "Admins can upload medication images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medications' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN_CENTRAL')
    )
  )
);

-- Politique RLS: Les administrateurs peuvent mettre à jour les images
CREATE POLICY "Admins can update medication images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'medications' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN_CENTRAL')
    )
  )
);

-- Politique RLS: Les administrateurs peuvent supprimer les images
CREATE POLICY "Admins can delete medication images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medications' 
  AND (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN_CENTRAL')
    )
  )
);
