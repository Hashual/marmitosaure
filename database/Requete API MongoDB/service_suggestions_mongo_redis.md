# Service de Suggestions (MongoDB + Redis)

## Architecture du Service de Suggestions

### Flux de données :

1. **Préférences utilisateur** : Redis pour le profil et l'historique
2. **Base de recettes** : MongoDB pour les contenus disponibles
3. **Algorithmes de recommandation** : Scoring intelligent multi-critères
4. **Cache des suggestions** : Redis pour les performances

## 1. Suggestions basées sur les préférences utilisateur

### Étape 1 : Récupération du profil utilisateur (Redis)

```redis
# Récupérer les préférences utilisateur
HGETALL prefs:123

# Récupérer l'historique des recherches
LRANGE user_search_history:123 0 9

# Récupérer les recettes likées récemment
SMEMBERS user_tags:123
SMEMBERS user_allergenes:123
```

### Étape 2 : Recherche personnalisée (MongoDB)

```javascript
// Algorithme de suggestion basé sur les préférences
db.recettes.aggregate([
  {
    $match: {
      $and: [
        // Inclure les tags préférés
        { tags: { $in: tags_preferes_utilisateur } },
        // Exclure les allergènes
        { "ingredients.nom": { $nin: allergenes_utilisateur } },
        // Exclure les recettes déjà vues récemment
        { _id: { $nin: recettes_vues_recemment } },
      ],
    },
  },
  {
    $addFields: {
      // Score basé sur les préférences
      preference_score: {
        $add: [
          // Score des tags correspondants
          {
            $multiply: [
              {
                $size: {
                  $setIntersection: ["$tags", tags_preferes_utilisateur],
                },
              },
              10,
            ],
          },
          // Score des ingrédients préférés
          {
            $multiply: [
              {
                $size: {
                  $setIntersection: ["$ingredients.nom", ingredients_preferes],
                },
              },
              5,
            ],
          },
          // Bonus pour le type de recette préféré
          {
            $cond: [{ $in: [type_recette_prefere, "$tags"] }, 15, 0],
          },
        ],
      },
      // Score de fraîcheur (recettes récentes favorisées)
      freshness_score: {
        $divide: [
          { $subtract: [new Date(), "$date_creation"] },
          86400000, // millisecondes par jour
        ],
      },
    },
  },
  {
    $addFields: {
      // Score final combiné
      final_score: {
        $subtract: [
          "$preference_score",
          { $multiply: ["$freshness_score", 0.1] }, // Pénalité légère pour l'ancienneté
        ],
      },
    },
  },
  { $sort: { final_score: -1 } },
  { $limit: 20 },
]);
```

## 2. Suggestions collaborative filtering

### Utilisateurs similaires (Redis)

```redis
# Stocker les similarités entre utilisateurs (calculées périodiquement)
ZADD user_similarity:123 0.85 user456 0.78 user789 0.72 user012

# Récupérer les utilisateurs les plus similaires
ZREVRANGE user_similarity:123 0 4 WITHSCORES
```

### Suggestions basées sur des utilisateurs similaires

```javascript
// Trouver les recettes aimées par des utilisateurs similaires
db.recettes.aggregate([
  {
    $match: {
      // Recettes likées par des utilisateurs similaires
      likes: { $in: utilisateurs_similaires },
    },
  },
  {
    $addFields: {
      similarity_score: {
        $size: {
          $setIntersection: ["$likes", utilisateurs_similaires],
        },
      },
    },
  },
  {
    $match: {
      // Exclure les recettes déjà likées par l'utilisateur actuel
      likes: { $ne: user_id_actuel },
    },
  },
  { $sort: { similarity_score: -1 } },
  { $limit: 15 },
]);
```

## 3. Suggestions basées sur l'historique

### Analyse de l'historique des consultations (Redis)

```redis
# Stocker l'historique des recettes consultées
LPUSH user_history:123 "recette_456"
LTRIM user_history:123 0 49  # Garder les 50 dernières

# Analyser les patterns de consultation
LRANGE user_history:123 0 -1
```

### Suggestions "Plus de recettes comme celle-ci"

