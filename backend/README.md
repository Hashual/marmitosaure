# Marmitosaure — Documentation de l'API

Ce document recense l'ensemble des routes exposées par l'API Marmitosaure, leurs exigences d'authentification, les paramètres de requête acceptés et la forme exacte des réponses.

## Base de l'API & authentification

- **Base URL locale** : `http://localhost:5000`
- **Authentification** : certaines routes exigent un header `Authorization: Bearer <JWT>`, obtenu via `POST /auth/login`. Les sessions sont persistées dans Redis pendant 1 heure.
- **Formats** : les routes acceptent du JSON, sauf les créations/updates de recettes qui attendent un `multipart/form-data` pour l'image (`image`) combiné à des champs JSON (souvent sérialisés en chaînes côté front).

## Types partagés

```ts
type Pagination = {
	page: number;      // numéro de page demandé (>= 1)
	limit: number;     // nombre d'éléments renvoyés par page (12 par défaut)
	perPage: number;   // offset MongoDB utilisé ( (page-1) * limit )
};

type Ingredient = {
	quantity: string;
	name: string;
	type: string;
};

type Utensil = {
	name: string;
	type: string;
};

type Recipe = {
	_id: string;
	title: string;
	description: string;
	preparation_time: number;
	origin: string;
	steps: string[];
	ingredients: Ingredient[];
	utensils: Utensil[];
	tags: string[];
	author_id: string;
	author_name?: string;
	image_url?: string;
	creation_date: string;
};

type Review = {
	recipes_id: string;
	user_id: string;
	comment: string;
	notation: number;
	publication_date: string;
	nb_likes: number;
};

type ReviewWithRecipe = Review & { recipe: Recipe | Recipe[] };

type RatingWithRecipe = {
	recipe: Recipe | Recipe[];
	rating: number; // moyenne des notations sur la période filtrée
};

type User = {
	_id: string;
	username: string;
	email: string;
	registration_date: string;
};

type UserWithAverageRating = {
	user: User;
	averageRating: number;
};

type Tag = {
	_id: string;
	name: string;
};
```

---

## 👤 Module Auth (`/auth`)

| Méthode | Route       | Auth requise | Description                                 |
| ------- | ----------- | ------------ | ------------------------------------------- |
| POST    | `/login`    | Non          | Génère un JWT pour un utilisateur existant. |
| POST    | `/register` | Non          | Crée un compte utilisateur.                 |

### POST `/auth/login`

- **Query parameters** : aucun.
- **Body JSON** : `{ username: string, password: string }`
- **Réponse 200**

```ts
type LoginResponse = {
	token: string;
};
```

### POST `/auth/register`

- **Query parameters** : aucun.
- **Body JSON** : `{ username: string, password: string, email: string }`
- **Réponse 201**

```ts
type RegisterResponse = {
	message: "User registered successfully";
};
```

---

## 🍲 Module Recipes (`/recipes`)

| Méthode | Route  | Auth requise | Description                                 |
| ------- | ------ | ------------ | ------------------------------------------- |
| GET     | `/`    | Non          | Liste paginée avec filtres.                 |
| POST    | `/`    | Oui          | Création d'une recette (image optionnelle). |
| GET     | `/:id` | Non          | Récupère une recette par ID.                |
| PUT     | `/:id` | Oui          | Met à jour une recette existante.           |
| DELETE  | `/:id` | Oui          | Supprime une recette.                       |

### GET `/recipes`

**Query parameters**

| Nom                  | Type             | Requis | Description                                                              |
| -------------------- | ---------------- | ------ | ------------------------------------------------------------------------ |
| `page`               | number (>=1)     | Non    | Numéro de page (12 éléments/page).                                       |
| `title`              | string           | Non    | Filtre par titre partiel (regex insensible à la casse).                  |
| `tags`               | string (CSV)     | Non    | Liste de tags (`tags=rapide,végétarien`) qui doivent tous être présents. |
| `author_id`          | string           | Non    | Filtre par identifiant auteur (regex).                                   |
| `maxPreparationTime` | number (minutes) | Non    | Temps de préparation maximal.                                            |
| `ingredients`        | string (CSV)     | Non    | Doit contenir **tous** les ingrédients listés.                           |

