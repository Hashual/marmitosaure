# Service de Recherche Multi-Base (MongoDB + Cassandra)

## Architecture du Service de Recherche

### Flux de données :

1. **Recherche principale** : MongoDB pour les recettes selon les critères
2. **Enrichissement social** : Cassandra pour les statistiques d'avis et likes
3. **Tri et filtrage** : Combinaison des données pour le classement final

## 1. Recherche par ingrédients avec popularité

### Étape 1 : Recherche dans MongoDB

```javascript
// Recherche des recettes par ingrédients
db.recettes.aggregate([
  {
    $match: {
      "ingredients.nom": {
        $in: ["tomate", "mozzarella", "basilic"],
      },
    },
  },
  {
    $addFields: {
      // Calculer le score de correspondance des ingrédients
      ingredient_match_score: {
        $size: {
          $filter: {
            input: "$ingredients",
            cond: {
              $in: ["$$this.nom", ["tomate", "mozzarella", "basilic"]],
            },
          },
        },
      },
    },
  },
  {
    $project: {
      _id: 1,
      titre: 1,
      description: 1,
      ingredients: 1,
      tags: 1,
      auteur_id: 1,
      date_creation: 1,
      ingredient_match_score: 1,
    },
  },
]);
```

### Étape 2 : Enrichissement avec données Cassandra

```sql
-- Pour chaque recette trouvée, récupérer les statistiques
SELECT recette_id, nombre_avis, nombre_likes
FROM Compteurs_Recettes
WHERE recette_id IN (liste_des_recettes_trouvees);

-- Récupérer les avis récents pour évaluation qualité
SELECT recette_id, user_id, commentaire, date_publication
FROM Avis_Par_Date
WHERE recette_id IN (liste_des_recettes_trouvees)
LIMIT 5;
```

### Étape 3 : Calcul du score de popularité

```javascript
// Algorithme de scoring (côté application)
function calculatePopularityScore(recette, stats, recentReviews) {
  const baseScore = recette.ingredient_match_score * 10;
  const likesScore = (stats.nombre_likes || 0) * 2;
  const reviewsScore = (stats.nombre_avis || 0) * 1.5;
  const recentActivity = recentReviews.length * 3;
  const ageBonus = calculateRecencyBonus(recette.date_creation);

  return baseScore + likesScore + reviewsScore + recentActivity + ageBonus;
}
```

## 2. Recherche par critères d'avis

### Recherche des recettes avec note moyenne élevée

```sql
-- Étape 1 : Trouver les recettes avec beaucoup d'avis positifs
SELECT recette_id, COUNT(*) as total_avis
FROM Avis
WHERE commentaire LIKE '%excellent%'
   OR commentaire LIKE '%délicieux%'
   OR commentaire LIKE '%parfait%'
GROUP BY recette_id
HAVING COUNT(*) >= 3
ORDER BY COUNT(*) DESC;
```

```javascript
// Étape 2 : Récupérer les détails depuis MongoDB
db.recettes
  .find({
    _id: { $in: liste_recettes_avec_bons_avis },
  })
  .sort({ date_creation: -1 });
```

### Recherche par mots-clés dans les avis

```sql
-- Recherche textuelle dans les commentaires
SELECT DISTINCT recette_id, commentaire, date_publication
FROM Avis
WHERE commentaire LIKE '%facile%'
   OR commentaire LIKE '%rapide%'
   OR commentaire LIKE '%simple%'
ORDER BY date_publication DESC;
```

## 3. Recherche par popularité et tendances

### Recettes les plus likées récemment

```sql
-- Recettes avec le plus de likes dans les 7 derniers jours
SELECT recette_id, COUNT(*) as likes_recents
FROM Likes_Par_Date
WHERE date_like >= dateadd(day, -7, now())
GROUP BY recette_id
ORDER BY COUNT(*) DESC
LIMIT 20;
```

### Recettes en tendance (combinaison activité récente)

