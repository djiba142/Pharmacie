# 🚀 GUIDE D'APPLICATION DE LA MIGRATION AUDIT_LOGS

## ⚠️ ÉTAPE IMPORTANTE AVANT DE TESTER

Avant de pouvoir utiliser le système d'audit, vous devez appliquer la migration à votre base de données Supabase.

## 📋 Instructions Simples

### Méthode 1: Via Dashboard Supabase (Recommandé)

1. **Ouvrez Supabase Dashboard**
   - Allez sur: https://supabase.com/dashboard
   - Connectez-vous et sélectionnez votre projet

2. **Ouvrez l'Éditeur SQL**
   - Menu de gauche → **SQL Editor**
   - Cliquez sur **+ New query**

3. **Copiez le Script**
   - Ouvrez le fichier: `supabase/migrations/20260215223000_create_audit_logs.sql`
   - Sélectionnez TOUT le contenu (Ctrl+A)
   - Copiez (Ctrl+C)

4. **Exécutez**
   - Collez dans l'éditeur SQL Supabase
   - Cliquez sur **RUN** (ou Ctrl+Enter)
   - Attendez la confirmation "Success"

5. **Vérifiez**
   - Menu de gauche → **Table Editor**
   - Cherchez la table `audit_logs`
   - Elle doit être présente avec 12 colonnes

### Méthode 2: Via CLI Supabase (si configuré)

```bash
cd c:\Users\Djiba Kourouma\Desktop\pharmacie\pharmacie
npx supabase db push
```

## ✅ Test de Vérification

Après avoir appliqué la migration :

1. Déconnectez-vous de l'application
2. Reconnectez-vous
3. Allez sur `/audit`
4. Vous devriez voir un log LOGIN avec votre nom complet et votre rôle

## 🐛 En Cas d'Erreur

### Erreur: "relation audit_logs does not exist"
→ La migration n'a pas été appliquée. Suivez les instructions ci-dessus.

### Erreur: "permission denied for table audit_logs"
→ Les politiques RLS ne sont pas créées. Réexécutez le script SQL complet.

### Logs affichent "Utilisateur Inconnu"
→ Vérifiez que votre profil existe dans la table `profiles` avec `first_name` et `last_name`

## 📞 Besoin d'Aide ?

Consultez le fichier walkthrough.md pour plus de détails.
