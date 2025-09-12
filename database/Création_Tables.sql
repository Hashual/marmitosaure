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
    etapes LIST<TEXT>,
    tags LIST<TEXT>,
    auteur_id UUID,
    date_creation TIMESTAMP,
    ingredients LIST<FROZEN<MAP<TEXT, TEXT>>>
    -- Exemple : [{nom: "Farine", type: "sec", quantite: "500g"}]
);

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


-- voler les données sur marmiton
-- REDIS -> Cache des informations utilisateur et sessions , cassandra ->  Gestion des publications  , mongoDB ->  Stockage des recettes
--CREATE TABLE sessions () ?
--CREATE TABLE preference () ?
--CREATE TABLE notif () ?

--cookies?

-- préférence sur interface (sombre, clair)
