# 🦕 Marmitosaure - Projet de Recettes

Marmitosaure est une plateforme de gestion de recettes inspirée de Marmiton, développée par une équipe de 15 personnes.

## 🏗️ Architecture du Projet

Le projet est divisé en trois briques principales :
* **Frontend** : Développé avec React et Vite.
* **Backend** : API en TypeScript utilisant Express et tournant sous Bun.
* **Bases de données (NoSQL)** : 
    * **MongoDB** : Stockage des recettes, ustensiles et ingrédients.
    * **Cassandra** : Gestion des utilisateurs, des avis (notices), des likes et des suggestions.
    * **Redis** : Gestion des sessions et des préférences utilisateurs.

---

## 🚀 Guide de Lancement

Suivez ces étapes dans l'ordre pour démarrer l'environnement de développement complet.

### 1. Lancement de l'infrastructure
À la racine du projet, lancez les bases de données via Docker :
```bash
docker compose up -d
```

## 🛠️ Lancement du Backend
Ouvrez un terminal et saisissez les commandes suivantes : 
```bash
cd ./backend
```
```bash
npm install
```
```bash
npm run dev
```

## 🛠️ Lancement du Fronted
Ouvrez un autre terminal et saisissez les commandes suivantes : 
```bash
cd ./fronted
```
```bash
npm install
```
```bash
npm run dev
```

## Accès à l'application
Dans votre navigateur saisissez ceci : 
```bash
http://localhost:5173/
```

---

## Requêtes avancées à faire :

### Recettes les mieux notées par user X
Exemple pour récupérer les recettes les mieux notés par l'utilisateur avec l'ID `f8cffe6b-9ddf-4f61-84d9-f2ebf7612d57` :
`curl "http://localhost:5000/reviews/users/f8cffe6b-9ddf-4f61-84d9-f2ebf7612d57?includeRecipes=1&sort=notation" | jq`

- Recettes les mieux notés par mois
`curl "http://localhost:5000/reviews/best-rated?month=1&year=2017" | jq`

### Recettes avec X ingrédients
Exemple pour récupérer toutes les recettes avec les ingrédients "carrotes" et "tomates" :
`curl http://localhost:5000/recipes?ingredients=tomates,carottes | jq`

### Recettes avec temps de préparation max
Exemple pour récupérer toutes les recettes avec moins de 15 minutes de préparation (inclus) :
`curl http://localhost:5000/recipes?maxPreparationTime=15 | jq`

- Stocker les suggestions en Redis à partir des préférences et le mettre à jour quand de nouvelles recettes avec les tags dans les préférences sont ajoutées

### Utilisateurs qui ont donnés les plus mauvaises notes.	
`curl "http://localhost:5000/reviews/users/low-rating" | jq`
