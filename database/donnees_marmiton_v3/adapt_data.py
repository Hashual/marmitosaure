import json
import uuid
import random
import datetime
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AVIS_FILE = os.path.join(BASE_DIR, 'avis.json')
INGREDIENTS_FILE = os.path.join(BASE_DIR, 'ingredients.json')
RECETTES_FILE = os.path.join(BASE_DIR, 'recettes.json')
UTILISATEURS_FILE = os.path.join(BASE_DIR, 'utilisateurs.json')

# Output Files
CASSANDRA_OUT = os.path.join(BASE_DIR, 'cassandra_import.cql')
MONGO_RECETTES_OUT = os.path.join(BASE_DIR, 'edited_recettes.json')
MONGO_USERS_OUT = os.path.join(BASE_DIR, 'mongodb_import_utilisateurs.json')
MONGO_INGREDIENTS_OUT = os.path.join(BASE_DIR, 'mongodb_import_ingredients.json')
REDIS_OUT = os.path.join(BASE_DIR, 'redis_import.txt')

USTENSILES_LIST = [
    {"name": "Fouet", "type": "manuel"},
    {"name": "Spatule", "type": "manuel"},
    {"name": "Couteau de chef", "type": "découpe"},
    {"name": "Planche à découper", "type": "support"},
    {"name": "Casserole", "type": "cuisson"},
    {"name": "Poêle", "type": "cuisson"},
    {"name": "Passoire", "type": "manuel"},
    {"name": "Râpe", "type": "découpe"},
    {"name": "Économe", "type": "découpe"},
    {"name": "Louche", "type": "manuel"},
    {"name": "Presse-agrumes", "type": "manuel"},
    {"name": "Rouleau à pâtisserie", "type": "manuel"},
    {"name": "Moule à tarte", "type": "cuisson"},
    {"name": "Balance de cuisine", "type": "mesure"},
    {"name": "Verre doseur", "type": "mesure"},
    {"name": "Mixeur", "type": "électrique"},
    {"name": "Batteur électrique", "type": "électrique"},
    {"name": "Pince de cuisine", "type": "manuel"},
    {"name": "Ouvre-boîte", "type": "manuel"},
    {"name": "Tire-bouchon", "type": "manuel"}
]

import re

def load_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    # Fix concatenated JSON arrays (e.g. ] [ -> , )
    # This handles cases where multiple JSON arrays are dumped in the same file
    content = re.sub(r'\]\s*\[', ',', content)
    return json.loads(content)

def escape_cql_string(s):
    if s is None:
        return "''"
    return "'" + str(s).replace("'", "''") + "'"

def format_timestamp(ts_str):
    # Simple pass-through, assuming Cassandra accepts ISO format or similar
    # If needed, parse and reformat.
    return f"'{ts_str}'"

