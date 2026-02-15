-- Script pour définir admin1@livramed.gn comme SUPER_ADMIN
-- À exécuter dans le SQL Editor de Supabase

-- 1. Trouver l'ID de l'utilisateur
-- SELECT id, email FROM auth.users WHERE email = 'admin1@livramed.gn';

-- 2. Insérer le rôle SUPER_ADMIN (remplacer 'USER_ID_HERE' par l'ID réel)
-- Si vous obtenez l'erreur "violates row-level security policy", utilisez cette version:

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin1@livramed.gn';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur admin1@livramed.gn non trouvé';
  END IF;
  
  -- Supprimer les anciens rôles (si existants)
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  
  -- Insérer le rôle SUPER_ADMIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'SUPER_ADMIN');
  
  RAISE NOTICE 'Rôle SUPER_ADMIN attribué avec succès à admin1@livramed.gn';
END $$;
