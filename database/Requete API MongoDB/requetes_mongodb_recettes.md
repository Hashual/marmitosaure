## 1. POST /recettes - Ajouter une nouvelle recette

### Requête MongoDB

```javascript
db.recettes.insertOne({
  titre: "Pizza Margherita",
  description: "Pizza simple et délicieuse avec tomate et mozzarella",
  temps_de_préparation: "1h",
  etapes: [
    "Préparer la pâte à pizza",
    "Étaler la pâte sur une plaque",
    "Ajouter la sauce tomate",
    "Mettre la mozzarella",
    "Cuire au four à 220°C pendant 15 minutes",
  ],
  ustensiles: [
    { nom: "Four", categorie: "Cuisson" },
    { nom: "Plaque de cuisson", categorie: "Cuisson" },
    { nom: "Roulette à pizza", categorie: "Découpe" },
    { nom: "Plan de travail", categorie: "Préparation" },
    { nom: "Bol", categorie: "Mixage" },
  ],
  tags: ["italien", "rapide", "végétarien"],
  origine: "Italie",
  auteur_id: "user_123",
  date_creation: new Date(),
  ingredients: [
    { id: 1, nom: "Tomate", quantite: "200g" },
    { id: 2, nom: "Mozzarella", quantite: "150g" },
    { id: 3, nom: "Farine", quantite: "500g" },
    { id: 4, nom: "Levure", quantite: "1 sachet" },
  ],
  avis: [],
  likes: [],
  suggestions: [],
});
```

### Exemple de réponse après insertion

```javascript
// Récupérer la recette créée avec son ID généré
db.recettes.findOne({ _id: ObjectId("id_généré_par_mongodb") });
```

## 2. GET /recettes/{id} - Récupérer une recette par ID

### Requête MongoDB

```javascript
// Recherche par ObjectId MongoDB
db.recettes.findOne({ _id: ObjectId("recette_id") });

// Ou si vous utilisez des IDs personnalisés (string)
db.recettes.findOne({ _id: "recette_456" });
```

### Avec agrégation pour enrichir les données

```javascript
db.recettes.aggregate([
  { $match: { _id: ObjectId("recette_id") } },
  {
    $lookup: {
      from: "utilisateurs",
      localField: "auteur_id",
      foreignField: "_id",
      as: "auteur",
    },
  },
  {
    $lookup: {
      from: "ingredients",
      localField: "ingredients.id",
      foreignField: "_id",
      as: "details_ingredients",
    },
  },
  { $unwind: { path: "$auteur", preserveNullAndEmptyArrays: true } },
]);
```

## 3. PUT /recettes/{id} - Mettre à jour une recette

### Requête MongoDB - Mise à jour complète

```javascript
db.recettes.updateOne(
  { _id: ObjectId("recette_id") },
  {
    $set: {
      titre: "Pizza Margherita Améliorée",
      description: "Pizza simple et délicieuse avec basilic frais",
      temps_de_préparation: "1h15",
      etapes: [
        "Préparer la pâte à pizza",
        "Laisser reposer 30 minutes",
        "Étaler la pâte sur une plaque",
        "Ajouter la sauce tomate",
        "Mettre la mozzarella",
        "Ajouter le basilic frais",
        "Cuire au four à 220°C pendant 15 minutes",
      ],
      tags: ["italien", "rapide", "végétarien", "basilic"],
      ingredients: [
        { id: 1, nom: "Tomate", quantite: "200g" },
        { id: 2, nom: "Mozzarella", quantite: "150g" },
        { id: 3, nom: "Farine", quantite: "500g" },
        { id: 4, nom: "Levure", quantite: "1 sachet" },
        { id: 5, nom: "Basilic", quantite: "quelques feuilles" },
      ],
    },
  }
);
```

### Mise à jour partielle (exemple: ajouter un tag)

```javascript
db.recettes.updateOne(
  { _id: ObjectId("recette_id") },
  { $addToSet: { tags: "nouveau_tag" } }
);
```

### Ajouter un avis

```javascript
db.recettes.updateOne(
  { _id: ObjectId("recette_id") },
  {
    $push: {
      avis: {
        user_id: "user_789",
        commentaire: "Excellente recette !",
        note: 5,
        date: new Date(),
      },
    },
  }
);
```

### Ajouter un like