def main():
    print("Loading data...")
    avis_data = load_json(AVIS_FILE)
    ingredients_data = load_json(INGREDIENTS_FILE)
    recettes_data = load_json(RECETTES_FILE)
    utilisateurs_data = load_json(UTILISATEURS_FILE)

    # Build Ingredient Type Map
    ingredient_type_map = {}
    for ing in ingredients_data:
        ingredient_type_map[ing['ingredient_id']] = ing.get('type', 'autre')

    print("Enriching recipes with random utensils...")
    for rec in recettes_data:
        # Generate random utensils if missing or empty
        if not rec.get('ustensiles'):
            nb_ustensiles = random.randint(2, 5)
            rec['ustensiles'] = random.sample(USTENSILES_LIST, nb_ustensiles)

    print("Processing Cassandra...")
    with open(CASSANDRA_OUT, 'w', encoding='utf-8') as f:
        # Type Ingredients
        type_ingredients = {}
        for ing in ingredients_data:
            t = ing.get('type', 'autre')
            if t not in type_ingredients:
                type_ingredients[t] = str(uuid.uuid4())
        
        for t_name, t_id in type_ingredients.items():
            f.write(f"INSERT INTO type_ingredients (id_type, nom_type) VALUES ({t_id}, {escape_cql_string(t_name)});\n")

        # Ingredients
        for ing in ingredients_data:
            ing_id = ing['ingredient_id']
            nom = ing['nom']
            t_name = ing.get('type', 'autre')
            t_id = type_ingredients[t_name]
            f.write(f"INSERT INTO Ingredients (ingredient_id, nom_ingredient, type_ingredient) VALUES ({ing_id}, {escape_cql_string(nom)}, {t_id});\n")

        # Utilisateurs
        for user in utilisateurs_data:
            uid = user['utilisateur_id']
            nom = user['nom_utilisateur']
            email = user['email']
            date_insc = user['date_inscription']
            # Password not in source, using dummy
            mdp = "password123" 
            f.write(f"INSERT INTO Utilisateurs (utilisateur_id, nom_utilisateur, mot_de_passe, email, date_inscription) VALUES ({uid}, {escape_cql_string(nom)}, {escape_cql_string(mdp)}, {escape_cql_string(email)}, {format_timestamp(date_insc)});\n")

        # Recettes
        for rec in recettes_data:
            rid = rec['recette_id']
            titre = rec['titre']
            desc = rec['description']
            t_prep = rec['temps_preparation']
            etapes = rec['etapes'] # List of strings
            etapes_cql = "[" + ", ".join([escape_cql_string(e) for e in etapes]) + "]"
            
            # Ustensiles (source has empty list mostly, but let's handle if present)
            # Ustensiles (now pre-calculated objects)
            ustensiles = rec.get('ustensiles', [])
            # Cassandra export still uses 'nom' from the source if we didn't update the source list to use 'name'.
            # Wait, I updated USTENSILES_LIST to use 'name'.
            # But `rec['ustensiles']` is assigned from `random.sample(USTENSILES_LIST...)`.
            # So `u` in `ustensiles` will have 'name'.
            # I need to check if I should update the Cassandra export loop to use 'name' or if I should keep 'nom' for Cassandra?
            # The user said "change les nom des donnée", implying the output keys.
            # If I change USTENSILES_LIST, I change the data in memory.
            # So `u['nom']` will fail if I changed the key to `name` in the list.
            # I should use `u.get('name', u.get('nom'))` or just update the Cassandra part too.
            # Let's assume Cassandra columns stay as is (french) unless told otherwise, but I need to access the right key from the dict.
            # Since I changed USTENSILES_LIST to use "name", I must use "name" here.
            ustensiles_cql = "[" + ", ".join([escape_cql_string(u.get('name', u.get('nom'))) for u in ustensiles]) + "]"
            
            tags = rec.get('tags', [])
            tags_cql = "[" + ", ".join([escape_cql_string(t) for t in tags]) + "]"
            
            origine = rec.get('origine', '')
            auteur_id = rec['auteur']['user_id']
            date_creation = rec['date_scraping']
            
            # Ingredients Map
            # Schema: ingredients LIST<FROZEN<MAP<TEXT, TEXT>>>
            # Source: list of dicts with ingredient_id, quantite, unite, nom...
            # Example target: [{'ingredient_id': '...', 'quantite': '500g'}]
            ings_list_cql = []
            for ing in rec.get('ingredients', []):
                i_id = ing['ingredient_id']
                q = ing['quantite']
                u = ing['unite']
                # Construct map string
                # Note: Cassandra map syntax is {'key': 'value', ...}
                # But here it's a LIST of MAPS.
                # The schema comment says: [{ingredient_id: 1, quantite: "500g"}]
                # Let's try to match that.
                quantite_str = f"{q} {u}".strip()
                ing_map = f"{{'ingredient_id': '{i_id}', 'quantite': '{quantite_str}'}}"
                ings_list_cql.append(ing_map)
            
            ingredients_cql = "[" + ", ".join(ings_list_cql) + "]"

            f.write(f"INSERT INTO Recettes (recette_id, titre, description, temps_preparation, etapes, ustensiles, tags, origine, auteur_id, date_creation, ingredients) VALUES ({rid}, {escape_cql_string(titre)}, {escape_cql_string(desc)}, {escape_cql_string(t_prep)}, {etapes_cql}, {ustensiles_cql}, {tags_cql}, {escape_cql_string(origine)}, {auteur_id}, {format_timestamp(date_creation)}, {ingredients_cql});\n")

        # Avis
        # Source avis.json seems to be the main source, but recettes.json also has them.
        # Let's use avis.json as it likely has all of them flattened.
        for avis in avis_data:
            rid = avis['recette_id']
            uid = avis['user_id']
            comm = avis['commentaire']
            date_pub = avis['date_publication']
            f.write(f"INSERT INTO Avis (recette_id, user_id, commentaire, date_publication) VALUES ({rid}, {uid}, {escape_cql_string(comm)}, {format_timestamp(date_pub)});\n")

    print("Processing MongoDB...")
    # MongoDB - Recettes
    mongo_recettes = []
    for rec in recettes_data:
        m_rec = rec.copy()
        m_rec['_id'] = m_rec.pop('recette_id') # Use recette_id as _id
        
        # Transform ingredients to match schema if needed, or keep as is.
        # Schema example: { "id": 3, "quantite": "500g" }
        # Source: { "ingredient_id": "...", "quantite": "...", ... }
        new_ings = []
        for ing in rec.get('ingredients', []):
            new_ings.append({
                "id": ing['ingredient_id'],
                "quantite": f"{ing['quantite']} {ing['unite']}".strip(),
                "nom": ing['nom'] # Keeping name for easier display in Mongo
            })
        m_rec['ingredients'] = new_ings
        
        # Embed Avis? Schema says yes.
        # We can filter avis_data for this recipe.
        # This might be slow O(N*M). Let's index avis first.
        # Optimization: Build a dict of avis by recette_id
        pass # Will do outside loop
    
    # Index Avis
    avis_by_recette = {}
    for avis in avis_data:
        rid = avis['recette_id']
        if rid not in avis_by_recette:
            avis_by_recette[rid] = []
        avis_by_recette[rid].append({
            "user_id": avis['user_id'],
            "commentaire": avis['commentaire'],
            "date": avis['date_publication'],
            "note": avis['note']
        })

    for rec in recettes_data:
        m_rec = {}
        
        # Enforce strict field order per image
        m_rec['title'] = rec['titre']
        m_rec['description'] = rec['description']
        m_rec['preparation_time'] = rec['temps_preparation'].replace(' min', '').strip()
        m_rec['steps'] = rec['etapes']
        
        # Ingredients
        new_ings = []
        for ing in rec.get('ingredients', []):
            ing_id = ing['ingredient_id']
            new_ing = {
                "quantity": f"{ing['quantite']} {ing['unite']}".strip(),
                "name": ing['nom'],
                "type": ingredient_type_map.get(ing_id, 'autre')
            }
            # if 'unite' in ing and ing['unite']:
            #     new_ing['unit'] = ing['unite']
            new_ings.append(new_ing)
        m_rec['ingredients'] = new_ings
        
        # Ustensiles
        m_rec['utensils'] = rec.get('ustensiles', [])
        
        m_rec['tags'] = rec.get('tags', [])
        m_rec['origin'] = rec.get('origine', '')
        
        # Author ID
        if isinstance(rec.get('auteur'), dict):
             m_rec['author_id'] = rec['auteur'].get('user_id')
        else:
             m_rec['author_id'] = rec.get('auteur')
             
        # Image URL
        m_rec['image_url'] = rec.get('image_url', '')

        # Creation date at the end
        m_rec['creation_date'] = rec['date_scraping']
        
        mongo_recettes.append(m_rec)

    with open(MONGO_RECETTES_OUT, 'w', encoding='utf-8') as f:
        json.dump(mongo_recettes, f, indent=2, ensure_ascii=False)

    # MongoDB - Utilisateurs
    mongo_users = []
    for user in utilisateurs_data:
        m_user = {}
        # m_user['_id'] = user['utilisateur_id'] # Keeping _id as user_id? Or removing? User said remove _id for recipes.
        # Usually _id is required or auto-generated. Let's keep it but maybe rename other fields.
        # If I remove _id, Mongo will generate one.
        # Let's keep the custom ID as _id for users to link with authors?
        # The user didn't say remove _id for users.
        m_user['_id'] = user['utilisateur_id']
        m_user['username'] = user['nom_utilisateur']
        m_user['email'] = user['email']
        m_user['registration_date'] = user['date_inscription']
        m_user['password'] = "hash..."
        mongo_users.append(m_user)

    with open(MONGO_USERS_OUT, 'w', encoding='utf-8') as f:
        json.dump(mongo_users, f, indent=2, ensure_ascii=False)
        
    # MongoDB - Ingredients
    mongo_ingredients = []
    for ing in ingredients_data:
        m_ing = {}
        m_ing['_id'] = ing['ingredient_id']
        m_ing['name'] = ing['nom']
        m_ing['type'] = ing.get('type', 'autre')
        mongo_ingredients.append(m_ing)
        
    with open(MONGO_INGREDIENTS_OUT, 'w', encoding='utf-8') as f:
        json.dump(mongo_ingredients, f, indent=2, ensure_ascii=False)

    print("Processing Redis...")
    with open(REDIS_OUT, 'w', encoding='utf-8') as f:
        for user in utilisateurs_data:
            uid = user['utilisateur_id']
            # Session
            session_data = {
                'user_id': uid,
                'connected': False,
                'last_login': user['date_inscription']
            }
            # Redis SET command
            # Escape quotes in JSON for Redis command line if needed, but here we just write the command
            # SET session:uuid "json"
            f.write(f"SET session:{uid} \"{str(session_data)}\"\n")
            
            # Prefs
            prefs_data = {
                'user_id': uid,
                'theme': 'light',
                'notifications': True
            }
            f.write(f"SET prefs:{uid} \"{str(prefs_data)}\"\n")

    print("Done.")

if __name__ == '__main__':
    main()
