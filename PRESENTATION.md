# Football Match Organizer
## Système de Recommandation Intelligent par KNN

---

## 📌 Slide 1 : Page de Titre

**Football Match Organizer**
*Système de Recommandation Intelligent par KNN*

Plateforme de gestion et recommandation de matchs de football

---

## 🎯 Slide 2 : Le Problème

### Défis actuels dans l'organisation de matchs

🔍 **Difficulté à trouver des matchs adaptés**
- Trop de matchs à parcourir manuellement
- Difficile de trouver des matchs correspondant à ses préférences

👤 **Manque de personnalisation**
- Pas de suggestions basées sur l'historique
- Expérience utilisateur générique

⏰ **Temps perdu**
- Navigation inefficace
- Recherche manuelle dans tous les matchs disponibles

---

## 💡 Slide 3 : Notre Solution

### Architecture du Système

**Technologies utilisées:**
- **Frontend**: React, JavaScript, CSS
- **Backend**: FastAPI (Python)
- **Base de données**: PostgreSQL
- **Machine Learning**: scikit-learn, NumPy

**Architecture:**
React (UI) ↔ FastAPI (API) ↔ PostgreSQL (DB)
                          ↕
                     ML Service (KNN)

---

## 🧠 Slide 4 : Algorithme KNN

### K-Nearest Neighbors - Comment ça marche?

**Principe:**
1. Analyse l'historique de participation de l'utilisateur
2. Encode les caractéristiques des matchs
3. Calcule la distance entre matchs candidats et historique
4. Recommande les matchs les plus similaires

**Caractéristiques analysées:**
- 📍 **Ville** - Localisation géographique
- 🏟️ **Stade** - Terrain de jeu
- 👥 **Nombre de joueurs** - Taille du match (5v5, 7v7, etc.)
- ⚽ **Type de match** - Format du jeu

---

## ⚙️ Slide 5 : Fonctionnalités Principales

✅ **Gestion des matchs** (Création, Modification, Suppression)
🔐 **Authentification sécurisée** (JWT, Login/Signup)
👥 **Participation** (Rejoindre/Quitter des matchs)
🔍 **Filtres avancés** (Ville, Prix, Date)
⭐ **Recommandations KNN** (Suggestions personnalisées)
👤 **Profils utilisateurs** (Historique, Infos)

---

## 🎨 Slide 6 : Interface Utilisateur (Démonstration)

### Page des Recommandations

- **Bouton Toggle**: "⭐ Recommandé pour vous"
- **Badges de similarité**: "85% match", "70% match"
- **Explications**: "💡 Recommended: same city, same type"
- **Design**: Cartes interactives avec bordures distinctives

---

## 📊 Slide 7 : Implémentation Technique

### Backend (Python/FastAPI)
- Utilisation de `scikit-learn` pour le modèle `NearestNeighbors`
- Encodage des données catégorielles (Villes, Stades)
- Calcul de distance Euclidienne pour la similarité

### Frontend (React)
- Consommation de l'API REST `/recommendations/`
- Gestion d'état dynamique pour l'affichage
- Expérience utilisateur fluide

---

## 📈 Slide 8 : Données de Test

Pour valider le système, nous avons généré :
- **8 Utilisateurs** de test
- **20 Matchs** répartis sur 5 villes (Tunis, Sfax, Sousse...)
- **Participations aléatoires** pour créer un historique
- Scénarios réels de recommandation

---

## 🚀 Slide 9 : Perspectives d'Amélioration

**Futures fonctionnalités envisagées :**
1. ⭐ **Système de notation** des matchs
2. 💬 **Chat/Messagerie** entre joueurs
3. 📊 **Statistiques avancées** pour les profils
4. 💳 **Paiement en ligne** pour les réservations
5. 🔔 **Notifications** (Email/SMS)

---

## 🎓 Slide 10 : Conclusion

**Football Match Organizer** est une solution complète qui :
- Facilite l'organisation de matchs
- Offre une expérience personnalisée grâce à l'IA
- Repose sur une stack technique moderne et robuste

*Merci de votre attention !*
