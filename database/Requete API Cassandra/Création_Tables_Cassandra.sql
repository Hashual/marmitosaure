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
    ustensiles LIST<TEXT>,
    tags LIST<TEXT>,
    origine TEXT,
    auteur_id UUID,
    date_creation TIMESTAMP,
    ingredients LIST<FROZEN<MAP<TEXT, TEXT>>>)
    -- Exemple : [{ingredient_id: 1, quantite: "500g"}]

CREATE TABLE notices (
    recette_id UUID,
    user_id UUID,
    comment TEXT,
    notation int,
    publication_date TIMESTAMP,
    like_id UUID,
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

CREATE Table type_ingredients (
    id_type UUID PRIMARY KEY,
    nom_type TEXT
);

CREATE TABLE Ingredients (
    ingredient_id UUID PRIMARY KEY,
    nom_ingredient TEXT,
    type_ingredient UUID,
    FOREIGN KEY (type_ingredient) REFERENCES type_ingredients(id_type)
);

-- voler les données sur marmiton
-- REDIS -> Cache des informations utilisateur et sessions , cassandra ->  Gestion des publications  , mongoDB ->  Stockage des recettes
--CREATE TABLE sessions () ?
--CREATE TABLE preference () ?
--CREATE TABLE notif () ?

--cookies?

-- préférence sur interface (sombre, clair)
