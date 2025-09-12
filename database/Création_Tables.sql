--CASSANDRA
CREATE TABLE Utilisateurs (
    utilisateur_id UUID PRIMARY KEY,
    nom_utilisateur TEXT,
    mot_de_passe TEXT,
    email TEXT,
    date_inscription TIMESTAMP
);

CREATE TABLE Recettes (
    recette_id UUID PRIMARY KEY,
    titre TEXT,
    description TEXT,
    temps_preparation TEXT,
    etapes LIST<TEXT>,
    tags LIST<TEXT>,
    origine TEXT,
    auteur_id UUID,
    date_creation TIMESTAMP,
    ingredients LIST<FROZEN<MAP<TEXT, TEXT>>>)
    -- Exemple : [{ingredient_id: 1, quantite: "500g"}]

CREATE TABLE ingredients(
    ingredient_id UUID,
    nom_ingredient TEXT,
    type_id UUID,
    PRIMARY KEY (ingredient_id, nom_ingredient),
    FOREIGN KEY (type_id) REFERENCES type(id_type)
)

CREATE TABLE type(
    id_type UUID PRIMARY KEY,
    nom_type TEXT
)

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

CREATE TABLE Suggestions (
    suggestion_id UUID PRIMARY KEY,
    recette_id UUID,
    auteur_id UUID,
    contenu TEXT,
    date_suggestion TIMESTAMP
);

CREATE TABLE Ingredients (
    ingredient_id UUID PRIMARY KEY,
    nom_ingredient TEXT,
    type_ingredient TEXT
);

CREATE TABLE Ustensiles (
    ustensiles_id UUID PRIMARY KEY,
    nom_ustensiles TEXT,
    catégories_ustensilest TEXT
);

-- REDIS
-- Sessions
SET session:12345 "{ 'user_id': 123, 'connected': true, 'expires': '2025-09-12T15:00:00Z' }"

-- Cache preferences
SET prefs:123 "{ 'user_id': 123, 'tags': ['italien', 'rapide'], 'allergenes': ['gluten'], 'type_recettes': ['vegan'], 'ingredients': ['tofu', 'tomates'] }"


-- voler les données sur marmiton
-- REDIS -> Cache des informations utilisateur et sessions , cassandra ->  Gestion des publications  , mongoDB ->  Stockage des recettes
--CREATE TABLE sessions () ?
--CREATE TABLE preference () ?
--CREATE TABLE notif () ?

--cookies?

-- préférence sur interface (sombre, clair)
