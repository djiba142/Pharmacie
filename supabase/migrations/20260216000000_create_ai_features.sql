-- Migration: Fonctionnalités IA Gratuites (Supabase uniquement)
-- Created: 2026-02-16
-- Purpose: Prédictions stock, détection anomalies, recommandations IA

-- ============================================
-- 1. FONCTION: Prédiction Rupture de Stock
-- ============================================

CREATE OR REPLACE FUNCTION predict_stock_rupture(
  p_stock_id UUID
)
RETURNS TABLE (
  jours_avant_rupture INT,
  date_rupture_prevue DATE,
  quantite_a_commander INT,
  urgence TEXT,
  confiance INT
) AS $$
DECLARE
  v_stock RECORD;
  v_conso_moyenne FLOAT;
  v_stock_securite INT;
  v_nb_jours_data INT;
BEGIN
  -- Récupérer stock actuel
  SELECT s.*, m.nom as medicament_nom
  INTO v_stock
  FROM stocks s
  LEFT JOIN medicaments m ON s.medicament_id = m.id
  WHERE s.id = p_stock_id;

  IF v_stock IS NULL THEN
    RETURN;
  END IF;

  -- Calculer consommation moyenne sur 30 derniers jours
  SELECT 
    COALESCE(AVG(quantite), 0),
    COUNT(DISTINCT DATE(created_at))
  INTO v_conso_moyenne, v_nb_jours_data
  FROM mouvements_stock
  WHERE stock_id = p_stock_id
    AND type_mouvement = 'SORTIE'
    AND created_at > NOW() - INTERVAL '30 days';

  -- Si pas assez de données, consommation estimée à 5% du stock/jour
  IF v_conso_moyenne = 0 OR v_nb_jours_data < 7 THEN
    v_conso_moyenne := v_stock.quantite * 0.05;
    confiance := 30;
  ELSE
    confiance := LEAST(95, 50 + (v_nb_jours_data * 1.5)::INT);
  END IF;

  -- Stock de sécurité = 7 jours
  v_stock_securite := CEIL(v_conso_moyenne * 7);

  -- Jours avant rupture
  IF v_conso_moyenne > 0 THEN
    jours_avant_rupture := FLOOR((v_stock.quantite - v_stock_securite) / v_conso_moyenne);
  ELSE
    jours_avant_rupture := 999;
  END IF;
  
  date_rupture_prevue := CURRENT_DATE + jours_avant_rupture;

  -- Quantité recommandée (30 jours + sécurité)
  quantite_a_commander := CEIL(v_conso_moyenne * 30) + v_stock_securite;

  -- Urgence
  IF jours_avant_rupture < 0 THEN
    urgence := 'RUPTURE';
  ELSIF jours_avant_rupture < 7 THEN
    urgence := 'CRITIQUE';
  ELSIF jours_avant_rupture < 14 THEN
    urgence := 'ALERTE';
  ELSE
    urgence := 'OK';
  END IF;

  RETURN QUERY SELECT 
    jours_avant_rupture,
    date_rupture_prevue,
    quantite_a_commander,
    urgence,
    confiance;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 2. VUE: Insights Dashboard Automatiques
-- ============================================