**Réponse 200**

```ts
type ListRecipesResponse = {
	data: Recipe[];
	pagination: Pagination & { total: number; perPage: number }; // perPage = nb de pages calculé côté API
};
```

### POST `/recipes`

- **Auth** : `Bearer` obligatoire
- **Query parameters** : aucun
- **Body** : `multipart/form-data` avec
	- `image` *(optionnel)* : JPEG/PNG/GIF ≤ 5 Mo
	- champs texte : `title`, `description`, `preparation_time`, `origin`
	- champs JSON sérialisés (string) : `steps`, `ingredients`, `utensils`, `tags`

**Réponse 201**

```ts
type CreateRecipeResponse = {
	data: Recipe;
};
```

### GET `/recipes/:id`

- **Paramètres de chemin** : `id` (string MongoDB)
- **Query parameters** : aucun

**Réponse 200** (le contrôleur renvoie actuellement un tableau contenant la recette demandée)

```ts
type GetRecipeResponse = {
	data: Recipe[]; // généralement un seul élément
};
```

### PUT `/recipes/:id`

- **Auth** : `Bearer` obligatoire
- **Body** : mêmes champs que POST, tous optionnels (les champs non fournis conservent la valeur existante). Une nouvelle image remplace l'ancienne.
- **Query parameters** : aucun

```ts
type UpdateRecipeResponse = {
	data: Recipe;
};
```

### DELETE `/recipes/:id`

- **Auth** : `Bearer` obligatoire
- **Query parameters** : aucun

```ts
type DeleteRecipeResponse = {
	data: { id: string };
};
```

---

## Module Reviews (`/reviews`)

| Méthode | Route               | Auth requise | Description                                             |
| ------- | ------------------- | ------------ | ------------------------------------------------------- |
| GET     | `/users/:userId`    | Non          | Avis d'un utilisateur, tri optionnel et pagination.     |
| GET     | `/best-rated`       | Non          | Recettes les mieux notées pour un mois donné.           |
| GET     | `/users/low-rating` | Non          | Top 10 des utilisateurs aux notations les plus faibles. |

### GET `/reviews/users/:userId`

**Query parameters**

| Nom              | Type                                 | Requis | Description                                                  |
| ---------------- | ------------------------------------ | ------ | ------------------------------------------------------------ |
| `page`           | number (>=1)                         | Non    | Pagination (12 avis/page).                                   |
| `sort`           | enum `notation` \| `publicationDate` | Non    | Tri décroissant selon la note ou la date de publication.     |
| `includeRecipes` | boolean (`true`/`false` ou `1`/`0`)  | Non    | Si `true`, joint chaque avis avec la recette correspondante. |

**Réponse 200**

```ts
type ListUserReviewsResponse = {
	data: (Review | ReviewWithRecipe)[];
	pagination: Pagination;
};
```

### GET `/reviews/best-rated`

**Query parameters**

| Nom     | Type   | Requis | Description                   |
| ------- | ------ | ------ | ----------------------------- |
| `month` | number | Oui    | Mois ciblé (1-12).            |
| `year`  | number | Oui    | Année (ex. 2024).             |
| `page`  | number | Non    | Pagination (12 entrées/page). |

**Réponse 200**

```ts
type BestRatedResponse = {
	data: RatingWithRecipe[];
	pagination: Pagination;
};
```

### GET `/reviews/users/low-rating`

- **Query parameters** : aucun

```ts
type LowRatingUsersResponse = {
	data: UserWithAverageRating[];
};
```

---

## Module Tags (`/tags`)

| Méthode | Route | Auth requise | Description                             |
| ------- | ----- | ------------ | --------------------------------------- |
| GET     | `/`   | Non          | Retourne la liste des tags disponibles. |

- **Query parameters** : aucun

```ts
type TagsResponse = {
	data: Tag[];
};
```

---

## Module Me (`/me`)

| Méthode | Route | Auth requise | Description                            |
| ------- | ----- | ------------ | -------------------------------------- |
| GET     | `/`   | Oui          | Récupère l'utilisateur associé au JWT. |

- **Query parameters** : aucun
- **Réponse 200**

```ts
type MeResponse = {
	user: User;
};
```