```javascript
db.recettes.updateOne(
  { _id: ObjectId("recette_id") },
  { $addToSet: { likes: "user_111" } }
);
```

## 4. GET /recettes/search - Rechercher des recettes

### 4.1 Recherche par ingrédient

```javascript
// Recherche par nom d'ingrédient
db.recettes.find({
  "ingredients.nom": { $regex: "tomate", $options: "i" },
});

// Recherche par ID d'ingrédient
db.recettes.find({
  "ingredients.id": 1,
});

// Recherche avec plusieurs ingrédients
db.recettes.find({
  $and: [
    { "ingredients.nom": { $regex: "tomate", $options: "i" } },
    { "ingredients.nom": { $regex: "mozzarella", $options: "i" } },
  ],
});
```

### 4.2 Recherche par tag

```javascript
// Recherche par un tag
db.recettes.find({
  tags: "italien",
});

// Recherche avec plusieurs tags (OU)
db.recettes.find({
  tags: { $in: ["italien", "rapide"] },
});

// Recherche avec plusieurs tags (ET)
db.recettes.find({
  tags: { $all: ["italien", "végétarien"] },
});
```

### 4.3 Recherche par titre ou description

```javascript
// Recherche textuelle dans le titre
db.recettes.find({
  titre: { $regex: "pizza", $options: "i" },
});

// Recherche dans titre ET description
db.recettes.find({
  $and: [
    { titre: { $regex: "pizza", $options: "i" } },
    { description: { $regex: "pizza", $options: "i" } },
  ],
});
```

### 4.4 Recherche par temps de préparation

```javascript
// Recettes rapides (moins de 30 minutes)
db.recettes.find({
  temps_de_préparation: { $regex: "^[0-2][0-9]min|^30min", $options: "i" },
});
```

### 4.5 Recherche par origine

```javascript
db.recettes.find({
  origine: "Italie",
});
```

### 4.6 Recherche par auteur

```javascript
db.recettes.find({
  auteur_id: "user_123",
});
```

### 4.7 Recherche avancée avec agrégation

```javascript
db.recettes.aggregate([
  {
    $match: {
      $and: [
        { tags: "italien" },
        { "ingredients.nom": { $regex: "tomate", $options: "i" } },
      ],
    },
  },
  {
    $lookup: {
      from: "utilisateurs",
      localField: "auteur_id",
      foreignField: "_id",
      as: "auteur",
    },
  },
  {
    $project: {
      titre: 1,
      description: 1,
      tags: 1,
      ingredients: 1,
      date_creation: 1,
      "auteur.nom_utilisateur": 1,
      likes_count: { $size: "$likes" },
      avis_count: { $size: "$avis" },
    },
  },
  { $sort: { date_creation: -1 } },
  { $limit: 10 },
]);
```

## Requêtes supplémentaires utiles

### Obtenir les recettes les plus populaires

```javascript
db.recettes.aggregate([
  {
    $project: {
      titre: 1,
      description: 1,
      tags: 1,
      likes_count: { $size: "$likes" },
      avis_count: { $size: "$avis" },
    },
  },
  { $sort: { likes_count: -1 } },
  { $limit: 10 },
]);
```

### Obtenir les recettes récentes

```javascript
db.recettes.find().sort({ date_creation: -1 }).limit(10);
```

### Compter les recettes par tag

```javascript
db.recettes.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

### Recherche avec pagination

```javascript
// Page 1 (10 premiers résultats)
db.recettes
  .find({
    tags: "italien",
  })
  .sort({ date_creation: -1 })
  .limit(10)
  .skip(0);

// Page 2 (résultats 11-20)
db.recettes
  .find({
    tags: "italien",
  })
  .sort({ date_creation: -1 })
  .limit(10)
  .skip(10);
```

## Index recommandés pour optimiser les performances

```javascript
// Index pour la recherche par titre
db.recettes.createIndex({ titre: "text", description: "text" });

// Index pour les tags
db.recettes.createIndex({ tags: 1 });

// Index pour les ingrédients
db.recettes.createIndex({ "ingredients.nom": 1 });
db.recettes.createIndex({ "ingredients.id": 1 });

// Index pour l'auteur
db.recettes.createIndex({ auteur_id: 1 });

// Index pour la date de création
db.recettes.createIndex({ date_creation: -1 });

// Index composé pour recherches fréquentes
db.recettes.createIndex({ tags: 1, date_creation: -1 });
```
