import json
import os
import sys
from pymongo import MongoClient

# Configuration
MONGODB_URI = "mongodb+srv://romaindesmond_db_user:SrH8SuGLoU2Qd4O0@mamiton.arpq4w5.mongodb.net/?appName=Mamiton"
DB_NAME = "marmitosaure"
COLLECTION_NAME = "recipes"


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FILE = os.path.join(BASE_DIR, '..', 'donnees_marmiton_v3', 'edited_recettes.json')

def main():
    print(f"Connecting to MongoDB at {MONGODB_URI}...")
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        print(f"Connected to database '{DB_NAME}', collection '{COLLECTION_NAME}'.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        sys.exit(1)

    print(f"Reading data from {DATA_FILE}...")
    if not os.path.exists(DATA_FILE):
        print(f"Error: File not found at {DATA_FILE}")
        sys.exit(1)

    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)

    if not isinstance(data, list):
        print("Error: JSON data is not a list of recipes.")
        sys.exit(1)

    print(f"Found {len(data)} recipes. Inserting into MongoDB...")
    
    try:
        result = collection.insert_many(data)
        print(f"Successfully inserted {len(result.inserted_ids)} recipes.")
    except Exception as e:
        print(f"Error inserting data: {e}")
        sys.exit(1)

    print("Done.")

# 
if __name__ == "__main__":
    main()
