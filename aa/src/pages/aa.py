import os

# Récupère le chemin du dossier où le script est exécuté
folder = os.path.dirname(os.path.abspath(__file__))

print(f"\n📁 Listing du dossier : {folder}\n")

# Parcourt tous les fichiers du dossier
for filename in os.listdir(folder):
    filepath = os.path.join(folder, filename)

    # On ignore ce script lui-même
    if filename == "list_files.py":
        continue

    # Vérifie que c'est un fichier
    if os.path.isfile(filepath):
        print("============================================")
        print(f"📄 Fichier : {filename}")
        print("============================================")

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
                print(content)
                print("\n")
        except Exception as e:
            print(f"❌ Impossible de lire {filename} — {e}")
