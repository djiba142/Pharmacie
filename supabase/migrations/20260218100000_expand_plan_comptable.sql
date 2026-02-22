-- Expansion du Plan Comptable SYSCOHADA pour LivraMed
-- Ajout de comptes détaillés pour la gestion pharmaceutique et financière

INSERT INTO public.plan_comptable (numero_compte, libelle, type) VALUES
-- Classe 1 : Comptes de ressources durables
('10', 'Capital', 'PASSIF'),
('11', 'Réserves', 'PASSIF'),
('13', 'Résultat net', 'PASSIF'),

-- Classe 2 : Comptes d'actif immobilisé
('24', 'Matériel et outillage', 'ACTIF'),
('241', 'Matériel médical', 'ACTIF'),
('245', 'Matériel de transport (Ambulances/Logistique)', 'ACTIF'),
('248', 'Matériel informatique', 'ACTIF'),

-- Classe 3 : Comptes de stocks (Déjà commencé, on affine)
('312', 'Consommables médicaux', 'ACTIF'),
('313', 'Réactifs de laboratoire', 'ACTIF'),
('38', 'Stocks en cours de route', 'ACTIF'),

-- Classe 4 : Comptes de tiers (Affinement)
('4011', 'Fournisseurs PCG (National)', 'PASSIF'),
('4012', 'Fournisseurs Étrangers', 'PASSIF'),
('4013', 'Fournisseurs Prestations de Services', 'PASSIF'),
('411', 'Clients (Pharmacie Redistribution)', 'ACTIF'),
('42', 'Personnel', 'PASSIF'),
('44', 'État et collectivités publiques', 'PASSIF'),
('443', 'TVA récupérable', 'ACTIF'),
('445', 'TVA collectée', 'PASSIF'),

-- Classe 5 : Comptes de trésorerie (Affinement)
('5111', 'Banque Centrale', 'ACTIF'),
('5112', 'Banques Commerciales', 'ACTIF'),
('52', 'Caisse', 'ACTIF'),
('521', 'Caisse DSP', 'ACTIF'),
('522', 'Caisse Centre de Santé', 'ACTIF'),
('57', 'Mobile Money (Orange/MTN Pay)', 'ACTIF'),

-- Classe 6 : Comptes de charges (Affinement)
('601', 'Achats de médicaments', 'CHARGE'),
('602', 'Achats de consommables', 'CHARGE'),
('61', 'Transports', 'CHARGE'),
('62', 'Services extérieurs', 'CHARGE'),
('66', 'Charges de personnel', 'CHARGE'),

-- Classe 7 : Comptes de produits (Affinement)
('701', 'Ventes de médicaments', 'PRODUIT'),
('702', 'Ventes de consommables', 'PRODUIT'),
('707', 'Prestations de services', 'PRODUIT'),
('71', 'Subventions d''exploitation', 'PRODUIT')

ON CONFLICT (numero_compte) DO UPDATE 
SET libelle = EXCLUDED.libelle, type = EXCLUDED.type;