```javascript
// Basé sur une recette spécifique consultée
function getSimilarRecipes(recetteId) {
  return db.recettes.aggregate([
    {
      $match: { _id: { $ne: recetteId } },
    },
    {
      $lookup: {
        from: "recettes",
        let: { current_id: "$_id" },
        pipeline: [
          { $match: { _id: recetteId } },
          {
            $project: {
              reference_tags: "$tags",
              reference_ingredients: "$ingredients.nom",
              reference_origine: "$origine",
            },
          },
        ],
        as: "reference",
      },
    },
    {
      $addFields: {
        reference_data: { $arrayElemAt: ["$reference", 0] },
        similarity_score: {
          $add: [
            // Score des tags communs
            {
              $multiply: [
                {
                  $size: {
                    $setIntersection: [
                      "$tags",
                      { $arrayElemAt: ["$reference.reference_tags", 0] },
                    ],
                  },
                },
                3,
              ],
            },
            // Score des ingrédients communs
            {
              $multiply: [
                {
                  $size: {
                    $setIntersection: [
                      "$ingredients.nom",
                      { $arrayElemAt: ["$reference.reference_ingredients", 0] },
                    ],
                  },
                },
                2,
              ],
            },
            // Bonus pour même origine
            {
              $cond: [
                {
                  $eq: [
                    "$origine",
                    { $arrayElemAt: ["$reference.reference_origine", 0] },
                  ],
                },
                5,
                0,
              ],
            },
          ],
        },
      },
    },
    {
      $match: { similarity_score: { $gt: 0 } },
    },
    { $sort: { similarity_score: -1 } },
    { $limit: 10 },
  ]);
}
```

## 4. Suggestions saisonnières et contextuelles

### Suggestions selon la saison

```javascript
// Suggestions adaptées à la saison actuelle
const saisons = {
  printemps: ["léger", "frais", "légumes_primeur"],
  été: ["frais", "grillé", "salade", "fruits"],
  automne: ["réconfortant", "mijoté", "courge"],
  hiver: ["chaud", "réconfortant", "soupe"],
};

function getSuggestionsSeasonales(saison_actuelle) {
  return db.recettes.aggregate([
    {
      $match: {
        $or: [
          { tags: { $in: saisons[saison_actuelle] } },
          {
            "ingredients.nom": { $in: ingredients_saisoniers[saison_actuelle] },
          },
        ],
      },
    },
    {
      $addFields: {
        saison_score: {
          $add: [
            {
              $size: { $setIntersection: ["$tags", saisons[saison_actuelle]] },
            },
            {
              $size: {
                $setIntersection: [
                  "$ingredients.nom",
                  ingredients_saisoniers[saison_actuelle],
                ],
              },
            },
          ],
        },
      },
    },
    { $sort: { saison_score: -1, date_creation: -1 } },
    { $limit: 15 },
  ]);
}
```

### Suggestions selon l'heure

```redis
# Cache des suggestions par moment de la journée
SETEX suggestions:breakfast:user123 3600 "recettes_petit_dejeuner"
SETEX suggestions:lunch:user123 3600 "recettes_dejeuner"
SETEX suggestions:dinner:user123 3600 "recettes_diner"
```

```javascript
// Logique de suggestion par moment
function getSuggestionsByTime(heure_actuelle, user_id) {
  let type_repas;
  if (heure_actuelle >= 6 && heure_actuelle <= 10) {
    type_repas = "petit-déjeuner";
  } else if (heure_actuelle >= 11 && heure_actuelle <= 14) {
    type_repas = "déjeuner";
  } else if (heure_actuelle >= 18 && heure_actuelle <= 21) {
    type_repas = "dîner";
  } else {
    type_repas = "collation";
  }

  return db.recettes
    .find({
      $or: [
        { tags: type_repas },
        { tags: { $in: tags_par_repas[type_repas] } },
      ],
    })
    .sort({ date_creation: -1 })
    .limit(10);
}
```

## 5. Suggestions trending et populaires

### Cache des tendances (Redis)

```redis
# Tendances globales (recalculées toutes les heures)
SETEX trending:global:1h 3600 '[{"id":"rec1","score":95},{"id":"rec2","score":87}]'
SETEX trending:global:24h 86400 '[{"id":"rec3","score":156}]'

# Tendances par catégorie
SETEX trending:italien:1h 3600 '[{"id":"rec_ital1","score":78}]'
SETEX trending:vegetarien:1h 3600 '[{"id":"rec_veg1","score":92}]'
```

### Calcul des tendances (job périodique)

