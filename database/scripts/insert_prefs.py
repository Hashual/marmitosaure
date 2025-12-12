import os
import json
import random
import sys
from astrapy import DataAPIClient


ASTRA_TOKEN = "AstraCS:HRWcKnryqRSMrZqHIgpqaZWf:f07bb8c11326362093ab0f53dd374baaecb2fbef72348f52a4fd0013f67a0de8"
ASTRA_ENDPOINT = "https://7c54ee1c-ff64-4897-92f5-4c86a8c9b7ae-us-east-2.apps.astra.datastax.com"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'donnees_marmiton_v3')
RECIPES_FILE = os.path.join(DATA_DIR, 'edited_recettes.json')


ALLERGENS_LIST = [
    "gluten", "lactose", "oeufs", "arachides", "fruits à coque", "soja",
    "crustacés", "poisson", "céleri", "moutarde", "sésame", "sulfites",
    "lupin", "mollusques", "maïs", "lait"
]

DIETS_LIST = [
    "végétarien", "vegan", "sans gluten", "sans lactose", "cétogène",
    "méditerranéen", "paléo", "hypocalorique", "hyperprotéiné", "flexitarien",
    "pescétarien", "crudivore", "bio", "locavore", "sans sucre ajouté"
]

RECIPE_TYPES = [
    "Plat principal", "Dessert", "Entrée", "Boisson", "Accompagnement",
    "Apéritif", "Sauce", "Petit-déjeuner", "Goûter", "Brunch"
]


def get_astra_client():
    """Initialize and return Astra DB client."""
    print("Connecting to Astra DB...")
    client = DataAPIClient(ASTRA_TOKEN)
    db = client.get_database_by_api_endpoint(ASTRA_ENDPOINT)
    return db


def fetch_users_from_cassandra(db):
    """Fetch user IDs from the Users table in Cassandra/Astra DB."""
    print("Fetching user IDs from Users table in Cassandra...")
    
    try:
        users_collection = db.get_collection("users")
        
        cursor = users_collection.find({}, projection={"_id": 1})
        user_ids = []
        
        for doc in cursor:
            user_ids.append(str(doc['_id']))
        
        print(f"Fetched {len(user_ids)} user IDs from Cassandra.")
        return user_ids
        
    except Exception as e:
        print(f"Error fetching users from Cassandra: {e}")
        print("Attempting alternative collection name 'Users'...")
        
        try:
            users_collection = db.get_collection("Users")
            cursor = users_collection.find({}, projection={"_id": 1})
            user_ids = [str(doc['_id']) for doc in cursor]
            print(f"Fetched {len(user_ids)} user IDs from Cassandra (Users collection).")
            return user_ids
        except Exception as e2:
            print(f"Error with 'Users' collection: {e2}")
            
            
            print("Available collections:")
            for col_name in db.list_collection_names():
                print(f"  - {col_name}")
            
            sys.exit(1)


def load_recipes_data():
    """Load recipes from edited_recettes.json to extract tags and ingredients."""
    print(f"Loading recipes from {RECIPES_FILE}...")
    try:
        with open(RECIPES_FILE, 'r', encoding='utf-8') as f:
            recipes = json.load(f)
            print(f"Loaded {len(recipes)} recipes.")
            return recipes
    except Exception as e:
        print(f"Error loading recipes: {e}")
        sys.exit(1)


def extract_unique_tags(recipes):
    """Extract unique tags from recipes."""
    all_tags = set()
    for recipe in recipes:
        tags = recipe.get('tags', [])
        for tag in tags:
            if tag and len(tag) > 1 and tag != "recettes" and tag != "recettes de cuisine":
                all_tags.add(tag.strip())
    
    tag_list = list(all_tags)
    print(f"Extracted {len(tag_list)} unique tags.")
    return tag_list


def extract_unique_ingredients(recipes):
    """Extract unique ingredients (name, type) from recipes."""
    ingredients_set = set()
    for recipe in recipes:
        ingredients = recipe.get('ingredients', [])
        for ing in ingredients:
            name = ing.get('name', '').strip()
            ing_type = ing.get('type', 'autre').strip()
            if name and len(name) > 1:
                ingredients_set.add((name, ing_type))
    
    ingredients_list = list(ingredients_set)
    print(f"Extracted {len(ingredients_list)} unique ingredients.")
    return ingredients_list


def generate_prefs(user_ids, all_tags, all_ingredients, count=5000):
    """Generate 5000 preference records with random combinations."""
    print(f"Generating {count} preference records...")
    
    prefs = []
    
    for i in range(count):
        user_id = random.choice(user_ids)
        
        num_tags = random.randint(2, 6)
        selected_tags = random.sample(all_tags, min(num_tags, len(all_tags)))
        
        num_allergens = random.randint(0, 4)
        selected_allergens = random.sample(ALLERGENS_LIST, num_allergens)
        
        num_types = random.randint(1, 3)
        selected_recipe_types = random.sample(RECIPE_TYPES, num_types)
        
        num_ingredients = random.randint(3, 8)
        selected_ingredients_tuples = random.sample(all_ingredients, min(num_ingredients, len(all_ingredients)))
        selected_ingredients = [{"name": name, "type": ing_type} for name, ing_type in selected_ingredients_tuples]
        
        num_diets = random.randint(0, 3)
        selected_diets = random.sample(DIETS_LIST, num_diets)
        
        pref = {
            "user_id": user_id,
            "tags": selected_tags,
            "allergens": selected_allergens,
            "recipe_type": selected_recipe_types,
            "ingredients": selected_ingredients,
            "diets": selected_diets
        }
        prefs.append(pref)
        
        if (i + 1) % 1000 == 0:
            print(f"Generated {i + 1}/{count} preferences...")
    
    print(f"Generated {len(prefs)} preference records.")
    return prefs


def insert_prefs_into_astra(db, prefs):
    """Insert preference records into Astra DB."""
    col_name = "prefs"
    
    existing_collections = db.list_collection_names()
    print(f"Existing collections: {existing_collections}")
    
    if col_name not in existing_collections:
        print(f"Collection '{col_name}' not found. Creating it...")
        db.create_collection(col_name)
        print(f"Collection '{col_name}' created.")
    else:
        print(f"Collection '{col_name}' found.")
    
    collection = db.get_collection(col_name)
    
    total = len(prefs)
    batch_size = 20
    
    for i in range(0, total, batch_size):
        batch = prefs[i:i+batch_size]
        try:
            collection.insert_many(batch)
            if (i + batch_size) % 500 == 0 or i + batch_size >= total:
                print(f"Inserted {min(i+batch_size, total)}/{total}")
        except Exception as e:
            print(f"Error inserting batch at {i}: {e}")


def main():
    db = get_astra_client()
    
    user_ids = fetch_users_from_cassandra(db)
    
    if not user_ids:
        print("No users found. Aborting.")
        return
    
    recipes = load_recipes_data()
    all_tags = extract_unique_tags(recipes)
    all_ingredients = extract_unique_ingredients(recipes)
    
    if not all_tags or not all_ingredients:
        print("No tags or ingredients found. Aborting.")
        return
    
    prefs_data = generate_prefs(user_ids, all_tags, all_ingredients, count=5000)
    
    insert_prefs_into_astra(db, prefs_data)
    
    print("Done! 5000 preferences inserted successfully.")


if __name__ == "__main__":
    main()
