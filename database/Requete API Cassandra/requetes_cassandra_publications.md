# Requêtes Cassandra pour le Service Publications

### Tables concernées :

```sql
CREATE TABLE Avis (
    recette_id UUID,
    user_id UUID,
    commentaire TEXT,
    date_publication TIMESTAMP,
    PRIMARY KEY (recette_id, user_id)
);

CREATE TABLE Likes (
    recette_id UUID,
    user_id UUID,
    date_like TIMESTAMP,
    PRIMARY KEY (recette_id, user_id)
);
```

## 1. POST /recettes/{id}/avis - Ajouter un avis sur une recette

### Requête CQL

```sql
-- Insertion d'un nouvel avis
INSERT INTO Avis (recette_id, user_id, commentaire, date_publication)
VALUES (?, ?, ?, toTimestamp(now()));
```

### Exemple avec des valeurs

```sql
INSERT INTO Avis (recette_id, user_id, commentaire, date_publication)
VALUES (550e8400-e29b-41d4-a716-446655440000,
        123e4567-e89b-12d3-a456-426614174000,
        'Excellente recette ! Très facile à réaliser.',
        toTimestamp(now()));
```

### Requête avec mise à jour (si l'avis existe déjà)

```sql
-- Mise à jour d'un avis existant
UPDATE Avis
SET commentaire = ?, date_publication = toTimestamp(now())
WHERE recette_id = ? AND user_id = ?;
```

### Vérification avant insertion

```sql
-- Vérifier si l'utilisateur a déjà donné un avis
SELECT user_id FROM Avis
WHERE recette_id = ? AND user_id = ?;
```

## 2. GET /recettes/{id}/avis - Récupérer les avis d'une recette

### Requête CQL de base

```sql
-- Récupérer tous les avis d'une recette
SELECT recette_id, user_id, commentaire, date_publication
FROM Avis
WHERE recette_id = ?;
```

### Avec tri par date (plus récents en premier)

```sql
SELECT recette_id, user_id, commentaire, date_publication
FROM Avis
WHERE recette_id = ?;
```

### Requête avec pagination (ALLOW FILTERING nécessaire)

```sql
-- Récupérer les avis avec limite
SELECT recette_id, user_id, commentaire, date_publication
FROM Avis
WHERE recette_id = ?
LIMIT 10;
```

### Table alternative pour tri par date (recommandée)

```sql
-- Création d'une table avec tri par date
CREATE TABLE Avis_Par_Date (
    recette_id UUID,
    date_publication TIMESTAMP,
    user_id UUID,
    commentaire TEXT,
    PRIMARY KEY (recette_id, date_publication, user_id)
) WITH CLUSTERING ORDER BY (date_publication DESC);

-- Insertion dans cette table
INSERT INTO Avis_Par_Date (recette_id, user_id, commentaire, date_publication)
VALUES (?, ?, ?, toTimestamp(now()));

-- Récupération triée par date
SELECT recette_id, user_id, commentaire, date_publication
FROM Avis_Par_Date
WHERE recette_id = ?
LIMIT 20;
```

## 3. POST /recettes/{id}/like - Ajouter un like à une recette

### Requête CQL

```sql
-- Insertion d'un nouveau like
INSERT INTO Likes (recette_id, user_id, date_like)
VALUES (?, ?, toTimestamp(now()));
```

### Exemple avec des valeurs

```sql
INSERT INTO Likes (recette_id, user_id, date_like)
VALUES (550e8400-e29b-41d4-a716-446655440000,
        123e4567-e89b-12d3-a456-426614174000,
        toTimestamp(now()));
```

### Requête avec vérification (éviter les doublons)

```sql
-- Vérifier si le like existe déjà
SELECT user_id FROM Likes
WHERE recette_id = ? AND user_id = ?;
```

### Supprimer un like

```sql
DELETE FROM Likes
WHERE recette_id = ? AND user_id = ?;
```

## 4. GET /recettes/{id}/likes - Compter les likes d'une recette

### Requête CQL pour compter

```sql
-- Compter tous les likes d'une recette
SELECT COUNT(*) as nombre_likes
FROM Likes
WHERE recette_id = ?;
```

### Récupérer tous les likes avec détails

```sql
-- Récupérer tous les likes d'une recette
SELECT recette_id, user_id, date_like
FROM Likes
WHERE recette_id = ?;
```

### Récupérer les likes récents

```sql
-- Table alternative pour tri par date
CREATE TABLE Likes_Par_Date (
    recette_id UUID,
    date_like TIMESTAMP,
    user_id UUID,
    PRIMARY KEY (recette_id, date_like, user_id)
) WITH CLUSTERING ORDER BY (date_like DESC);

-- Récupérer les likes les plus récents
SELECT recette_id, user_id, date_like
FROM Likes_Par_Date
WHERE recette_id = ?
LIMIT 10;
```

### Requêtes de maintenance

#### Supprimer tous les avis d'une recette

```sql
DELETE FROM Avis WHERE recette_id = ?;
```

#### Supprimer tous les likes d'une recette

```sql
DELETE FROM Likes WHERE recette_id = ?;
```

#### Supprimer un avis spécifique

```sql
DELETE FROM Avis WHERE recette_id = ? AND user_id = ?;
```

## Requêtes avec compteurs (plus efficace)

### Incrémenter les compteurs

```sql
-- Incrémenter le nombre d'avis
UPDATE Compteurs_Recettes
SET nombre_avis = nombre_avis + 1
WHERE recette_id = ?;

-- Incrémenter le nombre de likes
UPDATE Compteurs_Recettes
SET nombre_likes = nombre_likes + 1
WHERE recette_id = ?;
```