CREATE OR REPLACE VIEW ai_dashboard_insights AS
WITH stock_stats AS (
  SELECT 
    s.entity_id,
    s.entity_type,
    COUNT(*) as total_medicaments,
    COUNT(*) FILTER (WHERE s.quantite < 100) as nb_stocks_faibles,
    COUNT(*) FILTER (WHERE s.date_peremption < NOW() + INTERVAL '60 days') as nb_bientot_perimes,
    SUM(s.quantite * COALESCE(m.prix_unitaire, 0)) as valeur_stock_totale
  FROM stocks s
  LEFT JOIN medicaments m ON s.medicament_id = m.id
  GROUP BY s.entity_id, s.entity_type
),
commande_stats AS (
  SELECT 
    demandeur_entity_id as entity_id,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as commandes_semaine,
    COUNT(*) FILTER (WHERE statut IN ('SOUMISE', 'VALIDEE')) as commandes_en_cours,
    AVG(
      EXTRACT(EPOCH FROM (
        COALESCE(validated_at, NOW()) - created_at
      ))/3600
    ) as delai_moyen_validation_h
  FROM commandes
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY demandeur_entity_id
)
SELECT 
  s.entity_id,
  s.entity_type,
  s.total_medicaments,
  s.nb_stocks_faibles,
  s.nb_bientot_perimes,
  ROUND(s.valeur_stock_totale::numeric, 0) as valeur_stock_totale,
  COALESCE(c.commandes_semaine, 0) as commandes_semaine,
  COALESCE(c.commandes_en_cours, 0) as commandes_en_cours,
  ROUND(COALESCE(c.delai_moyen_validation_h, 0)::numeric, 1) as delai_moyen_validation_h,
  -- Recommandation IA principale
  CASE 
    WHEN s.nb_stocks_faibles > 5 THEN 
      jsonb_build_object(
        'type', 'URGENT',
        'icon', '🚨',
        'titre', 'Stocks critiques détectés',
        'message', s.nb_stocks_faibles || ' médicaments ont un stock inférieur à 100 unités',
        'action', 'VIEW_LOW_STOCKS'
      )
    WHEN s.nb_bientot_perimes > 0 THEN
      jsonb_build_object(
        'type', 'WARNING',
        'icon', '⏰',
        'titre', 'Médicaments bientôt périmés',
        'message', s.nb_bientot_perimes || ' médicaments périment dans moins de 60 jours',
        'action', 'VIEW_EXPIRING'
      )
    WHEN c.delai_moyen_validation_h > 48 THEN
      jsonb_build_object(
        'type', 'INFO',
        'icon', '📊',
        'titre', 'Améliorer délais de validation',
        'message', 'Délai moyen: ' || ROUND(c.delai_moyen_validation_h::numeric, 0) || 'h (objectif: 24h)',
        'action', 'OPTIMIZE_WORKFLOW'
      )
    ELSE
      jsonb_build_object(
        'type', 'SUCCESS',
        'icon', '✅',
        'titre', 'Gestion optimale',
        'message', 'Aucune alerte. Continuez comme ça!',
        'action', null
      )
  END as recommandation_ia
FROM stock_stats s
LEFT JOIN commande_stats c ON s.entity_id = c.entity_id;

-- ============================================
-- 3. FONCTION: Obtenir recommandations IA
-- ============================================

CREATE OR REPLACE FUNCTION get_ai_recommendations(
  p_user_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  type TEXT,
  priorite TEXT,
  icon TEXT,
  titre TEXT,
  message TEXT,
  action_type TEXT,
  action_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Récupérer infos utilisateur
  SELECT 
    p.id,
    p.entity_id,
    p.entity_type,
    ur.role
  INTO v_user
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  WHERE p.id = p_user_id;

  -- Recommandations basées sur stocks faibles
  RETURN QUERY
  SELECT 
    'STOCK_FAIBLE'::TEXT as type,
    CASE 
      WHEN s.quantite < 50 THEN 'URGENT'
      WHEN s.quantite < 100 THEN 'HAUTE'
      ELSE 'NORMALE'
    END::TEXT as priorite,
    '📦'::TEXT as icon,
    ('Stock faible: ' || m.nom)::TEXT as titre,
    ('Seulement ' || s.quantite || ' unités restantes')::TEXT as message,
    'CREATE_COMMANDE'::TEXT as action_type,
    jsonb_build_object(
      'medicament_id', m.id,
      'medicament_nom', m.nom,
      'stock_actuel', s.quantite
    ) as action_data,
    NOW() as created_at
  FROM stocks s
  LEFT JOIN medicaments m ON s.medicament_id = m.id
  WHERE s.entity_id = v_user.entity_id
    AND s.quantite < 100
  ORDER BY s.quantite ASC
  LIMIT p_limit;

  -- TODO: Ajouter d'autres types de recommandations
  
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 4. COMMENTAIRES
-- ============================================

COMMENT ON FUNCTION predict_stock_rupture IS 'Prédit la date de rupture de stock basée sur la consommation historique';
COMMENT ON VIEW ai_dashboard_insights IS 'Insights IA automatiques pour chaque entité avec recommandations';
COMMENT ON FUNCTION get_ai_recommendations IS 'Obtient des recommandations IA personnalisées pour un utilisateur';
