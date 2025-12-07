import os

# Dossier racine du projet
root = os.path.dirname(os.path.abspath(__file__))

print("\n📁 Scan complet du projet :", root, "\n")

# Extensions de fichiers à afficher
extensions = (".jsx", ".js", ".css", ".html", ".json", ".md")

for subdir, dirs, files in os.walk(root):
    for filename in files:
        # ignorer node_modules pour éviter 200k fichiers
        if "node_modules" in subdir:
            continue
        
        # ignorer .git
        if ".git" in subdir:
            continue

        # fichiers lisibles
        if filename.lower().endswith(extensions):
            filepath = os.path.join(subdir, filename)

            print("============================================")
            print(f"📄 Fichier : {filepath}")
            print("============================================")

            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    print(f.read())
                    print("\n")
            except Exception as e:
                print(f"❌ Erreur de lecture : {e}")
