import json
from collections import Counter

file_path = r'c:\Users\nicol\Desktop\IUT\BUT3\Mingo\Nouveau dossier\marmitosaure\database\donnees_marmiton_v3\edited_recettes.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

formats = Counter()
examples = {}

for recipe in data:
    pt = recipe.get('preparation_time', 'MISSING')
    formats[pt] += 1
    if pt not in examples:
        examples[pt] = recipe.get('title', 'Unknown')

print("Top 20 formats:")
for fmt, count in formats.most_common(20):
    print(f"'{fmt}': {count} (e.g. {examples[fmt]})")