```javascript
// Script de calcul des tendances (à exécuter toutes les heures)
function calculateTrendingRecipes() {
  return db.recettes.aggregate([
    {
      $lookup: {
        from: "interactions_recentes", // Collection calculée depuis Cassandra
        localField: "_id",
        foreignField: "recette_id",
        as: "interactions",
      },
    },
    {
      $addFields: {
        trending_score: {
          $add: [
            // Likes récents (24h)
            {
              $multiply: [{ $arrayElemAt: ["$interactions.likes_24h", 0] }, 3],
            },
            // Avis récents (24h)
            { $multiply: [{ $arrayElemAt: ["$interactions.avis_24h", 0] }, 5] },
            // Vues récentes (24h)
            { $multiply: [{ $arrayElemAt: ["$interactions.vues_24h", 0] }, 1] },
            // Bonus pour nouveauté (7 derniers jours)
            {
              $cond: [
                {
                  $gte: [
                    "$date_creation",
                    { $subtract: [new Date(), 7 * 24 * 60 * 60 * 1000] },
                  ],
                },
                10,
                0,
              ],
            },
          ],
        },
      },
    },
    { $sort: { trending_score: -1 } },
    { $limit: 50 },
  ]);
}
```

## 6. Suggestions par catégories d'utilisateurs

### Profils d'utilisateurs (Redis)

```redis
# Classification automatique des utilisateurs
HSET user_profile:123 "type" "vegetarien_aventurier"
HSET user_profile:123 "niveau_cuisine" "intermediate"
HSET user_profile:123 "temps_disponible" "court"
HSET user_profile:123 "budget" "economique"
```

### Suggestions adaptées au profil

```javascript
// Suggestions par profil utilisateur
const profiles_suggestions = {
  vegetarien_aventurier: {
    tags: ["végétarien", "vegan", "exotique", "fusion"],
    exclude_tags: ["viande", "poisson"],
    boost_score: 10,
  },
  amateur_italien: {
    tags: ["italien", "méditerranéen"],
    boost_origine: "Italie",
    boost_score: 15,
  },
  pressé_semaine: {
    temps_max: "30min",
    tags: ["rapide", "simple", "batch-cooking"],
    boost_score: 12,
  },
};

function getSuggestionsByProfile(user_profile) {
  const profile_config = profiles_suggestions[user_profile.type];

  return db.recettes.aggregate([
    {
      $match: {
        $and: [
          { tags: { $in: profile_config.tags } },
          { tags: { $nin: profile_config.exclude_tags || [] } },
          profile_config.temps_max
            ? { temps_de_préparation: { $regex: profile_config.temps_max } }
            : {},
        ],
      },
    },
    {
      $addFields: {
        profile_score: {
          $add: [
            // Score des tags du profil
            {
              $multiply: [
                { $size: { $setIntersection: ["$tags", profile_config.tags] } },
                profile_config.boost_score,
              ],
            },
            // Bonus pour l'origine si définie
            (profile_config.boost_origine && {
              $cond: [
                { $eq: ["$origine", profile_config.boost_origine] },
                profile_config.boost_score,
                0,
              ],
            }) ||
              0,
          ],
        },
      },
    },
    { $sort: { profile_score: -1 } },
    { $limit: 15 },
  ]);
}
```

## 7. Machine Learning et amélioration continue

### Collecte de données pour l'apprentissage (Redis)

```redis
# Feedback utilisateur sur les suggestions
LPUSH user_feedback:123 '{"suggestion_id":"sug_456","action":"clicked","timestamp":1632847200}'
LPUSH user_feedback:123 '{"suggestion_id":"sug_789","action":"liked","timestamp":1632847300}'
LPUSH user_feedback:123 '{"suggestion_id":"sug_012","action":"ignored","timestamp":1632847400}'

# Métriques de performance des suggestions
HINCRBY suggestion_metrics:global clicked 1
HINCRBY suggestion_metrics:global shown 1
HINCRBY suggestion_metrics:vegetarien clicked 1
```

### Analyse des patterns de comportement

