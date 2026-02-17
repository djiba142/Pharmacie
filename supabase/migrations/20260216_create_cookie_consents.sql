-- Migration: Créer table pour stocker les consentements cookies
-- Date: 2026-02-16

-- Table pour stocker les préférences de cookies des utilisateurs
CREATE TABLE IF NOT EXISTS user_cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{"necessary": true, "performance": false, "functional": false}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par user_id
CREATE INDEX IF NOT EXISTS idx_user_cookie_consents_user_id ON user_cookie_consents(user_id);

-- Index pour recherche par date
CREATE INDEX IF NOT EXISTS idx_user_cookie_consents_created_at ON user_cookie_consents(created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_user_cookie_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_user_cookie_consents_updated_at ON user_cookie_consents;
CREATE TRIGGER trigger_update_user_cookie_consents_updated_at
  BEFORE UPDATE ON user_cookie_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_cookie_consents_updated_at();

-- RLS (Row Level Security)
ALTER TABLE user_cookie_consents ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres consentements
CREATE POLICY "Users can view their own cookie consents"
  ON user_cookie_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent insérer leurs propres consentements
CREATE POLICY "Users can insert their own cookie consents"
  ON user_cookie_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres consentements
CREATE POLICY "Users can update their own cookie consents"
  ON user_cookie_consents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres consentements
CREATE POLICY "Users can delete their own cookie consents"
  ON user_cookie_consents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour obtenir les statistiques de consentement (admin uniquement)
CREATE OR REPLACE FUNCTION get_cookie_consent_stats()
RETURNS TABLE (
  total_users BIGINT,
  performance_accepted BIGINT,
  functional_accepted BIGINT,
  all_accepted BIGINT,
  all_rejected BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE (preferences->>'performance')::boolean = true) as performance_accepted,
    COUNT(*) FILTER (WHERE (preferences->>'functional')::boolean = true) as functional_accepted,
    COUNT(*) FILTER (WHERE 
      (preferences->>'performance')::boolean = true AND 
      (preferences->>'functional')::boolean = true
    ) as all_accepted,
    COUNT(*) FILTER (WHERE 
      (preferences->>'performance')::boolean = false AND 
      (preferences->>'functional')::boolean = false
    ) as all_rejected
  FROM user_cookie_consents;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires
COMMENT ON TABLE user_cookie_consents IS 'Stocke les préférences de cookies des utilisateurs pour conformité RGPD';
COMMENT ON COLUMN user_cookie_consents.preferences IS 'Préférences JSON: {necessary, performance, functional}';
COMMENT ON COLUMN user_cookie_consents.ip_address IS 'Adresse IP lors du consentement (optionnel)';
COMMENT ON COLUMN user_cookie_consents.user_agent IS 'User agent du navigateur';
