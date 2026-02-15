-- Migration pour définir admin1@livramed.gn comme SUPER_ADMIN
-- Cette migration s'exécute avec les privilèges nécessaires pour contourner RLS

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur admin1@livramed.gn
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'admin1@livramed.gn';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Utilisateur admin1@livramed.gn non trouvé - migration ignorée';
  ELSE
    -- Supprimer les anciens rôles de cet utilisateur
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Insérer le rôle SUPER_ADMIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'SUPER_ADMIN')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Rôle SUPER_ADMIN attribué avec succès à admin1@livramed.gn (ID: %)', v_user_id;
  END IF;
END $$;
