# 🗄️ Guide de Configuration de la Base de Données PostgreSQL

Ce guide vous explique comment créer et initialiser la base de données PostgreSQL pour la plateforme **Mazelet Blasa**.

## 📋 Prérequis

- PostgreSQL installé et en cours d'exécution
- Base de données `football` créée
- Identifiants de connexion configurés dans `app/database.py`

## 🚀 Méthode 1: Script SQL (Recommandé pour débutants)

### Étape 1: Se connecter à PostgreSQL

```bash
psql -U postgres -h localhost -p 4443
```

### Étape 2: Créer la base de données (si elle n'existe pas)

```sql
CREATE DATABASE football;
```

### Étape 3: Se connecter à la base de données

```sql
\c football
```

### Étape 4: Exécuter le script SQL

```bash
psql -U postgres -h localhost -p 4443 -d football -f create_tables.sql
```

Ou depuis psql:

```sql
\i create_tables.sql
```

## 🐍 Méthode 2: Script Python (Recommandé pour développeurs)

### Avantages
- Synchronisation automatique avec les modèles SQLAlchemy
- Pas besoin de maintenir manuellement le SQL
- Gestion des migrations plus facile

### Exécution

```bash
cd apis
python init_db.py
```

## 📊 Structure de la Base de Données

### Tables Créées

1. **users** - Informations des utilisateurs
   - id, email, hashed_password, full_name, phone, image_url, age

2. **teams** - Équipes de football
   - id, name, captain_id

3. **team_members** - Membres des équipes
   - id, team_id, user_id, name

4. **matches** - Matchs organisés
   - id, title, description, type_match, city, stadium, date, start_time, end_time
   - nb_players, price_per_player, organizer_phone, min_age, max_age
   - organizer_id, is_team_match, team_a_id, team_b_id

5. **match_participants** - Participants aux matchs (table d'association)
   - user_id, match_id

6. **feedbacks** - Feedbacks des utilisateurs
   - id, name, email, message, user_id, match_id

## 🔍 Vérification

Pour vérifier que les tables ont été créées:

```sql
-- Lister toutes les tables
\dt

-- Voir la structure d'une table
\d users
\d matches
\d teams
```

## 🔄 Réinitialiser la Base de Données

Si vous voulez tout supprimer et recommencer:

```sql
-- Supprimer toutes les tables
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS match_participants CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Puis réexécutez le script de création.

## ⚙️ Configuration de Connexion

La configuration actuelle dans `database.py`:

```python
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:oussema55@localhost:4443/football"
```

- **Utilisateur**: postgres
- **Mot de passe**: oussema55
- **Hôte**: localhost
- **Port**: 4443
- **Base de données**: football

## 📝 Notes Importantes

- Tous les indices sont créés automatiquement pour optimiser les performances
- Les contraintes de clés étrangères sont en place pour maintenir l'intégrité référentielle
- Les suppressions en cascade sont configurées pour les relations appropriées
- Le script utilise `IF NOT EXISTS` pour éviter les erreurs si les tables existent déjà

## 🆘 Dépannage

### Erreur: "database does not exist"
```sql
CREATE DATABASE football;
```

### Erreur: "role does not exist"
```sql
CREATE USER postgres WITH PASSWORD 'oussema55';
ALTER USER postgres CREATEDB;
```

### Erreur de connexion
Vérifiez que PostgreSQL est en cours d'exécution sur le port 4443:
```bash
netstat -an | findstr 4443
```
