# Football Match Organizer

Une plateforme complète pour gérer et organiser des matchs de football, enrichie par un système de recommandation intelligent basé sur le Machine Learning (KNN).

## 🚀 À propos du projet

Ce projet a pour but de simplifier l'organisation de matchs de football amateur en permettant aux utilisateurs de trouver facilement des matchs correspondant à leurs préférences (ville, type de terrain, niveau, etc.).

### Fonctionnalités Clés
- **Gestion des matchs** : Création, modification et suppression de matchs.
- **Participation** : Possibilité de rejoindre ou quitter des matchs.
- **Authentification** : Système complet de Login/Signup sécurisé.
- **Recherche avancée** : Filtres par ville, prix, date, etc.
- **Recommandations Intelligentes (IA)** : Suggestions personnalisées basées sur l'algorithme K-Nearest Neighbors (KNN).
- **Profil Utilisateur** : Historique des matchs et informations personnelles.

## 🛠 Technologies Utilisées

### Backend
- **FastAPI** (Python) : Framework API haute performance.
- **PostgreSQL** : Base de données relationnelle.
- **SQLAlchemy** : ORM pour la gestion de la base de données.
- **Scikit-learn** : Librairie de Machine Learning pour le système de recommandation KNN.
- **Pydantic** : Validation des données.

### Frontend
- **React** : Bibliothèque UI JavaScript.
- **Vite** : Outil de build rapide.
- **CSS / Tailwind** : Pour le stylisme et le design réactif.

## 📦 Installation et Lancement

### Prérequis
- Python 3.8+
- Node.js 16+
- PostgreSQL installé et configuré

### 1. Configuration du Backend (API)

Naviguez vers le dossier `apis` :
```bash
cd apis
```

Installez les dépendances Python :
```bash
pip install -r requirements.txt
```

Initialisez la base de données (assurez-vous que PostgreSQL est lancé et vos variables d'environnement sont configurées, par exemple dans un fichier `.env` ou directement) :
```bash
python init_db.py
```

Lancez le serveur API :
```bash
uvicorn app.main:app --reload
```
L'API sera accessible sur `http://localhost:8000` (et la doc interactive sur `/docs`).

### 2. Configuration du Frontend

Naviguez vers le dossier `aa` :
```bash
cd aa
```

Installez les dépendances Node.js :
```bash
npm install
```

Lancez l'application en mode développement :
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173` (ou le port indiqué par Vite).

## 🧠 Architecture du Système de Recommandation (KNN)

Le système utilise l'algorithme K-Nearest Neighbors pour recommander des matchs. Il analyse :
1. L'historique de l'utilisateur.
2. Les caractéristiques des matchs (Ville, Stade, Format 5v5/7v7, etc.).
3. Calcule la distance (euclidienne) pour trouver les matchs les plus similaires aux préférences de l'utilisateur.

---
*Ce projet a été développé dans le cadre d'un projet académique/personnel.*
