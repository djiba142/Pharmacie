
-- DUMMY DATA SEEDING SCRIPT
-- Maximum 17 entries for each case
-- Includes Finance expansions and AI-necessary data

DO $$
DECLARE
    v_admin_id UUID;
    v_drs_id UUID;
    v_dps_id UUID;
    v_structure_id UUID;
    v_medicament_id UUID;
    v_lot_id UUID;
    v_stock_id UUID;
    v_commande_id UUID;
    v_bc_id UUID;
    v_line_bc_id UUID;
    v_br_id UUID;
    v_facture_id UUID;
    v_budget_id UUID;
    v_ao_id UUID;
    v_livraison_id UUID;
    i INTEGER;
    j INTEGER;
BEGIN
    -- 0. Get a User ID (Admin preferably)
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin1@livramed.gn' LIMIT 1;
    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id FROM auth.users LIMIT 1;
    END IF;

    -- 1. DPS (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id INTO v_drs_id FROM public.drs ORDER BY random() LIMIT 1;
        INSERT INTO public.dps (nom, code, prefecture, drs_id, adresse, telephone, email)
        VALUES (
            'DPS ' || i,
            'DPS-' || LPAD(i::text, 3, '0'),
            'Prefecture ' || i,
            v_drs_id,
            'Adresse DPS ' || i,
            '+224 620 00 00 ' || LPAD(i::text, 2, '0'),
            'dps' || i || '@test.gn'
        ) ON CONFLICT (code) DO NOTHING;
    END LOOP;

    -- 2. Structures (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id INTO v_dps_id FROM public.dps ORDER BY random() LIMIT 1;
        INSERT INTO public.structures (nom, code, type, dps_id, adresse, commune, is_active)
        VALUES (
            'Structure Sanitaire ' || i,
            'STR-' || LPAD(i::text, 3, '0'),
            CASE WHEN i % 3 = 0 THEN 'HOPITAL' WHEN i % 3 = 1 THEN 'CS' ELSE 'CLINIQUE' END,
            v_dps_id,
            'Quartier ' || i,
            'Commune ' || ((i%5)+1),
            true
        ) ON CONFLICT (code) DO NOTHING;
    END LOOP;

    -- 3. Medicaments (17 entries)
    FOR i IN 1..17 LOOP
        INSERT INTO public.medicaments (code_national, dci, nom_commercial, forme_pharmaceutique, dosage, conditionnement, classe_therapeutique, prix_unitaire_pcg, is_active)
        VALUES (
            'MED-' || LPAD(i::text, 3, '0'),
            CASE 
                WHEN i=1 THEN 'Paracétamol' WHEN i=2 THEN 'Amoxicilline' WHEN i=3 THEN 'Artéméther' 
                WHEN i=4 THEN 'Ciprofloxacine' WHEN i=5 THEN 'Diazépam' WHEN i=6 THEN 'Furosémide'
                WHEN i=7 THEN 'Ibuprofène' WHEN i=8 THEN 'Métronidazole' WHEN i=9 THEN 'Oméprazole'
                WHEN i=10 THEN 'Salbutamol' WHEN i=11 THEN 'Ceftriaxone' WHEN i=12 THEN 'Diclofénac'
                WHEN i=13 THEN 'Gentamicine' WHEN i=14 THEN 'Oxytocine' WHEN i=15 THEN 'Tramadol'
                WHEN i=16 THEN 'Vitamine C' ELSE 'Insuline' END,
            'Marque ' || i,
            'Comprimé',
            '500mg',
            'Boite de 10',
            CASE WHEN i%2=0 THEN 'Antibiotique' ELSE 'Antalgique' END,
            (random() * 5000 + 500)::DECIMAL(10,2),
            true
        ) ON CONFLICT (code_national) DO NOTHING;
    END LOOP;

    -- 4. Lots (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id INTO v_medicament_id FROM public.medicaments ORDER BY random() LIMIT 1;
        INSERT INTO public.lots (medicament_id, numero_lot, code_barre, date_fabrication, date_peremption, fabricant, quantite_initiale, statut)
        VALUES (
            v_medicament_id,
            'LOT-' || LPAD(i::text, 5, '0'),
            'BAR-' || i || '-' || floor(random()*1000000),
            CURRENT_DATE - INTERVAL '6 months',
            CURRENT_DATE + INTERVAL '18 months',
            'PharmaCorp Inc',
            1000,
            'DISPONIBLE'
        ) ON CONFLICT (numero_lot, medicament_id) DO NOTHING;
    END LOOP;

    -- 5. Stocks (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id INTO v_lot_id FROM public.lots ORDER BY random() LIMIT 1;
        SELECT id INTO v_structure_id FROM public.structures ORDER BY random() LIMIT 1;
        INSERT INTO public.stocks (lot_id, entite_id, entite_type, quantite_actuelle, seuil_alerte)
        VALUES (
            v_lot_id,
            v_structure_id,
            'STRUCTURE',
            floor(random()*500 + 50)::INTEGER,
            20
        ) RETURNING id INTO v_stock_id;

        -- 5b. Mouvements de stock (for AI prediction)
        FOR j IN 1..5 LOOP
            INSERT INTO public.mouvements_stock (stock_id, type, quantite, created_at, effectue_par)
            VALUES (
                v_stock_id,
                'SORTIE',
                floor(random()*10 + 1)::INTEGER,
                CURRENT_TIMESTAMP - (j || ' days')::INTERVAL,
                v_admin_id
            );
        END LOOP;
    END LOOP;

    -- 6. Budgets (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id INTO v_structure_id FROM public.structures ORDER BY random() LIMIT 1;
        INSERT INTO public.budgets (entite_id, entite_type, annee, categorie, montant_alloue, statut)
        VALUES (
            v_structure_id,
            'STRUCTURE',
            2026,
            'MEDICAMENTS_ESSENTIELS',
            (random() * 10000000 + 1000000)::DECIMAL(15,2),
            'ACTIF'
        ) ON CONFLICT (entite_id, entite_type, annee, categorie) DO NOTHING;
    END LOOP;

    -- 7. Commandes (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id INTO v_structure_id FROM public.structures ORDER BY random() LIMIT 1;
        INSERT INTO public.commandes (numero_commande, statut, entite_demandeur_id, entite_demandeur_type, date_commande, priorite, created_by)
        VALUES (
            'CMD-2026-' || LPAD(i::text, 4, '0'),
            CASE WHEN i%4=0 THEN 'LIVREE' WHEN i%4=1 THEN 'VALIDEE' WHEN i%4=2 THEN 'EN_COURS' ELSE 'BROUILLON' END,
            v_structure_id,
            'STRUCTURE',
            CURRENT_TIMESTAMP - (i || ' days')::INTERVAL,
            CASE WHEN i%5=0 THEN 'URGENTE' ELSE 'NORMALE' END,
            v_admin_id
        ) RETURNING id INTO v_commande_id;

        -- Lignes commande
        SELECT id INTO v_medicament_id FROM public.medicaments ORDER BY random() LIMIT 1;
        INSERT INTO public.lignes_commande (commande_id, medicament_id, quantite_demandee)
        VALUES (v_commande_id, v_medicament_id, floor(random()*100 + 10));

        -- 7b. Livraisons for half of commandes
        IF i % 2 = 0 THEN
            INSERT INTO public.livraisons (commande_id, numero_livraison, statut, entite_origine_id, entite_origine_type, entite_destination_id, entite_destination_type, created_by)
            VALUES (
                v_commande_id,
                'LIV-' || LPAD(i::text, 5, '0'),
                'LIVREE',
                 '00000000-0000-0000-0000-000000000000'::UUID, -- PCG
                 'PCG',
                 v_structure_id,
                 'STRUCTURE',
                 v_admin_id
            ) RETURNING id INTO v_livraison_id;
        END IF;
    END LOOP;

    -- 8. Bons de Commande (Finance) (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id, entite_demandeur_id, entite_demandeur_type INTO v_commande_id, v_structure_id, v_medicament_id FROM public.commandes ORDER BY random() LIMIT 1;
        SELECT id INTO v_budget_id FROM public.budgets WHERE entite_id = v_structure_id LIMIT 1;
        
        INSERT INTO public.bons_commande (numero_bc, commande_id, budget_id, demandeur_id, demandeur_type, montant_total, statut, date_bc)
        VALUES (
            'BC-' || LPAD(i::text, 5, '0'),
            v_commande_id,
            v_budget_id,
            v_structure_id,
            'STRUCTURE',
            (random()*500000 + 50000)::DECIMAL(15,2),
            CASE WHEN i%3=0 THEN 'APPROUVE' ELSE 'CREE' END,
            CURRENT_DATE - (i || ' days')::INTERVAL
        ) ON CONFLICT (numero_bc) DO NOTHING RETURNING id INTO v_bc_id;

        -- 8b. Lignes de Bons de Commande
        SELECT id, prix_unitaire_pcg INTO v_medicament_id, i FROM public.medicaments ORDER BY random() LIMIT 1;
        INSERT INTO public.lignes_bc (bc_id, medicament_id, designation, quantite_commandee, prix_unitaire, montant_total)
        VALUES (v_bc_id, v_medicament_id, 'Médoc de test', 100, 1500, 150000)
        RETURNING id INTO v_line_bc_id;

        -- 8c. Bons de Réception (for approved BCs)
        IF i % 3 = 0 THEN
            SELECT id INTO v_livraison_id FROM public.livraisons ORDER BY random() LIMIT 1;
            INSERT INTO public.bons_reception (numero_br, bc_id, livraison_id, entite_id, entite_type, recepteur_id)
            VALUES (
                'BR-' || LPAD(i::text, 5, '0'),
                v_bc_id,
                v_livraison_id,
                v_structure_id,
                'STRUCTURE',
                v_admin_id
            ) RETURNING id INTO v_br_id;

            -- Lignes de BR
            INSERT INTO public.lignes_br (br_id, ligne_bc_id, medicament_id, quantite_commandee, quantite_recue, quantite_acceptee)
            VALUES (v_br_id, v_line_bc_id, v_medicament_id, 100, 100, 100);
        END IF;

    END LOOP;

    -- 9. Factures (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id, bc_id INTO v_br_id, v_bc_id FROM public.bons_reception ORDER BY random() LIMIT 1;
        INSERT INTO public.factures (numero_facture, numero_interne, bc_id, br_id, fournisseur_nom, montant_ht, montant_ttc, date_facture, date_echeance, statut)
        VALUES (
            'FACT-' || i,
            'INT-' || LPAD(i::text, 5, '0'),
            v_bc_id,
            v_br_id,
            'Fournisseur Alpha',
            100000,
            118000,
            CURRENT_DATE - (i || ' days')::INTERVAL,
            CURRENT_DATE + 30,
            CASE WHEN i%2=0 THEN 'PAYEE' ELSE 'VALIDEE' END
        ) ON CONFLICT (numero_interne) DO NOTHING RETURNING id INTO v_facture_id;
    END LOOP;

    -- 10. Paiements (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id INTO v_facture_id FROM public.factures WHERE statut = 'PAYEE' ORDER BY random() LIMIT 1;
        IF v_facture_id IS NOT NULL THEN
            INSERT INTO public.paiements (numero_paiement, facture_id, montant, mode_paiement, statut, date_paiement)
            VALUES (
                'PAY-' || LPAD(i::text, 5, '0'),
                v_facture_id,
                118000,
                'VIREMENT',
                'EXECUTE',
                CURRENT_DATE
            ) ON CONFLICT (numero_paiement) DO NOTHING;
        END IF;
    END LOOP;

    -- 11. Appels d'offres (17 entries)
    FOR i IN 1..17 LOOP
        INSERT INTO public.appels_offres (numero_ao, titre, description, type, entite_id, entite_type, montant_estime, date_cloture, statut)
        VALUES (
            'AO-2026-' || LPAD(i::text, 3, '0'),
            'Appel d''offre pour ' || (CASE WHEN i%2=0 THEN 'Médicaments' ELSE 'Matériel' END),
            'Description détaillée de l''appel d''offre ' || i,
            'NATIONAL',
            '00000000-0000-0000-0000-000000000000'::UUID, -- PCG
            'PCG',
            (random()*50000000)::DECIMAL(15,2),
            CURRENT_DATE + 30,
            'PUBLIE'
        ) ON CONFLICT (numero_ao) DO NOTHING RETURNING id INTO v_ao_id;

        -- 11b. Offres Fournisseurs
        FOR j IN 1..3 LOOP
            INSERT INTO public.offres_fournisseurs (ao_id, fournisseur_nom, montant_propose, delai_livraison_jours, statut)
            VALUES (
                v_ao_id,
                'Labo ' || j,
                (random()*40000000 + 10000000)::DECIMAL(15,2),
                15,
                'RECUE'
            );
        END LOOP;
    END LOOP;

    -- 12. Notifications (17 entries)
    FOR i IN 1..17 LOOP
        IF v_admin_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, titre, message, type, lu)
            VALUES (
                v_admin_id,
                'Notification ' || i,
                'Ceci est un message de test pour la notification ' || i,
                CASE WHEN i%3=0 THEN 'ALERTE' WHEN i%3=1 THEN 'SUCCES' ELSE 'INFO' END,
                false
            );
        END IF;
    END LOOP;

    -- 13. Declarations EI (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id, medicament_id INTO v_lot_id, v_medicament_id FROM public.lots ORDER BY random() LIMIT 1;
        INSERT INTO public.declarations_ei (numero, statut, gravite, medicament_id, lot_id, patient_initiales, description_ei, declarant_id)
        VALUES (
            'EI-' || LPAD(i::text, 5, '0'),
            'NOUVELLE',
            CASE WHEN i%5=0 THEN 'GRAVE' ELSE 'NON_GRAVE' END,
            v_medicament_id,
            v_lot_id,
            'AB',
            'Effet secondaire observé: ' || i,
            v_admin_id
        ) ON CONFLICT (numero) DO NOTHING;
    END LOOP;

    -- 14. Rappels de lots (17 entries)
    FOR i IN 1..17 LOOP
        SELECT id INTO v_lot_id FROM public.lots ORDER BY random() LIMIT 1;
        INSERT INTO public.rappels_lots (lot_id, motif, niveau, statut, initie_par)
        VALUES (
            v_lot_id,
            'Motif de rappel ' || i,
            'CLASSE_I',
            'INITIE',
            v_admin_id
        );
    END LOOP;

END $$;