```sql
-- Activité récente (avis + likes)
WITH activite_recente AS (
  SELECT recette_id, COUNT(*) as activite
  FROM (
    SELECT recette_id FROM Avis WHERE date_publication >= dateadd(day, -3, now())
    UNION ALL
    SELECT recette_id FROM Likes WHERE date_like >= dateadd(day, -3, now())
  )
  GROUP BY recette_id
)
SELECT recette_id, activite FROM activite_recente
ORDER BY activite DESC;
```

## 4. Recherche complexe multi-critères

### Combinaison ingrédients + popularité + avis

```javascript
db.recettes.aggregate([
  // 1. Filtrage par ingrédients
  {
    $match: {
      $and: [
        { "ingredients.nom": { $in: ingredients_recherches } },
        { tags: { $in: tags_souhaites } },
        { date_creation: { $gte: new Date(date_limite) } },
      ],
    },
  },

  // 2. Scoring des correspondances
  {
    $addFields: {
      ingredient_score: {
        $size: {
          $setIntersection: ["$ingredients.nom", ingredients_recherches],
        },
      },
      tag_score: {
        $size: {
          $setIntersection: ["$tags", tags_souhaites],
        },
      },
    },
  },

  // 3. Lookup avec informations auteur (optionnel)
  {
    $lookup: {
      from: "utilisateurs",
      localField: "auteur_id",
      foreignField: "_id",
      as: "auteur",
    },
  },

  // 4. Projection finale
  {
    $project: {
      titre: 1,
      description: 1,
      ingredients: 1,
      tags: 1,
      date_creation: 1,
      auteur: { $arrayElemAt: ["$auteur.nom_utilisateur", 0] },
      ingredient_score: 1,
      tag_score: 1,
      relevance_score: { $add: ["$ingredient_score", "$tag_score"] },
    },
  },

  // 5. Tri par pertinence
  { $sort: { relevance_score: -1, date_creation: -1 } },
  { $limit: 50 },
]);
```

## 5. Recherche avec filtres d'exclusion

### Exclusion par allergènes

```javascript
// Recherche excluant certains ingrédients (allergènes)
db.recettes
  .find({
    $and: [
      { "ingredients.nom": { $in: ingredients_souhaites } },
      { "ingredients.nom": { $nin: allergenes_a_exclure } },
      { tags: { $ne: "contient_gluten" } },
    ],
  })
  .sort({ date_creation: -1 });
```

### Exclusion par avis négatifs

```sql
-- Identifier les recettes avec trop d'avis négatifs
SELECT recette_id, COUNT(*) as avis_negatifs
FROM Avis
WHERE commentaire LIKE '%mauvais%'
   OR commentaire LIKE '%décevant%'
   OR commentaire LIKE '%pas bon%'
GROUP BY recette_id
HAVING COUNT(*) >= 2;
```

```javascript
// Exclure ces recettes de la recherche MongoDB
db.recettes.find({
  $and: [
    { criteres_de_recherche },
    { _id: { $nin: recettes_avec_avis_negatifs } },
  ],
});
```

## 6. Recherche géographique par origine

### Recherche par cuisine régionale

```javascript
// Recherche par origine avec bonus de popularité locale
db.recettes.aggregate([
  {
    $match: {
      origine: { $in: ["France", "Italie", "Espagne"] },
    },
  },
  {
    $lookup: {
      from: "statistiques_par_region", // Collection calculée périodiquement
      localField: "origine",
      foreignField: "region",
      as: "stats_region",
    },
  },
  {
    $addFields: {
      popularite_regionale: {
        $arrayElemAt: ["$stats_region.score_popularite", 0],
      },
    },
  },
  { $sort: { popularite_regionale: -1 } },
]);
```

## 7. Recherche saisonnière

### Recettes adaptées à la saison

