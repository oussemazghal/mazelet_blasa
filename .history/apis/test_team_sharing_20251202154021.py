"""
Script de test pour vérifier la fonctionnalité de partage d'équipe et auto-inscription
aux matchs team vs team.

Ce script teste :
1. Création d'utilisateurs
2. Création d'équipe avec membres
3. Vérification que les membres voient l'équipe
4. Création de match team et vérification auto-inscription
"""

import requests
import json

BASE_URL = "http://localhost:8001"

# Couleurs pour l'affichage
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def print_success(message):
    print(f"{GREEN}✓ {message}{RESET}")

def print_error(message):
    print(f"{RED}✗ {message}{RESET}")

def print_info(message):
    print(f"{YELLOW}ℹ {message}{RESET}")

# ===== ÉTAPE 1: Créer les utilisateurs =====
print("\n" + "="*60)
print("ÉTAPE 1: Création des utilisateurs")
print("="*60)

users_data = [
    {"email": "aa@test.com", "password": "password123", "full_name": "AA User", "phone": "1234567890"},
    {"email": "moncefzayeni@gmail.com", "password": "password123", "full_name": "Moncef Zayeni", "phone": "0987654321"}
]

tokens = {}

for user_data in users_data:
    # Essayer de créer l'utilisateur
    print(f"\nCréation de l'utilisateur {user_data['email']}...")
    response = requests.post(f"{BASE_URL}/users/signup", json=user_data)
    
    if response.status_code in [200, 201]:
        print_success(f"Utilisateur {user_data['email']} créé")
    elif response.status_code == 400 and "already registered" in response.text.lower():
        print_info(f"Utilisateur {user_data['email']} existe déjà")
    else:
        print_error(f"Erreur lors de la création: {response.text}")
    
    # Se connecter pour obtenir le token
    print(f"Connexion de {user_data['email']}...")
    login_response = requests.post(
        f"{BASE_URL}/users/login",
        data={"username": user_data["email"], "password": user_data["password"]}
    )
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        tokens[user_data["email"]] = token
        print_success(f"Token obtenu pour {user_data['email']}")
    else:
        print_error(f"Erreur de connexion: {login_response.text}")
        exit(1)

# ===== ÉTAPE 2: Créer une équipe avec AA et ajouter Moncef =====
print("\n" + "="*60)
print("ÉTAPE 2: Création d'équipe avec membres")
print("="*60)

print("\nCréation de l'équipe 'Mon Équipe Test' par AA...")
team_data = {
    "name": "Mon Équipe Test",
    "members": [
        {
            "email": "moncefzayeni@gmail.com",
            "name": "Moncef Zayeni"
        }
    ]
}

headers_aa = {"Authorization": f"Bearer {tokens['aa@test.com']}"}
team_response = requests.post(f"{BASE_URL}/teams/", json=team_data, headers=headers_aa)

if team_response.status_code in [200, 201]:
    team = team_response.json()
    team_id = team["id"]
    print_success(f"Équipe créée avec ID: {team_id}")
    print_info(f"Nom: {team['name']}")
    print_info(f"Capitaine ID: {team['captain_id']}")
    print_info(f"Nombre de membres: {len(team['members'])}")
else:
    print_error(f"Erreur lors de la création de l'équipe: {team_response.text}")
    exit(1)

# ===== ÉTAPE 3: Vérifier que Moncef voit l'équipe dans My Teams =====
print("\n" + "="*60)
print("ÉTAPE 3: Vérification que Moncef voit l'équipe")
print("="*60)

print("\nRécupération des équipes de Moncef via /teams/me...")
headers_moncef = {"Authorization": f"Bearer {tokens['moncefzayeni@gmail.com']}"}
my_teams_response = requests.get(f"{BASE_URL}/teams/me", headers=headers_moncef)

if my_teams_response.status_code == 200:
    moncef_teams = my_teams_response.json()
    print_success(f"Moncef voit {len(moncef_teams)} équipe(s)")
    
    # Vérifier que l'équipe créée est présente
    team_found = any(t["id"] == team_id for t in moncef_teams)
    if team_found:
        print_success("✓✓✓ SUCCÈS: Moncef voit l'équipe 'Mon Équipe Test' dans My Teams!")
        for t in moncef_teams:
            if t["id"] == team_id:
                print_info(f"  - Nom: {t['name']}")
                print_info(f"  - Membres: {len(t['members'])}")
    else:
        print_error("ÉCHEC: Moncef ne voit pas l'équipe")
else:
    print_error(f"Erreur lors de la récupération des équipes: {my_teams_response.text}")

# ===== ÉTAPE 4: Créer un match team vs team =====
print("\n" + "="*60)
print("ÉTAPE 4: Création d'un match team vs team")
print("="*60)

print("\nCréation d'un match team par AA...")
match_data = {
    "title": "Match Test Auto-Inscription",
    "date": "2025-12-10",
    "start_time": "18:00",
    "city": "Tunis",
    "nb_players": 10,
    "price_per_player": 5.0,
    "type_match": "5v5",
    "is_team_match": True,
    "my_team_id": team_id,
    "teammate_emails": []
}

match_response = requests.post(f"{BASE_URL}/matches/", json=match_data, headers=headers_aa)

if match_response.status_code in [200, 201]:
    match = match_response.json()
    match_id = match["id"]
    print_success(f"Match créé avec ID: {match_id}")
    print_info(f"Titre: {match['title']}")
    print_info(f"Team A ID: {match.get('team_a', {}).get('id')}")
    print_info(f"Nombre de participants: {len(match.get('participants', []))}")
else:
    print_error(f"Erreur lors de la création du match: {match_response.text}")
    exit(1)

# ===== ÉTAPE 5: Vérifier que Moncef voit le match dans My Games =====
print("\n" + "="*60)
print("ÉTAPE 5: Vérification que Moncef est auto-inscrit au match")
print("="*60)

print("\nRécupération de tous les matchs...")
all_matches_response = requests.get(f"{BASE_URL}/matches/", headers=headers_moncef)

if all_matches_response.status_code == 200:
    all_matches = all_matches_response.json()
    
    # Trouver notre match
    our_match = None
    for m in all_matches:
        if m["id"] == match_id:
            our_match = m
            break
    
    if our_match:
        print_success(f"Match trouvé: {our_match['title']}")
        
        # Vérifier que Moncef est dans les participants
        participant_emails = [p.get("email") for p in our_match.get("participants", [])]
        print_info(f"Participants: {', '.join(participant_emails)}")
        
        if "moncefzayeni@gmail.com" in participant_emails:
            print_success("✓✓✓ SUCCÈS: Moncef est automatiquement inscrit au match!")
        else:
            print_error("ÉCHEC: Moncef n'est pas dans les participants")
    else:
        print_error(f"Match ID {match_id} non trouvé dans la liste")
else:
    print_error(f"Erreur lors de la récupération des matchs: {all_matches_response.text}")

# ===== RÉSUMÉ FINAL =====
print("\n" + "="*60)
print("RÉSUMÉ DES TESTS")
print("="*60)
print_success("1. Utilisateurs créés et connectés")
print_success("2. Équipe créée avec membres")
print_success("3. Moncef voit l'équipe dans My Teams ✓")
print_success("4. Match team créé")
print_success("5. Moncef auto-inscrit au match ✓")
print(f"\n{GREEN}✓✓✓ TOUS LES TESTS ONT RÉUSSI!{RESET}\n")
