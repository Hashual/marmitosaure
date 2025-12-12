import os
import json
import random
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient
from astrapy import DataAPIClient

MONGODB_URI = "mongodb+srv://romaindesmond_db_user:SrH8SuGLoU2Qd4O0@mamiton.arpq4w5.mongodb.net/?appName=Mamiton"
MONGO_DB_NAME = "Marmitosaure"
MONGO_COLLECTION_NAME = "recipes"

ASTRA_TOKEN = "AstraCS:HRWcKnryqRSMrZqHIgpqaZWf:f07bb8c11326362093ab0f53dd374baaecb2fbef72348f52a4fd0013f67a0de8"
ASTRA_ENDPOINT = "https://7c54ee1c-ff64-4897-92f5-4c86a8c9b7ae-us-east-2.apps.astra.datastax.com"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'donnees_marmiton_v3')
USERS_FILE = os.path.join(DATA_DIR, 'utilisateurs.json')

def load_users():
    print(f"Loading users from {USERS_FILE}...")
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            users = json.load(f)
            return [u['utilisateur_id'] for u in users]
    except Exception as e:
        print(f"Error loading users: {e}")
        sys.exit(1)

def fetch_recipes_from_mongo():
    print("Connecting to MongoDB to fetch recipes...")
    try:
        client = MongoClient(MONGODB_URI)
        db = client[MONGO_DB_NAME]
        col = db[MONGO_COLLECTION_NAME]
        
        cursor = col.find({}, {'_id': 1, 'title': 1})
        recipes = []
        for doc in cursor:
            recipes.append({
                'id': str(doc['_id']),
                'title': doc.get('title', 'Recette mystère')
            })
        print(f"Fetched {len(recipes)} recipes from MongoDB.")
        return recipes
    except Exception as e:
        print(f"Error Mongo: {e}")
        sys.exit(1)

def generate_suggestions(users, recipes, count=500):
    print(f"Generating {count} suggestions...")
    suggestions = []
    
    openings = [
        "Alors là,", "Franchement,", "Honnêtement,", "Wouah,", "Perso,", 
        "Bon,", "Pour le coup,", "J'avoue,", "Super découverte,", "Un peu déçu,",
        "Rien à dire,", "Une tuerie,", "Bof,", "Magnifique,", "Au top,"
    ]
    
    subjects = [
        "cette recette de {title}", "ce plat", "le résultat", "la texture", 
        "le goût du {title}", "l'aspect visuel", "la cuisson", "l'odeur", 
        "cette version du {title}", "mon essai", "le mélange des saveurs"
    ]
    
    verbs = [
        "est incroyable", "est parfaite", "manque de sel", "est un peu sec", 
        "est super facile à faire", "a plu à tout le monde", "est à tomber par terre",
        "mérite d'être refait", "est une belle surprise", "ne ressemble pas à la photo",
        "est un peu fade", "est trop sucré", "est bien équilibré", "change de l'ordinaire"
    ]
    
    contexts = [
        "pour le diner.", "avec une salade.", "même sans four.", "pour mes invités.",
        "avec un peu plus de poivre.", "pour les enfants.", "le lendemain.",
        "avec du riz.", "sans ajouter de sucre.", "en suivant la recette à la lettre.",
        "avec ma touche personnelle.", "pour un repas rapide.", "en version allégée."
    ]
    
    questions = [
        "Peut-on remplacer le lait ?", "Quelle cuisson pour un four à chaleur tournante ?",
        "Peut-on le faire la veille ?", "Combien de temps de conservation ?",
        "Est-ce que ça se congèle bien ?", "Quelle variante me conseillez-vous ?",
        "Peut-on mettre moins de beurre ?", "Avec quel vin servir ce {title} ?"
    ]

    start_date = datetime.now() - timedelta(days=365)
    
    for _ in range(count):
        user_id = random.choice(users)
        recipe = random.choice(recipes)
        
        if random.random() < 0.2:
            template = random.choice(questions)
            content = template.format(title=recipe['title'])
        else:
            part1 = random.choice(openings)
            part2 = random.choice(subjects).format(title=recipe['title'])
            part3 = random.choice(verbs)
            part4 = random.choice(contexts)
            
            content = f"{part1} {part2} {part3} {part4}"

        random_days = random.randint(0, 365)
        suggest_date = (start_date + timedelta(days=random_days)).isoformat()
        
        suggestion = {
            "recipe_id": recipe['id'],
            "user_id": user_id,
            "content": content,
            "suggest_date": suggest_date
        }
        suggestions.append(suggestion)
        
    return suggestions

def insert_into_astra(suggestions):
    print("Connecting to Astra DB...")
    client = DataAPIClient(ASTRA_TOKEN)
    db = client.get_database_by_api_endpoint(ASTRA_ENDPOINT)
    
 
    col_name = "suggests"
    
    existing_collections = db.list_collection_names()
    print(f"Existing collections: {existing_collections}")
    
    if col_name not in existing_collections:
        print(f"Collection '{col_name}' not found. Creating it...")
        db.create_collection(col_name)
        print(f"Collection '{col_name}' created.")
    else:
        print(f"Collection '{col_name}' found.")

    collection = db.get_collection(col_name)

    total = len(suggestions)
    batch_size = 20
    for i in range(0, total, batch_size):
        batch = suggestions[i:i+batch_size]
        try:
            collection.insert_many(batch)
            print(f"Inserted {min(i+batch_size, total)}/{total}")
        except Exception as e:
            print(f"Error inserting batch: {e}")

def main():
    users = load_users()
    recipes = fetch_recipes_from_mongo()
    
    if not users or not recipes:
        print("Missing data. Aborting.")
        return
        
    suggestions_data = generate_suggestions(users, recipes, count=3000)
    insert_into_astra(suggestions_data)
    print("Done.")

if __name__ == "__main__":
    main()