```javascript
// Recherche avec bonus saisonnier
db.recettes.aggregate([
  {
    $addFields: {
      saison_score: {
        $switch: {
          branches: [
            {
              case: {
                $gt: [
                  {
                    $size: {
                      $setIntersection: [
                        "$ingredients.nom",
                        ingredients_automne,
                      ],
                    },
                  },
                  0,
                ],
              },
              then: 5,
            },
            {
              case: { $in: ["automne", "$tags"] },
              then: 3,
            },
          ],
          default: 0,
        },
      },
    },
  },
  { $sort: { saison_score: -1, date_creation: -1 } },
]);
```

## 8. Recherche par temps de préparation

### Recherche optimisée par durée

```javascript
// Recherche par tranche de temps avec parsing intelligent
db.recettes.aggregate([
  {
    $addFields: {
      temps_minutes: {
        $switch: {
          branches: [
            {
              case: {
                $regexMatch: {
                  input: "$temps_de_préparation",
                  regex: /(\d+)h/,
                },
              },
              then: {
                $multiply: [
                  {
                    $toInt: {
                      $arrayElemAt: [
                        {
                          $regexFindAll: {
                            input: "$temps_de_préparation",
                            regex: /(\d+)h/,
                          },
                        },
                        0,
                      ],
                    },
                  },
                  60,
                ],
              },
            },
            {
              case: {
                $regexMatch: {
                  input: "$temps_de_préparation",
                  regex: /(\d+)min/,
                },
              },
              then: {
                $toInt: {
                  $arrayElemAt: [
                    {
                      $regexFindAll: {
                        input: "$temps_de_préparation",
                        regex: /(\d+)min/,
                      },
                    },
                    0,
                  ],
                },
              },
            },
          ],
          default: 999,
        },
      },
    },
  },
  {
    $match: {
      temps_minutes: { $lte: temps_maximum_souhaite },
    },
  },
  { $sort: { temps_minutes: 1 } },
]);
```

## 9. Index recommandés pour optimiser les recherches

### Index MongoDB

```javascript
// Index composés pour recherches fréquentes
db.recettes.createIndex({ "ingredients.nom": 1, tags: 1, date_creation: -1 });
db.recettes.createIndex({ origine: 1, date_creation: -1 });
db.recettes.createIndex({ auteur_id: 1, date_creation: -1 });

// Index de recherche textuelle
db.recettes.createIndex({
  titre: "text",
  description: "text",
  "ingredients.nom": "text",
});

// Index géospatial si localisation ajoutée
db.recettes.createIndex({ localisation: "2dsphere" });
```

### Index Cassandra

```sql
-- Index pour recherches par commentaires
CREATE INDEX ON Avis (commentaire);

-- Index pour recherches temporelles
CREATE INDEX ON Likes_Par_Date (date_like);
CREATE INDEX ON Avis_Par_Date (date_publication);

-- Index pour statistiques
CREATE INDEX ON Compteurs_Recettes (nombre_likes);
CREATE INDEX ON Compteurs_Recettes (nombre_avis);
```

## 10. Stratégies de cache pour la recherche

### Cache des résultats fréquents (Redis)

```redis
# Cache des recherches populaires
SETEX search_cache:ingredients:tomate,basilic:tags:italien 3600 "résultats_json"

# Cache des tendances (recalculé toutes les heures)
SETEX trending_recipes:all 3600 "liste_recettes_tendance"
SETEX trending_recipes:italien 3600 "liste_recettes_italiennes_tendance"

# Cache des statistiques agrégées
SETEX recipe_stats:123 7200 '{"likes": 45, "avis": 12, "score": 4.2}'
```

### Cache intelligent par profil utilisateur

```redis
# Cache personnalisé par utilisateur
SETEX user_search_cache:user123:derniere_recherche 1800 "résultats_personnalisés"

# Cache des recommandations basées sur l'historique
SETEX user_recommendations:user123 3600 "recettes_recommandées"
```

Ce service de recherche multi-base permet une recherche très riche en combinant la flexibilité de MongoDB avec la performance des statistiques sociales de Cassandra.
