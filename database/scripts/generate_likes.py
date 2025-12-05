import json
import os
import random
import sys
from datetime import datetime, timedelta
from pymongo import MongoClient

# Configuration
MONGODB_URI = "mongodb+srv://romaindesmond_db_user:SrH8SuGLoU2Qd4O0@mamiton.arpq4w5.mongodb.net/?appName=Mamiton"
DB_NAME = "Marmitosaure"
COLLECTION_NAME = "recipes"

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'donnees_marmiton_v3')
USERS_FILE = os.path.join(DATA_DIR, 'utilisateurs.json')
OUTPUT_FILE = os.path.join(DATA_DIR, 'likes.json')

def load_data():
    print(f"Loading users from {USERS_FILE}...")
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            users = json.load(f)
            # Use 'utilisateur_id' directly
            user_ids = [u['utilisateur_id'] for u in users]
    except FileNotFoundError:
        print(f"Error: {USERS_FILE} not found.")
        sys.exit(1)
        
    print(f"Connecting to MongoDB to fetch recipe IDs...")
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        # Fetch only _id field
        cursor = collection.find({}, {'_id': 1})
        recipe_ids = [str(doc['_id']) for doc in cursor]
        print(f"Fetched {len(recipe_ids)} recipe IDs from MongoDB.")
        
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        sys.exit(1)
        
    return user_ids, recipe_ids

def generate_likes(user_ids, recipe_ids, count=7000):
    print(f"Generating {count} likes...")
    likes = []
    seen = set()
    
    start_date = datetime.now() - timedelta(days=730) # 2 years ago
    
    valid_count = 0
    attempts = 0
    max_attempts = count * 5 
    
    while valid_count < count and attempts < max_attempts:
        attempts += 1
        uid = random.choice(user_ids)
        rid = random.choice(recipe_ids)
        
        if (uid, rid) in seen:
            continue
            
        seen.add((uid, rid))
        
        # Random date within the last 2 years
        random_days = random.randint(0, 730)
        interaction_date = start_date + timedelta(days=random_days)
        
        likes.append({
            "recipe_id": rid,
            "user_id": uid,
            "publication_date": interaction_date.isoformat()
        })
        valid_count += 1
        
    return likes

def save_likes(likes):
    print(f"Saving {len(likes)} likes to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(likes, f, indent=2, ensure_ascii=False)
    print("Done.")

def main():
    user_ids, recipe_ids = load_data()
    
    if not recipe_ids:
        print("No recipe IDs found in MongoDB. Aborting.")
        return

    likes_data = generate_likes(user_ids, recipe_ids, count=5000)
    save_likes(likes_data)

if __name__ == "__main__":
    main()
