-- Migration pour créer le bucket avatars dans Supabase Storage

-- Créer le bucket pour les avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS: Tout le monde peut voir les avatars (bucket public)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Politique RLS: Les utilisateurs peuvent uploader leur propre avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS: Les utilisateurs peuvent mettre à jour leur propre avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS: Les utilisateurs peuvent supprimer leur propre avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
