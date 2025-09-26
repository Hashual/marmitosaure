import requests
from bs4 import BeautifulSoup
import json
import time
import uuid
from datetime import datetime
import re
from urllib.parse import urljoin
import logging
import os

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MarmitonScraperFixed:
    def __init__(self, output_dir="scraped_recipes"):
        self.base_url = "https://www.marmiton.org"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
            'Referer': 'https://www.marmiton.org/'
        })

        # Créer le dossier de sortie
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

        # Fichiers de sortie
        self.recipes_file = os.path.join(output_dir, "recettes.json")
        self.users_file = os.path.join(output_dir, "utilisateurs.json")
        self.ingredients_file = os.path.join(output_dir, "ingredients.json")
        self.reviews_file = os.path.join(output_dir, "avis.json")

        # Données collectées
        self.recipes = []
        self.users = {}
        self.ingredients_db = {}
        self.reviews = []

        logger.info(f"Scraper initialisé, données sauvegardées dans: {output_dir}")

    def get_recipe_links(self, search_term="", max_pages=3):
        """Récupérer les liens des recettes depuis les pages de recherche"""
        recipe_links = []

        for page in range(1, max_pages + 1):
            if search_term:
                url = f"{self.base_url}/recettes/recherche.aspx?aqt={search_term}&page={page}"
            else:
                url = f"{self.base_url}/recettes/top-internautes.aspx?page={page}"

            try:
                logger.info(f"Scraping page {page}: {url}")
                response = self.session.get(url, timeout=15)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'html.parser')
                links = soup.find_all('a', href=re.compile(r'/recettes/recette_'))

                for link in links:
                    href = link.get('href')
                    if href:
                        full_url = urljoin(self.base_url, href)
                        recipe_links.append(full_url)

                logger.info(f"Page {page}: {len(links)} liens trouvés")
                time.sleep(2)

            except Exception as e:
                logger.error(f"Erreur page {page}: {e}")
                continue

        unique_links = list(set(recipe_links))
        logger.info(f"Total: {len(unique_links)} recettes uniques trouvées")
        return unique_links

    def extract_recipe_id(self, recipe_url, soup):
        """Extraire l'ID de la recette depuis plusieurs sources"""
        # Méthode 1: Depuis l'URL
        url_patterns = [
            r'recette_[^_]*_(\d+)\.aspx',  # Format standard
            r'recette-(\d+)',               # Format alternatif
            r'/(\d+)/'                      # ID dans le chemin
        ]

        for pattern in url_patterns:
            match = re.search(pattern, recipe_url)
            if match:
                recipe_id = match.group(1)
                logger.info(f"ID trouvé dans l'URL: {recipe_id}")
                return recipe_id

        # Méthode 2: Depuis le JSON-LD
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}

                # Chercher l'ID dans différents champs
                if '@id' in data:
                    id_match = re.search(r'(\d+)', data['@id'])
                    if id_match:
                        recipe_id = id_match.group(1)
                        logger.info(f"ID trouvé dans JSON-LD @id: {recipe_id}")
                        return recipe_id

                if 'url' in data:
                    id_match = re.search(r'(\d+)', data['url'])
                    if id_match:
                        recipe_id = id_match.group(1)
                        logger.info(f"ID trouvé dans JSON-LD url: {recipe_id}")
                        return recipe_id

            except Exception as e:
                logger.debug(f"Erreur parsing JSON-LD pour ID: {e}")
                continue

        # Méthode 3: Chercher dans les attributs data-*
        elements_with_id = soup.find_all(attrs={'data-recipe-id': True})
        if elements_with_id:
            recipe_id = elements_with_id[0]['data-recipe-id']
            logger.info(f"ID trouvé dans data-recipe-id: {recipe_id}")
            return recipe_id

        # Méthode 4: Chercher dans les scripts JavaScript
        script_tags = soup.find_all('script')
        for script in script_tags:
            if script.string:
                id_matches = re.findall(r'recipeId["\']?\s*:\s*["\']?(\d+)', script.string)
                if id_matches:
                    recipe_id = id_matches[0]
                    logger.info(f"ID trouvé dans JavaScript: {recipe_id}")
                    return recipe_id

        logger.warning("Aucun ID de recette trouvé")
        return None

    def fetch_reviews(self, recipe_id, max_pages=5):
        """Récupérer les avis via l'API Marmiton avec plusieurs tentatives"""
        if not recipe_id:
            logger.warning("Pas d'ID de recette fourni pour les avis")
            return []

        reviews = []

        # URLs d'API à essayer
        api_urls = [
            f"https://www.marmiton.org/reloaded/api/recipe/getrecipereviews",
            f"https://www.marmiton.org/api/recipe/{recipe_id}/reviews",
            f"https://www.marmiton.org/reloaded/api/reviews/{recipe_id}"
        ]

        for api_url in api_urls:
            logger.info(f"Tentative API: {api_url}")

            for page in range(1, max_pages + 1):
                try:
                    # Paramètres pour différents formats d'API
                    if "getrecipereviews" in api_url:
                        params = {
                            'userId': 'null',
                            'recipeId': recipe_id,
                            'order': 'nb_likes',
                            'limit': 20,
                            'page': page
                        }
                        response = self.session.get(api_url, params=params, timeout=15)
                    else:
                        # Format alternatif
                        url = f"{api_url}?page={page}&limit=20"
                        response = self.session.get(url, timeout=15)

                    logger.info(f"Status code: {response.status_code}")

                    if response.status_code != 200:
                        logger.warning(f"Status non-200: {response.status_code}")
                        continue

                    try:
                        data = response.json()
                        logger.info(f"Réponse JSON reçue: {type(data)}")

                        # Debug: afficher la structure pour la première page
                        if page == 1:
                            logger.debug(f"Structure API (page 1): {list(data.keys()) if isinstance(data, dict) else type(data)}")

                    except json.JSONDecodeError:
                        logger.error("Réponse non-JSON reçue")
                        continue

                    # Parser les avis selon différents formats
                    page_reviews = self.parse_reviews_data(data, recipe_id)
                    reviews.extend(page_reviews)

                    logger.info(f"Page {page}: {len(page_reviews)} avis extraits")

                    # Arrêter si pas assez d'avis pour une page complète
                    if len(page_reviews) < 20:
                        break

                    time.sleep(1)  # Respecter le serveur

                except Exception as e:
                    logger.error(f"Erreur API {api_url} page {page}: {e}")
                    continue

            # Si on a trouvé des avis avec cette API, pas besoin d'essayer les autres
            if reviews:
                logger.info(f"Avis trouvés avec {api_url}: {len(reviews)} total")
                break

        if not reviews:
            logger.warning(f"Aucun avis trouvé pour la recette {recipe_id}")

        return reviews

    def parse_reviews_data(self, data, recipe_id):
        """Parser les données d'avis selon différents formats de réponse"""
        reviews = []

        # Loguer la structure complète pour debug
        logger.debug(f"Parsing data type: {type(data)}")
        if isinstance(data, dict):
            logger.debug(f"Dict keys: {list(data.keys())}")

        # Format 1: Liste directe
        if isinstance(data, list):
            avis_data = data
        # Format 2: Objet avec différentes clés possibles
        elif isinstance(data, dict):
            # Tenter plusieurs clés communes
            possible_keys = ['items', 'data', 'reviews', 'comments', 'results', 'content', 'list']
            avis_data = []

            for key in possible_keys:
                if key in data:
                    candidate = data[key]
                    logger.debug(f"Trouvé clé '{key}': {type(candidate)}")

                    if isinstance(candidate, list):
                        avis_data = candidate
                        logger.info(f"Utilisation de la clé '{key}' avec {len(avis_data)} éléments")
                        break
                    elif isinstance(candidate, dict):
                        # Chercher dans les sous-clés
                        sub_keys = ['data', 'items', 'list', 'content']
                        for sub_key in sub_keys:
                            if sub_key in candidate and isinstance(candidate[sub_key], list):
                                avis_data = candidate[sub_key]
                                logger.info(f"Utilisation de la clé '{key}.{sub_key}' avec {len(avis_data)} éléments")
                                break
                        if avis_data:
                            break

            # Si aucune clé standard trouvée, chercher toute liste dans le dictionnaire
            if not avis_data:
                for key, value in data.items():
                    if isinstance(value, list) and len(value) > 0:
                        # Vérifier si c'est une liste d'objets qui ressemblent à des avis
                        first_item = value[0] if value else {}
                        if isinstance(first_item, dict):
                            # Chercher des champs typiques d'un avis
                            review_fields = ['content', 'comment', 'text', 'rating', 'score', 'author', 'user']
                            if any(field in first_item for field in review_fields):
                                avis_data = value
                                logger.info(f"Trouvé liste d'avis dans la clé '{key}' avec {len(avis_data)} éléments")
                                break
        else:
            logger.warning(f"Format de données non reconnu: {type(data)}")
            return reviews

        if not isinstance(avis_data, list):
            logger.warning(f"Aucune liste d'avis trouvée. Type final: {type(avis_data)}")
            return reviews

        # Parser chaque avis
        for i, avis in enumerate(avis_data):
            if not isinstance(avis, dict):
                logger.debug(f"Avis {i} n'est pas un dict: {type(avis)}")
                continue

            # Debug: afficher les clés du premier avis
            if i == 0:
                logger.debug(f"Clés du premier avis: {list(avis.keys())}")

            # Extraire les informations avec gestion des différents formats
            user_id = str(uuid.uuid4())

            # Essayer différents champs pour chaque information
            nickname_fields = ['nickname', 'userName', 'author', 'user', 'name', 'pseudo']
            nickname = None
            for field in nickname_fields:
                if field in avis and avis[field]:
                    nickname = str(avis[field])
                    break
            if not nickname:
                nickname = f"Utilisateur_{user_id[:8]}"

            content_fields = ['content', 'comment', 'text', 'message', 'review']
            content = ""
            for field in content_fields:
                if field in avis and avis[field]:
                    content = str(avis[field])[:1000]
                    break

            rating_fields = ['rating', 'score', 'stars', 'note', 'grade']
            rating = None
            for field in rating_fields:
                if field in avis and avis[field] is not None:
                    try:
                        rating = float(avis[field])
                        break
                    except (ValueError, TypeError):
                        continue

            date_fields = ['creationDate', 'date', 'publishedAt', 'created_at', 'timestamp']
            date = datetime.now().isoformat()
            for field in date_fields:
                if field in avis and avis[field]:
                    date = str(avis[field])
                    break

            likes_fields = ['nb_likes', 'likes', 'helpful', 'upvotes']
            likes = 0
            for field in likes_fields:
                if field in avis and avis[field] is not None:
                    try:
                        likes = int(avis[field])
                        break
                    except (ValueError, TypeError):
                        continue

            review = {
                'avis_id': str(uuid.uuid4()),
                'recette_id': recipe_id,
                'user_id': user_id,
                'nickname': nickname,
                'commentaire': content,
                'note': rating,
                'date_publication': date,
                'nb_likes': likes
            }

            # Ajouter l'utilisateur
            self.add_user(user_id, nickname)
            reviews.append(review)

        logger.info(f"Parsed {len(reviews)} avis depuis {len(avis_data)} éléments")
        return reviews

    def scrape_recipe(self, recipe_url):
        """Scraper une recette individuelle avec avis"""
        try:
            logger.info(f"Scraping recette: {recipe_url}")
            response = self.session.get(recipe_url, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extraire l'ID de la recette
            recipe_id = self.extract_recipe_id(recipe_url, soup)

            # Récupérer les avis
            reviews = []
            if recipe_id:
                logger.info(f"Extraction des avis pour la recette ID: {recipe_id}")
                reviews = self.fetch_reviews(recipe_id, max_pages=3)
            else:
                logger.warning("Impossible d'extraire l'ID - pas d'avis récupérés")

            recipe_data = {
                'recette_id': recipe_id or str(uuid.uuid4()),
                'url': recipe_url,
                'titre': self.extract_title(soup),
                'description': self.extract_description(soup),
                'temps_preparation': self.extract_prep_time(soup),
                'temps_cuisson': self.extract_cooking_time(soup),
                'nb_personnes': self.extract_servings(soup),
                'difficulte': self.extract_difficulty(soup),
                'cout': self.extract_cost(soup),
                'etapes': self.extract_steps(soup),
                'ingredients': self.extract_ingredients(soup),
                'ustensiles': self.extract_ustensiles(soup),
                'tags': self.extract_tags(soup),
                'origine': self.extract_origin(soup),
                'auteur': self.extract_author(soup),
                'note_moyenne': self.extract_rating(soup),
                'nb_avis': len(reviews),
                'avis': reviews,
                'image_url': self.extract_image(soup),
                'date_scraping': datetime.now().isoformat()
            }

            logger.info(f"✅ '{recipe_data['titre']}': {len(recipe_data['ingredients'])} ingrédients, {len(recipe_data['etapes'])} étapes, {len(reviews)} avis")
            return recipe_data

        except Exception as e:
            logger.error(f"Erreur scraping {recipe_url}: {e}")
            return None

    def extract_ingredients(self, soup):
        """Extraire les ingrédients depuis JSON-LD (méthode principale)"""
        ingredients = []

        # 1. Méthode prioritaire : JSON-LD
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}

                if 'recipeIngredient' in data:
                    logger.info(f"Ingrédients trouvés dans JSON-LD: {len(data['recipeIngredient'])}")
                    for ingredient_text in data['recipeIngredient']:
                        parsed = self.parse_ingredient(ingredient_text)
                        ingredients.append(parsed)
                        self.add_ingredient_to_db(parsed)
                    return ingredients

            except Exception as e:
                logger.debug(f"Erreur parsing JSON-LD: {e}")
                continue

        # 2. Méthode alternative : Classes CSS Marmiton
        card_ingredients = soup.select('.card-ingredient .card-ingredient-content')
        if card_ingredients:
            logger.info(f"Ingrédients trouvés dans card-ingredient: {len(card_ingredients)}")
            for card in card_ingredients:
                text = card.get_text().strip()
                if text:
                    parsed = self.parse_ingredient(text)
                    ingredients.append(parsed)
                    self.add_ingredient_to_db(parsed)
            return ingredients

        # 3. Fallback : recherche dans les divs d'ingrédients
        ingredient_divs = soup.select('.mrtn-recette_ingredients-items .card-ingredient')
        if ingredient_divs:
            logger.info(f"Ingrédients trouvés dans mrtn-recette_ingredients-items: {len(ingredient_divs)}")
            for div in ingredient_divs:
                text = div.get_text().strip()
                if text:
                    parsed = self.parse_ingredient(text)
                    ingredients.append(parsed)
                    self.add_ingredient_to_db(parsed)

        return ingredients

    def extract_steps(self, soup):
        """Extraire les étapes depuis JSON-LD puis CSS"""
        steps = []

        # 1. JSON-LD en priorité
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}

                if 'recipeInstructions' in data:
                    logger.info(f"Étapes trouvées dans JSON-LD: {len(data['recipeInstructions'])}")
                    for instruction in data['recipeInstructions']:
                        if isinstance(instruction, dict) and 'text' in instruction:
                            steps.append(instruction['text'])
                        elif isinstance(instruction, str):
                            steps.append(instruction)
                    return steps

            except Exception as e:
                logger.debug(f"Erreur parsing JSON-LD instructions: {e}")
                continue

        # 2. CSS fallback
        step_selectors = [
            '.recipe-step-list .recipe-step',
            '.mrtn-recette_steps .step-content',
            '.instructions li',
            '.preparation-steps li'
        ]

        for selector in step_selectors:
            elements = soup.select(selector)
            if elements:
                logger.info(f"Étapes trouvées avec CSS {selector}: {len(elements)}")
                steps = [step.get_text().strip() for step in elements if step.get_text().strip()]
                break

        return steps

    def extract_rating(self, soup):
        """Extraire la note depuis JSON-LD"""
        # JSON-LD
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}

                if 'aggregateRating' in data:
                    rating = data['aggregateRating']
                    if isinstance(rating, dict) and 'ratingValue' in rating:
                        return float(rating['ratingValue'])

            except Exception as e:
                continue

        return 0

    def extract_author(self, soup):
        """Extraire l'auteur depuis JSON-LD"""
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}

                if 'author' in data:
                    author = data['author']
                    if isinstance(author, dict) and 'name' in author:
                        author_name = author['name']
                    elif isinstance(author, str):
                        author_name = author
                    else:
                        author_name = 'Anonyme'

                    if author_name != 'Anonyme':
                        user_id = self.add_user(None, author_name)
                        return {
                            'user_id': user_id,
                            'nom': author_name
                        }

            except Exception as e:
                continue

        user_id = self.add_user(None, 'Anonyme')
        return {
            'user_id': user_id,
            'nom': 'Anonyme'
        }

    def parse_ingredient(self, text):
        """Parser un ingrédient pour extraire quantité, unité, nom"""
        text = re.sub(r'\s+', ' ', text.strip())

        patterns = [
            r'(\d+(?:[.,]\d+)?)\s*(g|kg|ml|cl|l|cuillères?|cuillère|c\.à\.s|c\.à\.c|cs|cc|tasse|verre)\s+(?:de\s+)?(.+)',
            r'(\d+(?:[.,]\d+)?)\s+(.+)',
            r'(.+)'
        ]

        for pattern in patterns:
            match = re.match(pattern, text, re.IGNORECASE)
            if match and len(match.groups()) >= 2:
                if len(match.groups()) == 3:
                    return {
                        'ingredient_id': str(uuid.uuid4()),
                        'quantite': match.group(1).strip(),
                        'unite': match.group(2).strip(),
                        'nom': match.group(3).strip(),
                        'type': self.classify_ingredient(match.group(3).strip()),
                        'texte_original': text
                    }
                else:
                    return {
                        'ingredient_id': str(uuid.uuid4()),
                        'quantite': match.group(1).strip(),
                        'unite': '',
                        'nom': match.group(2).strip(),
                        'type': self.classify_ingredient(match.group(2).strip()),
                        'texte_original': text
                    }

        return {
            'ingredient_id': str(uuid.uuid4()),
            'quantite': '',
            'unite': '',
            'nom': text,
            'type': self.classify_ingredient(text),
            'texte_original': text
        }

    def classify_ingredient(self, ingredient_name):
        """Classification basique des ingrédients"""
        categories = {
            'légumes': ['tomate', 'carotte', 'pomme de terre', 'oignon', 'ail', 'courgette', 'poivron', 'salade', 'épinard'],
            'fruits': ['pomme', 'poire', 'banane', 'orange', 'citron', 'fraise', 'abricot', 'raisin'],
            'viandes': ['boeuf', 'porc', 'poulet', 'agneau', 'veau', 'dinde', 'canard', 'jambon'],
            'poissons': ['saumon', 'thon', 'cabillaud', 'sole', 'truite', 'sardine'],
            'fromages': ['mozzarella', 'gruyère', 'parmesan', 'chèvre', 'roquefort', 'camembert', 'fromage'],
            'féculents': ['riz', 'pâtes', 'pomme de terre', 'blé', 'quinoa', 'semoule', 'pain'],
            'épices': ['sel', 'poivre', 'curry', 'paprika', 'cumin', 'cannelle', 'muscade', 'thym'],
            'herbes': ['basilic', 'persil', 'ciboulette', 'thym', 'origan', 'menthe', 'romarin'],
            'produits_laitiers': ['lait', 'crème', 'beurre', 'yaourt', 'fromage blanc'],
            'oeufs': ['oeuf', 'oeufs', 'jaune', 'blanc'],
            'huiles': ['huile', 'olive', 'tournesol', 'colza'],
            'sucrants': ['sucre', 'miel', 'sirop', 'cassonade'],
            'farines': ['farine', 'blé', 'maïs', 'sarrasin']
        }

        ingredient_lower = ingredient_name.lower()
        for category, items in categories.items():
            if any(item in ingredient_lower for item in items):
                return category
        return 'autre'

    def add_ingredient_to_db(self, ingredient):
        """Ajouter un ingrédient à la base locale"""
        nom_key = ingredient['nom'].lower().strip()
        if nom_key not in self.ingredients_db and nom_key:
            self.ingredients_db[nom_key] = {
                'ingredient_id': ingredient['ingredient_id'],
                'nom': ingredient['nom'],
                'type': ingredient['type'],
                'date_ajout': datetime.now().isoformat()
            }

    def add_user(self, user_id=None, nom_utilisateur='Anonyme'):
        """Ajouter un utilisateur en évitant les doublons"""
        if user_id is None:
            user_id = str(uuid.uuid4())

        email = f"{nom_utilisateur.lower().replace(' ', '_')}@marmiton.com"

        if email not in self.users:
            self.users[email] = {
                'utilisateur_id': user_id,
                'nom_utilisateur': nom_utilisateur,
                'email': email,
                'date_inscription': datetime.now().isoformat()
            }

        return self.users[email]['utilisateur_id']

    # Méthodes d'extraction complètes pour tous les champs
    def extract_title(self, soup):
        # 1. JSON-LD en priorité
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}
                if 'name' in data:
                    return data['name'].strip()
            except:
                continue

        # 2. CSS fallback
        selectors = ['h1.main-title', 'h1.recipe-title', 'h1', '.recipe-header h1']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        return "Titre non trouvé"

    def extract_description(self, soup):
        # 1. JSON-LD
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}
                if 'description' in data:
                    return data['description'].strip()
            except:
                continue

        # 2. CSS fallback
        selectors = ['.recipe-summary', '.recipe-description', '.description', '.recipe-intro']
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        return ""

    def extract_prep_time(self, soup):
        # 1. JSON-LD
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}
                if 'prepTime' in data:
                    # Format ISO 8601 (PT15M) -> 15 minutes
                    time_str = data['prepTime']
                    minutes = re.search(r'PT(\d+)M', time_str)
                    if minutes:
                        return f"{minutes.group(1)} min"
                    return time_str
            except:
                continue

        # 2. CSS fallback
        selectors = [
            '.recipe-infos__prep-time .recipe-infos__item-value',
            '.prep-time .time-value',
            '.preparation-time',
            '[data-prep-time]'
        ]
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.has_attr('data-prep-time'):
                    return f"{element['data-prep-time']} min"
                return element.get_text().strip()

        return "Non spécifié"

    def extract_cooking_time(self, soup):
        # 1. JSON-LD
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}
                if 'cookTime' in data:
                    time_str = data['cookTime']
                    minutes = re.search(r'PT(\d+)M', time_str)
                    if minutes:
                        return f"{minutes.group(1)} min"
                    return time_str
            except:
                continue

        # 2. CSS fallback
        selectors = [
            '.recipe-infos__cook-time .recipe-infos__item-value',
            '.cook-time .time-value',
            '.cooking-time',
            '[data-cook-time]'
        ]
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.has_attr('data-cook-time'):
                    return f"{element['data-cook-time']} min"
                return element.get_text().strip()

        return "Non spécifié"

    def extract_servings(self, soup):
        # 1. JSON-LD
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}
                if 'recipeYield' in data:
                    yield_val = data['recipeYield']
                    if isinstance(yield_val, list):
                        return str(yield_val[0])
                    return str(yield_val)
            except:
                continue

        # 2. CSS fallback
        selectors = [
            '.recipe-infos__quantity .recipe-infos__item-value',
            '.servings .value',
            '.portions',
            '[data-servings]',
            '.yield'
        ]
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if element.has_attr('data-servings'):
                    return element['data-servings']
                text = element.get_text().strip()
                # Extraire les chiffres
                numbers = re.findall(r'\d+', text)
                if numbers:
                    return f"{numbers[0]} personnes"
                return text

        return "Non spécifié"

    def extract_difficulty(self, soup):
        # CSS selectors pour la difficulté
        selectors = [
            '.recipe-infos__difficulty .recipe-infos__item-value',
            '.difficulty .value',
            '.recipe-difficulty',
            '.difficulty-level'
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text().strip()
                # Standardiser les niveaux
                if 'facile' in text.lower():
                    return 'Facile'
                elif 'moyen' in text.lower():
                    return 'Moyen'
                elif 'difficile' in text.lower():
                    return 'Difficile'
                return text

        # Chercher les étoiles de difficulté
        difficulty_stars = soup.select('.difficulty-stars .star, .difficulty .star-filled')
        if difficulty_stars:
            level = len(difficulty_stars)
            if level == 1:
                return 'Facile'
            elif level == 2:
                return 'Moyen'
            elif level >= 3:
                return 'Difficile'

        return "Non spécifié"

    def extract_cost(self, soup):
        # CSS selectors pour le coût
        selectors = [
            '.recipe-infos__budget .recipe-infos__item-value',
            '.cost .value',
            '.recipe-cost',
            '.budget'
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text().strip()
                # Standardiser les coûts
                if 'bon marché' in text.lower() or 'pas cher' in text.lower():
                    return 'Bon marché'
                elif 'moyen' in text.lower():
                    return 'Coût moyen'
                elif 'cher' in text.lower():
                    return 'Assez cher'
                return text

        # Chercher les symboles €
        cost_symbols = soup.select('.cost-symbols .euro, .budget .euro-filled')
        if cost_symbols:
            level = len(cost_symbols)
            if level == 1:
                return 'Bon marché'
            elif level == 2:
                return 'Coût moyen'
            elif level >= 3:
                return 'Assez cher'

        return "Non spécifié"

    def extract_ustensiles(self, soup):
        ustensiles = []

        # Chercher les ustensiles dans différentes sections
        selectors = [
            '.recipe-ustensils .ustensil',
            '.ustensiles .item',
            '.equipment .equipment-item',
            '.materiel .materiel-item'
        ]

        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                ustensile = element.get_text().strip()
                if ustensile and ustensile not in ustensiles:
                    ustensiles.append(ustensile)

        # Chercher dans une liste textuelle
        ustensils_text = soup.select_one('.ustensiles-text, .equipment-text')
        if ustensils_text:
            text = ustensils_text.get_text()
            # Séparer par des délimiteurs communs
            items = re.split(r'[,;•\-\n]', text)
            for item in items:
                item = item.strip()
                if item and len(item) > 2:  # Éviter les éléments trop courts
                    ustensiles.append(item)

        return ustensiles

    def extract_tags(self, soup):
        tags = []

        # 1. JSON-LD keywords
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}
                if 'keywords' in data:
                    keywords = data['keywords']
                    if isinstance(keywords, str):
                        tags.extend([k.strip() for k in keywords.split(',')])
                    elif isinstance(keywords, list):
                        tags.extend(keywords)
            except:
                continue

        # 2. CSS selectors pour tags/catégories
        selectors = [
            '.recipe-tags .tag',
            '.categories .category',
            '.recipe-categories .category',
            '.tags .tag-item',
            '.recipe-meta .meta-tag'
        ]

        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                tag = element.get_text().strip()
                if tag and tag not in tags:
                    tags.append(tag)

        # 3. Meta tags
        meta_keywords = soup.select_one('meta[name="keywords"]')
        if meta_keywords and meta_keywords.has_attr('content'):
            keywords = meta_keywords['content']
            tags.extend([k.strip() for k in keywords.split(',') if k.strip()])

        return list(set(tags))  # Supprimer les doublons

    def extract_origin(self, soup):
        # 1. JSON-LD recipeCategory ou recipeCuisine
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}
                if 'recipeCuisine' in data:
                    return data['recipeCuisine']
                if 'recipeCategory' in data:
                    return data['recipeCategory']
            except:
                continue

        # 2. CSS selectors
        selectors = [
            '.recipe-origin',
            '.cuisine-type',
            '.recipe-cuisine',
            '.origin .value',
            '.recipe-category'
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()

        # 3. Chercher dans les liens/catégories
        category_links = soup.select('.recipe-categories a, .breadcrumb a')
        for link in category_links:
            href = link.get('href', '')
            text = link.get_text().strip()
            # Si le lien contient des mots-clés d'origine
            origin_keywords = ['cuisine', 'recette', 'tradition']
            if any(keyword in href.lower() for keyword in origin_keywords) and text:
                return text

        return "Non spécifiée"

    def extract_image(self, soup):
        # 1. JSON-LD image
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    data = data[0] if data else {}
                if 'image' in data:
                    image = data['image']
                    if isinstance(image, list):
                        return image[0] if image else ""
                    elif isinstance(image, dict) and 'url' in image:
                        return image['url']
                    elif isinstance(image, str):
                        return image
            except:
                continue

        # 2. CSS selectors pour l'image principale
        selectors = [
            '.recipe-media img',
            '.recipe-image img',
            '.main-recipe-image img',
            '.recipe-header img',
            '.hero-recipe img'
        ]

        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                # Chercher src, data-src, ou data-lazy
                for attr in ['src', 'data-src', 'data-lazy', 'data-original']:
                    if element.has_attr(attr):
                        img_url = element[attr]
                        if img_url.startswith('http'):
                            return img_url
                        elif img_url.startswith('/'):
                            return urljoin(self.base_url, img_url)

        # 3. Meta tags Open Graph
        og_image = soup.select_one('meta[property="og:image"]')
        if og_image and og_image.has_attr('content'):
            return og_image['content']

        return ""

    def save_data(self):
        """Sauvegarder toutes les données collectées"""
        try:
            # Sauvegarder les recettes
            with open(self.recipes_file, 'w', encoding='utf-8') as f:
                json.dump(self.recipes, f, ensure_ascii=False, indent=2)

            # Sauvegarder les utilisateurs
            users_list = list(self.users.values())
            with open(self.users_file, 'w', encoding='utf-8') as f:
                json.dump(users_list, f, ensure_ascii=False, indent=2)

            # Sauvegarder les ingrédients
            ingredients_list = list(self.ingredients_db.values())
            with open(self.ingredients_file, 'w', encoding='utf-8') as f:
                json.dump(ingredients_list, f, ensure_ascii=False, indent=2)

            # Sauvegarder les avis
            all_reviews = []
            for recipe in self.recipes:
                for review in recipe.get('avis', []):
                    review_copy = review.copy()
                    review_copy['recette_id'] = recipe['recette_id']
                    all_reviews.append(review_copy)

            with open(self.reviews_file, 'w', encoding='utf-8') as f:
                json.dump(all_reviews, f, ensure_ascii=False, indent=2)

            logger.info(f"✅ Données sauvegardées:")
            logger.info(f"  - {len(self.recipes)} recettes")
            logger.info(f"  - {len(users_list)} utilisateurs")
            logger.info(f"  - {len(ingredients_list)} ingrédients")
            logger.info(f"  - {len(all_reviews)} avis")

        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde: {e}")

    def run_scraper(self, search_terms=[""], max_pages_per_term=2, max_recipes=50):
        """Exécuter le scraper complet"""
        logger.info("=== DÉMARRAGE DU SCRAPER MARMITON CORRIGÉ ===")

        all_recipe_links = []

        # Collecter les liens
        for term in search_terms:
            logger.info(f"Recherche: '{term}'")
            links = self.get_recipe_links(term, max_pages_per_term)
            all_recipe_links.extend(links)
            time.sleep(3)

        # Dédoublonner et limiter
        unique_links = list(set(all_recipe_links))[:max_recipes]
        logger.info(f"=== SCRAPING DE {len(unique_links)} RECETTES ===")

        # Scraper chaque recette
        success_count = 0
        for i, recipe_url in enumerate(unique_links, 1):
            logger.info(f"[{i}/{len(unique_links)}] Scraping: {recipe_url}")

            recipe_data = self.scrape_recipe(recipe_url)

            if recipe_data and recipe_data['titre'] != "Titre non trouvé":
                self.recipes.append(recipe_data)
                success_count += 1
            else:
                logger.warning(f"❌ Échec du scraping")

            # Pause respectueuse
            time.sleep(3)

        # Sauvegarder les données
        self.save_data()

        logger.info(f"=== SCRAPING TERMINÉ ===")
        logger.info(f"Recettes collectées: {success_count}")

        return success_count

# Exemple d'utilisation
if __name__ == "__main__":
    scraper = MarmitonScraperFixed("donnees_marmiton_v3")

    search_terms = [
        "pizza",
        "pâtes",
        "dessert"
    ]

    try:
        count = scraper.run_scraper(
            search_terms=search_terms,
            max_pages_per_term=2,
            max_recipes=5
        )

        print(f"\n🎉 Scraping réussi ! {count} recettes collectées")
        print(f"📁 Données disponibles dans le dossier: {scraper.output_dir}")

    except KeyboardInterrupt:
        print("\n⏹️ Scraping interrompu par l'utilisateur")
        scraper.save_data()
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        scraper.save_data()