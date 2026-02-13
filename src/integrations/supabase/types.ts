export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      commandes: {
        Row: {
          commentaire: string | null
          created_at: string | null
          created_by: string | null
          date_commande: string
          date_livraison_souhaitee: string | null
          date_validation: string | null
          entite_demandeur_id: string
          entite_demandeur_type: string
          entite_fournisseur_id: string | null
          entite_fournisseur_type: string | null
          id: string
          numero_commande: string
          priorite: string | null
          statut: string
          updated_at: string | null
          validated_by: string | null
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          created_by?: string | null
          date_commande?: string
          date_livraison_souhaitee?: string | null
          date_validation?: string | null
          entite_demandeur_id: string
          entite_demandeur_type: string
          entite_fournisseur_id?: string | null
          entite_fournisseur_type?: string | null
          id?: string
          numero_commande: string
          priorite?: string | null
          statut?: string
          updated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          created_by?: string | null
          date_commande?: string
          date_livraison_souhaitee?: string | null
          date_validation?: string | null
          entite_demandeur_id?: string
          entite_demandeur_type?: string
          entite_fournisseur_id?: string | null
          entite_fournisseur_type?: string | null
          id?: string
          numero_commande?: string
          priorite?: string | null
          statut?: string
          updated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
      declarations_ei: {
        Row: {
          actions_prises: string | null
          commentaire_evaluateur: string | null
          created_at: string | null
          date_declaration: string | null
          date_survenue: string | null
          declarant_id: string | null
          description_ei: string
          entite_id: string | null
          entite_type: string | null
          evaluated_by: string | null
          evolution: string | null
          gravite: string
          id: string
          lot_id: string | null
          medicament_id: string | null
          numero: string
          patient_age: number | null
          patient_initiales: string | null
          patient_sexe: string | null
          statut: string
          updated_at: string | null
        }
        Insert: {
          actions_prises?: string | null
          commentaire_evaluateur?: string | null
          created_at?: string | null
          date_declaration?: string | null
          date_survenue?: string | null
          declarant_id?: string | null
          description_ei: string
          entite_id?: string | null
          entite_type?: string | null
          evaluated_by?: string | null
          evolution?: string | null
          gravite?: string
          id?: string
          lot_id?: string | null
          medicament_id?: string | null
          numero: string
          patient_age?: number | null
          patient_initiales?: string | null
          patient_sexe?: string | null
          statut?: string
          updated_at?: string | null
        }
        Update: {
          actions_prises?: string | null
          commentaire_evaluateur?: string | null
          created_at?: string | null
          date_declaration?: string | null
          date_survenue?: string | null
          declarant_id?: string | null
          description_ei?: string
          entite_id?: string | null
          entite_type?: string | null
          evaluated_by?: string | null
          evolution?: string | null
          gravite?: string
          id?: string
          lot_id?: string | null
          medicament_id?: string | null
          numero?: string
          patient_age?: number | null
          patient_initiales?: string | null
          patient_sexe?: string | null
          statut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "declarations_ei_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "declarations_ei_medicament_id_fkey"
            columns: ["medicament_id"]
            isOneToOne: false
            referencedRelation: "medicaments"
            referencedColumns: ["id"]
          },
        ]
      }
      demandes_inscription: {
        Row: {
          adresse: string | null
          created_at: string | null
          date_validation_dps: string | null
          date_validation_drs: string | null
          date_validation_pcg: string | null
          documents: Json | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          motif_rejet: string | null
          nom_structure: string
          numero_suivi: string
          prefecture: string
          region: string
          responsable_email: string | null
          responsable_nom: string
          responsable_num_ordre: string | null
          responsable_prenom: string
          responsable_telephone: string | null
          statut: string
          telephone: string | null
          type_structure: string
          updated_at: string | null
          validated_by_dps: string | null
          validated_by_drs: string | null
          validated_by_pcg: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string | null
          date_validation_dps?: string | null
          date_validation_drs?: string | null
          date_validation_pcg?: string | null
          documents?: Json | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          motif_rejet?: string | null
          nom_structure: string
          numero_suivi: string
          prefecture: string
          region: string
          responsable_email?: string | null
          responsable_nom: string
          responsable_num_ordre?: string | null
          responsable_prenom: string
          responsable_telephone?: string | null
          statut?: string
          telephone?: string | null
          type_structure: string
          updated_at?: string | null
          validated_by_dps?: string | null
          validated_by_drs?: string | null
          validated_by_pcg?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string | null
          date_validation_dps?: string | null
          date_validation_drs?: string | null
          date_validation_pcg?: string | null
          documents?: Json | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          motif_rejet?: string | null
          nom_structure?: string
          numero_suivi?: string
          prefecture?: string
          region?: string
          responsable_email?: string | null
          responsable_nom?: string
          responsable_num_ordre?: string | null
          responsable_prenom?: string
          responsable_telephone?: string | null
          statut?: string
          telephone?: string | null
          type_structure?: string
          updated_at?: string | null
          validated_by_dps?: string | null
          validated_by_drs?: string | null
          validated_by_pcg?: string | null
        }
        Relationships: []
      }
      dps: {
        Row: {
          adresse: string | null
          code: string
          created_at: string | null
          drs_id: string
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nom: string
          prefecture: string
          telephone: string | null
        }
        Insert: {
          adresse?: string | null
          code: string
          created_at?: string | null
          drs_id: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nom: string
          prefecture: string
          telephone?: string | null
        }
        Update: {
          adresse?: string | null
          code?: string
          created_at?: string | null
          drs_id?: string
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nom?: string
          prefecture?: string
          telephone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dps_drs_id_fkey"
            columns: ["drs_id"]
            isOneToOne: false
            referencedRelation: "drs"
            referencedColumns: ["id"]
          },
        ]
      }
      drs: {
        Row: {
          adresse: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nom: string
          region: string
          telephone: string | null
        }
        Insert: {
          adresse?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nom: string
          region: string
          telephone?: string | null
        }
        Update: {
          adresse?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nom?: string
          region?: string
          telephone?: string | null
        }
        Relationships: []
      }
      lignes_commande: {
        Row: {
          commande_id: string
          created_at: string | null
          id: string
          medicament_id: string
          quantite_approuvee: number | null
          quantite_demandee: number
          quantite_livree: number | null
        }
        Insert: {
          commande_id: string
          created_at?: string | null
          id?: string
          medicament_id: string
          quantite_approuvee?: number | null
          quantite_demandee: number
          quantite_livree?: number | null
        }
        Update: {
          commande_id?: string
          created_at?: string | null
          id?: string
          medicament_id?: string
          quantite_approuvee?: number | null
          quantite_demandee?: number
          quantite_livree?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lignes_commande_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lignes_commande_medicament_id_fkey"
            columns: ["medicament_id"]
            isOneToOne: false
            referencedRelation: "medicaments"
            referencedColumns: ["id"]
          },
        ]
      }
      livraisons: {
        Row: {
          commande_id: string | null
          commentaire: string | null
          created_at: string | null
          created_by: string | null
          date_arrivee_estimee: string | null
          date_arrivee_reelle: string | null
          date_depart: string | null
          entite_destination_id: string
          entite_destination_type: string
          entite_origine_id: string
          entite_origine_type: string
          id: string
          latitude_actuelle: number | null
          livreur_id: string | null
          longitude_actuelle: number | null
          numero_livraison: string
          statut: string
          updated_at: string | null
        }
        Insert: {
          commande_id?: string | null
          commentaire?: string | null
          created_at?: string | null
          created_by?: string | null
          date_arrivee_estimee?: string | null
          date_arrivee_reelle?: string | null
          date_depart?: string | null
          entite_destination_id: string
          entite_destination_type: string
          entite_origine_id: string
          entite_origine_type: string
          id?: string
          latitude_actuelle?: number | null
          livreur_id?: string | null
          longitude_actuelle?: number | null
          numero_livraison: string
          statut?: string
          updated_at?: string | null
        }
        Update: {
          commande_id?: string | null
          commentaire?: string | null
          created_at?: string | null
          created_by?: string | null
          date_arrivee_estimee?: string | null
          date_arrivee_reelle?: string | null
          date_depart?: string | null
          entite_destination_id?: string
          entite_destination_type?: string
          entite_origine_id?: string
          entite_origine_type?: string
          id?: string
          latitude_actuelle?: number | null
          livreur_id?: string | null
          longitude_actuelle?: number | null
          numero_livraison?: string
          statut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "livraisons_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          code_barre: string | null
          created_at: string | null
          date_fabrication: string
          date_peremption: string
          fabricant: string | null
          id: string
          medicament_id: string
          motif_rappel: string | null
          numero_lot: string
          pays_origine: string | null
          quantite_initiale: number
          statut: string | null
          unite_mesure: string | null
        }
        Insert: {
          code_barre?: string | null
          created_at?: string | null
          date_fabrication: string
          date_peremption: string
          fabricant?: string | null
          id?: string
          medicament_id: string
          motif_rappel?: string | null
          numero_lot: string
          pays_origine?: string | null
          quantite_initiale: number
          statut?: string | null
          unite_mesure?: string | null
        }
        Update: {
          code_barre?: string | null
          created_at?: string | null
          date_fabrication?: string
          date_peremption?: string
          fabricant?: string | null
          id?: string
          medicament_id?: string
          motif_rappel?: string | null
          numero_lot?: string
          pays_origine?: string | null
          quantite_initiale?: number
          statut?: string | null
          unite_mesure?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_medicament_id_fkey"
            columns: ["medicament_id"]
            isOneToOne: false
            referencedRelation: "medicaments"
            referencedColumns: ["id"]
          },
        ]
      }
      medicaments: {
        Row: {
          amm_code: string | null
          categorie: string | null
          classe_therapeutique: string | null
          code_national: string | null
          conditionnement: string | null
          created_at: string | null
          dci: string
          dosage: string | null
          forme_pharmaceutique: string | null
          id: string
          is_active: boolean | null
          necessite_chaine_froid: boolean | null
          nom_commercial: string | null
          prix_public_indicatif: number | null
          prix_unitaire_pcg: number | null
          statut_commercialisation: string | null
          temperature_stockage_max: number | null
          temperature_stockage_min: number | null
          updated_at: string | null
        }
        Insert: {
          amm_code?: string | null
          categorie?: string | null
          classe_therapeutique?: string | null
          code_national?: string | null
          conditionnement?: string | null
          created_at?: string | null
          dci: string
          dosage?: string | null
          forme_pharmaceutique?: string | null
          id?: string
          is_active?: boolean | null
          necessite_chaine_froid?: boolean | null
          nom_commercial?: string | null
          prix_public_indicatif?: number | null
          prix_unitaire_pcg?: number | null
          statut_commercialisation?: string | null
          temperature_stockage_max?: number | null
          temperature_stockage_min?: number | null
          updated_at?: string | null
        }
        Update: {
          amm_code?: string | null
          categorie?: string | null
          classe_therapeutique?: string | null
          code_national?: string | null
          conditionnement?: string | null
          created_at?: string | null
          dci?: string
          dosage?: string | null
          forme_pharmaceutique?: string | null
          id?: string
          is_active?: boolean | null
          necessite_chaine_froid?: boolean | null
          nom_commercial?: string | null
          prix_public_indicatif?: number | null
          prix_unitaire_pcg?: number | null
          statut_commercialisation?: string | null
          temperature_stockage_max?: number | null
          temperature_stockage_min?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mouvements_stock: {
        Row: {
          commentaire: string | null
          created_at: string | null
          effectue_par: string | null
          id: string
          quantite: number
          reference_id: string | null
          reference_type: string | null
          stock_id: string
          type: string
        }
        Insert: {
          commentaire?: string | null
          created_at?: string | null
          effectue_par?: string | null
          id?: string
          quantite: number
          reference_id?: string | null
          reference_type?: string | null
          stock_id: string
          type: string
        }
        Update: {
          commentaire?: string | null
          created_at?: string | null
          effectue_par?: string | null
          id?: string
          quantite?: number
          reference_id?: string | null
          reference_type?: string | null
          stock_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "mouvements_stock_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          lu: boolean
          message: string
          reference_id: string | null
          reference_type: string | null
          titre: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lu?: boolean
          message: string
          reference_id?: string | null
          reference_type?: string | null
          titre: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lu?: boolean
          message?: string
          reference_id?: string | null
          reference_type?: string | null
          titre?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          entity_id: string | null
          entity_type: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          entity_id?: string | null
          entity_type?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          entity_id?: string | null
          entity_type?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rappels_lots: {
        Row: {
          created_at: string | null
          date_rappel: string | null
          id: string
          initie_par: string | null
          instructions: string | null
          lot_id: string
          motif: string
          niveau: string
          statut: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_rappel?: string | null
          id?: string
          initie_par?: string | null
          instructions?: string | null
          lot_id: string
          motif: string
          niveau?: string
          statut?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_rappel?: string | null
          id?: string
          initie_par?: string | null
          instructions?: string | null
          lot_id?: string
          motif?: string
          niveau?: string
          statut?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rappels_lots_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      stocks: {
        Row: {
          created_at: string | null
          derniere_entree: string | null
          derniere_maj: string | null
          derniere_sortie: string | null
          entite_id: string
          entite_type: string
          id: string
          lot_id: string
          quantite_actuelle: number
          quantite_reservee: number | null
          seuil_alerte: number
          seuil_minimal: number
          zone_stockage: string | null
        }
        Insert: {
          created_at?: string | null
          derniere_entree?: string | null
          derniere_maj?: string | null
          derniere_sortie?: string | null
          entite_id: string
          entite_type: string
          id?: string
          lot_id: string
          quantite_actuelle?: number
          quantite_reservee?: number | null
          seuil_alerte?: number
          seuil_minimal?: number
          zone_stockage?: string | null
        }
        Update: {
          created_at?: string | null
          derniere_entree?: string | null
          derniere_maj?: string | null
          derniere_sortie?: string | null
          entite_id?: string
          entite_type?: string
          id?: string
          lot_id?: string
          quantite_actuelle?: number
          quantite_reservee?: number | null
          seuil_alerte?: number
          seuil_minimal?: number
          zone_stockage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stocks_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      structures: {
        Row: {
          adresse: string | null
          capacite_stockage_m3: number | null
          code: string | null
          commune: string | null
          created_at: string | null
          date_ouverture: string | null
          dps_id: string | null
          email: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          nom: string
          nombre_lits: number | null
          telephone: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          adresse?: string | null
          capacite_stockage_m3?: number | null
          code?: string | null
          commune?: string | null
          created_at?: string | null
          date_ouverture?: string | null
          dps_id?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          nom: string
          nombre_lits?: number | null
          telephone?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          adresse?: string | null
          capacite_stockage_m3?: number | null
          code?: string | null
          commune?: string | null
          created_at?: string | null
          date_ouverture?: string | null
          dps_id?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          nom?: string
          nombre_lits?: number | null
          telephone?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "structures_dps_id_fkey"
            columns: ["dps_id"]
            isOneToOne: false
            referencedRelation: "dps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "SUPER_ADMIN"
        | "ADMIN_CENTRAL"
        | "MIN_CABINET"
        | "MIN_SG"
        | "MIN_IG"
        | "DNPM_DIR"
        | "DNPM_ADJ"
        | "DNPM_CHEF_SECTION"
        | "PCG_DIR"
        | "PCG_ADJ"
        | "PCG_DIR_ACHATS"
        | "PCG_DIR_STOCK"
        | "PCG_DIR_DISTRIB"
        | "ADMIN_DRS"
        | "DRS_DIR"
        | "DRS_ADJ"
        | "DRS_RESP_PHARMA"
        | "DRS_LOGISTIQUE"
        | "DRS_EPIDEMIO"
        | "ADMIN_DPS"
        | "DPS_DIR"
        | "DPS_ADJ"
        | "DPS_RESP_PHARMA"
        | "DPS_APPRO"
        | "DPS_AGENT"
        | "HOP_DIR"
        | "HOP_PHARMA"
        | "CS_RESP"
        | "CS_AGENT"
        | "CLIN_DIR"
        | "CLIN_PHARMA"
        | "PHARM_REDIST"
        | "PHARM_RESP"
        | "LIVREUR_PCG"
        | "LIVREUR_DRS"
        | "LIVREUR_DPS"
        | "LIVREUR_HOP"
        | "LIVREUR_PHARM_REDIST"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "SUPER_ADMIN",
        "ADMIN_CENTRAL",
        "MIN_CABINET",
        "MIN_SG",
        "MIN_IG",
        "DNPM_DIR",
        "DNPM_ADJ",
        "DNPM_CHEF_SECTION",
        "PCG_DIR",
        "PCG_ADJ",
        "PCG_DIR_ACHATS",
        "PCG_DIR_STOCK",
        "PCG_DIR_DISTRIB",
        "ADMIN_DRS",
        "DRS_DIR",
        "DRS_ADJ",
        "DRS_RESP_PHARMA",
        "DRS_LOGISTIQUE",
        "DRS_EPIDEMIO",
        "ADMIN_DPS",
        "DPS_DIR",
        "DPS_ADJ",
        "DPS_RESP_PHARMA",
        "DPS_APPRO",
        "DPS_AGENT",
        "HOP_DIR",
        "HOP_PHARMA",
        "CS_RESP",
        "CS_AGENT",
        "CLIN_DIR",
        "CLIN_PHARMA",
        "PHARM_REDIST",
        "PHARM_RESP",
        "LIVREUR_PCG",
        "LIVREUR_DRS",
        "LIVREUR_DPS",
        "LIVREUR_HOP",
        "LIVREUR_PHARM_REDIST",
      ],
    },
  },
} as const
