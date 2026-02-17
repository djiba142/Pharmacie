
export interface Budget {
    id: string;
    entite_id: string;
    entite_type: string;
    annee: number;
    categorie: string;
    montant_alloue: number;
    montant_engage: number;
    montant_liquide: number;
    montant_paye: number;
    devise: string;
    statut: 'ACTIF' | 'CLOTURE' | 'ARCHIVE';
    approuve_par?: string;
    date_approbation?: string;
    created_at: string;
    updated_at: string;
}

export interface BonCommandeFinance {
    id: string;
    numero_bc: string;
    commande_id?: string;
    budget_id?: string;
    demandeur_id: string;
    demandeur_type: string;
    fournisseur_id?: string;
    fournisseur_type?: string;
    fournisseur_nom?: string;
    montant_total: number;
    devise: string;
    statut: 'CREE' | 'APPROUVE' | 'ENVOYE' | 'PARTIELLEMENT_RECEPTIONNE' | 'RECEPTIONNE' | 'FACTURE' | 'PAYE' | 'ANNULE';
    date_bc: string;
    date_livraison_prevue?: string;
    approuve_par?: string;
    date_approbation?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Facture {
    id: string;
    numero_facture: string;
    numero_interne: string;
    bc_id?: string;
    fournisseur_nom: string;
    fournisseur_contact?: string;
    montant_ht: number;
    montant_tva: number;
    montant_ttc: number;
    montant_valide?: number;
    devise: string;
    date_facture: string;
    date_reception: string;
    date_echeance: string;
    statut: 'RECUE' | 'EN_VERIFICATION' | 'APPROUVEE' | 'REJETEE' | 'EN_PAIEMENT' | 'PAYEE';
    verifie_par?: string;
    date_verification?: string;
    commentaire_verification?: string;
    approuve_par?: string;
    date_approbation?: string;
    created_at: string;
    updated_at: string;
}

export interface Paiement {
    id: string;
    numero_paiement: string;
    facture_id: string;
    budget_id?: string;
    montant: number;
    devise: string;
    mode_paiement: 'VIREMENT_BANCAIRE' | 'MOBILE_MONEY' | 'CHEQUE' | 'ESPECES';
    reference_paiement?: string;
    date_paiement: string;
    statut: 'EN_ATTENTE' | 'EXECUTE' | 'CONFIRME' | 'REJETE';
    execute_par?: string;
    approuve_par?: string;
    date_execution?: string;
    notes?: string;
    created_at: string;
}

export interface EcritureComptable {
    id: string;
    journal: 'ACHAT' | 'TRESORERIE' | 'STOCKS' | 'AJUSTEMENT';
    libelle: string;
    compte_debit: string;
    compte_credit: string;
    montant: number;
    devise: string;
    reference_type?: 'FACTURE' | 'PAIEMENT' | 'BC' | 'BR';
    reference_id?: string;
    entite_id?: string;
    entite_type?: string;
    exercice_annee: number;
    periode_mois: number;
    created_by?: string;
    created_at: string;
}

export interface PlanComptable {
    id: string;
    numero_compte: string;
    libelle: string;
    type: 'ACTIF' | 'PASSIF' | 'CHARGE' | 'PRODUIT';
    parent_compte?: string;
    is_active: boolean;
}
