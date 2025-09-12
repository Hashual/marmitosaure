CREATE TABLE Utilisateurs (
    utilisateur_id INT PRIMARY KEY AUTO_INCREMENT,
    nom_utilisateur VARCHAR(50) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 5000 à 10000recettes
CREATE TABLE Recettes (
    _id INT PRIMARY KEY AUTO_INCREMENT,
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    ingredient_id INT,
    etapes TEXT NOT NULL,
    tags VARCHAR(100),
    auteur INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auteur) REFERENCES Utilisateurs (utilisateur_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (ingredients_id)
);

CREATE TABLE Avis (
    recipe_id INT,
    user_id INT,
    commentaire TEXT,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (recipe_id, user_id),
    FOREIGN KEY (recipe_id) REFERENCES Recettes (_id),
    FOREIGN KEY (user_id) REFERENCES Utilisateurs (utilisateur_id)
);

CREATE TABLE Likes (
    post_id INT,
    user_id INT,
    date_like TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES Recettes (_id),
    FOREIGN KEY (user_id) REFERENCES Utilisateurs (utilisateur_id)
);

CREATE TABLE Suggestions (
    suggestion_id INT PRIMARY KEY AUTO_INCREMENT,
    ref_recette INT,
    contenu TEXT NOT NULL,
    auteur INT,
    date_suggestion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auteur) REFERENCES Utilisateurs (utilisateur_id),
    FOREIGN KEY (ref_recette) REFERENCES Recettes (_id)
);

CREATE TABLE Ingredients (
    ingredients_id INT PRIMARY KEY AUTO_INCREMENT,
);

CREATE TABLE Ingredients_Recettes (
    recette_id INT,
    ingredient_id INT,
    quantite VARCHAR(50),
    PRIMARY KEY (recette_id, ingredient_id),
    FOREIGN KEY (recette_id) REFERENCES Recettes (_id),
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients (ingredients_id)
);

-- REDIS, cassandra, mongoDB
--CREATE TABLE sessions () ?
--CREATE TABLE preference () ?
--CREATE TABLE notif () ?

