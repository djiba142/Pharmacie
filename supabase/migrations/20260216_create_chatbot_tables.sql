-- Migration: Tables Chatbot Auto-Apprenant
-- Created: 2026-02-16
-- Purpose: Stocker conversations et feedbacks pour apprentissage IA

-- ============================================
-- 1. TABLE: Conversations du chatbot
-- ============================================

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  feedback INT CHECK (feedback IN (-1, 1)),
  matched_faq_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TABLE: Apprentissage (feedbacks négatifs)
-- ============================================

CREATE TABLE IF NOT EXISTS chatbot_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response_given TEXT,
  feedback INT,
  admin_reviewed BOOLEAN DEFAULT FALSE,
  suggested_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEX pour performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_chatbot_conv_user ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conv_feedback ON chatbot_conversations(feedback);
CREATE INDEX IF NOT EXISTS idx_chatbot_conv_created ON chatbot_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_learning_reviewed ON chatbot_learning(admin_reviewed);
CREATE INDEX IF NOT EXISTS idx_chatbot_learning_created ON chatbot_learning(created_at DESC);

-- ============================================
-- 4. FONCTION: Analyser les feedbacks
-- ============================================

CREATE OR REPLACE FUNCTION analyze_chatbot_feedback()
RETURNS TABLE (
  question TEXT,
  total_asks BIGINT,
  positive_feedback BIGINT,
  negative_feedback BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.question,
    COUNT(*) as total_asks,
    COUNT(*) FILTER (WHERE c.feedback = 1) as positive_feedback,
    COUNT(*) FILTER (WHERE c.feedback = -1) as negative_feedback,
    ROUND(
      (COUNT(*) FILTER (WHERE c.feedback = 1)::NUMERIC / 
       NULLIF(COUNT(*) FILTER (WHERE c.feedback IS NOT NULL), 0) * 100),
      2
    ) as success_rate
  FROM chatbot_conversations c
  WHERE c.feedback IS NOT NULL
  GROUP BY c.question
  ORDER BY total_asks DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 5. FONCTION: Questions sans réponse
-- ============================================

CREATE OR REPLACE FUNCTION get_unanswered_questions(p_limit INT DEFAULT 20)
RETURNS TABLE (
  question TEXT,
  ask_count BIGINT,
  last_asked TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.question,
    COUNT(*) as ask_count,
    MAX(c.created_at) as last_asked
  FROM chatbot_conversations c
  WHERE c.response LIKE '%Je suis désolé%'
    OR c.feedback = -1
  GROUP BY c.question
  ORDER BY ask_count DESC, last_asked DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 6. RLS (Row Level Security)
-- ============================================

ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_learning ENABLE ROW LEVEL SECURITY;

-- Utilisateurs peuvent voir leurs propres conversations
CREATE POLICY "Users can view own conversations"
  ON chatbot_conversations FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Utilisateurs peuvent insérer leurs conversations
CREATE POLICY "Users can insert conversations"
  ON chatbot_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all learning data"
  ON chatbot_learning FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Système peut insérer dans learning
CREATE POLICY "System can insert learning data"
  ON chatbot_learning FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 7. COMMENTAIRES
-- ============================================

COMMENT ON TABLE chatbot_conversations IS 'Stocke toutes les conversations avec le chatbot IA';
COMMENT ON TABLE chatbot_learning IS 'Questions nécessitant amélioration (feedbacks négatifs)';
COMMENT ON FUNCTION analyze_chatbot_feedback IS 'Analyse les taux de satisfaction par question';
COMMENT ON FUNCTION get_unanswered_questions IS 'Retourne les questions sans réponse satisfaisante';