```javascript
// Analyse des préférences évolutives
function analyzeUserBehavior(user_id, period_days = 30) {
  return db.user_interactions.aggregate([
    {
      $match: {
        user_id: user_id,
        timestamp: {
          $gte: new Date(Date.now() - period_days * 24 * 60 * 60 * 1000),
        },
      },
    },
    {
      $group: {
        _id: "$action_type",
        recettes: { $addToSet: "$recette_id" },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "recettes",
        localField: "recettes",
        foreignField: "_id",
        as: "recette_details",
      },
    },
    {
      $unwind: "$recette_details",
    },
    {
      $group: {
        _id: "$_id",
        tags_frequents: { $addToSet: "$recette_details.tags" },
        origines_preferees: { $addToSet: "$recette_details.origine" },
        total_interactions: { $first: "$count" },
      },
    },
  ]);
}
```

## 8. Cache intelligent des suggestions

### Stratégie de cache multicouche (Redis)

```redis
# Cache niveau 1 : Suggestions personnalisées fraîches (15 min)
SETEX suggestions:user:123:fresh 900 "suggestions_ultra_personnalisées"

# Cache niveau 2 : Suggestions par profil (1 heure)
SETEX suggestions:profile:vegetarien_aventurier 3600 "suggestions_profil"

# Cache niveau 3 : Suggestions génériques par catégorie (6 heures)
SETEX suggestions:category:italien 21600 "suggestions_italiennes"

# Cache niveau 4 : Suggestions par défaut (24 heures)
SETEX suggestions:default 86400 "suggestions_populaires_globales"
```

### Algorithme de cache intelligent

```javascript
async function getSuggestions(user_id) {
  const redis = RedisClient.getInstance();

  // Niveau 1 : Cache personnalisé
  let suggestions = await redis.get(`suggestions:user:${user_id}:fresh`);
  if (suggestions) {
    return JSON.parse(suggestions);
  }

  // Niveau 2 : Cache par profil
  const user_profile = await redis.hget(`user_profile:${user_id}`, "type");
  if (user_profile) {
    suggestions = await redis.get(`suggestions:profile:${user_profile}`);
    if (suggestions) {
      return JSON.parse(suggestions);
    }
  }

  // Niveau 3 : Cache par préférences principales
  const main_tags = await redis.smembers(`user_tags:${user_id}`);
  if (main_tags.length > 0) {
    suggestions = await redis.get(`suggestions:category:${main_tags[0]}`);
    if (suggestions) {
      return JSON.parse(suggestions);
    }
  }

  // Niveau 4 : Suggestions par défaut
  suggestions = await redis.get("suggestions:default");
  if (suggestions) {
    return JSON.parse(suggestions);
  }

  // Fallback : Générer en temps réel
  return await generateFreshSuggestions(user_id);
}
```

## 9. Suggestions contextuelles avancées

### Suggestions météo-dépendantes

```redis
# Cache des suggestions par météo
SETEX suggestions:weather:rainy 7200 "recettes_réconfortantes"
SETEX suggestions:weather:hot 7200 "recettes_fraîches"
SETEX suggestions:weather:cold 7200 "recettes_chaudes"
```

### Suggestions par événements/fêtes

```javascript
// Suggestions pour occasions spéciales
const occasion_suggestions = {
  noel: ["festif", "traditionnel", "dessert", "famille"],
  saint_valentin: ["romantique", "dessert", "sophistiqué"],
  halloween: ["orange", "citrouille", "terrifiant", "amusant"],
  paques: ["agneau", "chocolat", "printemps", "brunch"],
};

function getOccasionSuggestions(occasion) {
  return db.recettes
    .find({
      $or: [
        { tags: { $in: occasion_suggestions[occasion] } },
        { titre: { $regex: new RegExp(occasion, "i") } },
      ],
    })
    .sort({ date_creation: -1 })
    .limit(20);
}
```

## 10. API de suggestions unifiée

### Structure de réponse standardisée

```javascript
// Format de réponse unifié pour toutes les suggestions
const suggestionResponse = {
  success: true,
  data: {
    suggestions: [
      {
        recette_id: "rec_123",
        titre: "Pizza Margherita",
        description: "...",
        score: 95,
        raison: "Basé sur vos préférences italiennes",
        type_suggestion: "preference_based",
        ingredients_highlights: ["tomate", "mozzarella"],
        tags_matched: ["italien", "rapide"],
      },
    ],
    metadata: {
      algorithm_used: "hybrid",
      cache_level: "fresh",
      total_suggestions: 20,
      user_profile: "vegetarien_aventurier",
    },
  },
};
```
