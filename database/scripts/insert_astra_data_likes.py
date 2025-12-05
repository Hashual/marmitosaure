import os
import json
from astrapy import DataAPIClient

# Configuration
TOKEN = "AstraCS:HRWcKnryqRSMrZqHIgpqaZWf:f07bb8c11326362093ab0f53dd374baaecb2fbef72348f52a4fd0013f67a0de8"
ENDPOINT = "https://7c54ee1c-ff64-4897-92f5-4c86a8c9b7ae-us-east-2.apps.astra.datastax.com"

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'donnees_marmiton_v3')
LIKES_FILE = os.path.join(DATA_DIR, 'likes.json')

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def batch_insert(collection, data, batch_size=20):
    total = len(data)
    for i in range(0, total, batch_size):
        batch = data[i:i+batch_size]
        try:
            collection.insert_many(batch)
            print(f"Inserted {min(i+batch_size, total)}/{total} documents in {collection.name}")
        except Exception as e:
            print(f"Error inserting batch in {collection.name}: {e}")
            # Try inserting individually if batch fails
            for doc in batch:
                try:
                    collection.insert_one(doc)
                except Exception as inner_e:
                    print(f"Failed to insert doc: {inner_e}")

def main():
    print("Connecting to Astra DB...")
    client = DataAPIClient(TOKEN)
    db = client.get_database_by_api_endpoint(ENDPOINT)
    print(f"Connected to database: {db.info().name}")

    # Processing Likes ONLY
    print("\n--- Processing Likes ---")
    if "Likes" not in db.list_collection_names():
        db.create_collection("Likes")
        print("Created collection: Likes")
    
    # Note: Case sensitivity might matter depending on Astra configuration, 
    # but normally collections are lowercase. User asked for "table likes".
    # I'll use "Likes" capitalized if that matches their schema expectation or "likes".
    # Usually snake_case is safer. Let's use "likes" to match previous convention and just print "Likes".
    # Update: User specifically said "table likes". 
    
    likes_col = db.get_collection("Likes")
    if not likes_col: # If case sensitivity is weird or it wasn't found above
         likes_col = db.get_collection("likes") 

    if os.path.exists(LIKES_FILE):
        likes_data = load_json(LIKES_FILE)
        print(f"Loaded {len(likes_data)} likes.")
        batch_insert(likes_col, likes_data)
    else:
        print("likes.json not found!")

    print("\nDone. Likes inserted.")

if __name__ == "__main__":
    main()
