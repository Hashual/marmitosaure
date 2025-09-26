# Commandes Redis pour le Service Utilisateur et Session

### Structures de données utilisées :

- **Sessions** : `session:{session_id}` - Stockage des informations de session
- **Préférences** : `prefs:{user_id}` - Stockage des préférences utilisateur
- **Cache utilisateur** : `user:{user_id}` - Cache des informations utilisateur
- **Sessions actives** : `user_sessions:{user_id}` - Liste des sessions actives d'un utilisateur

## 1. POST /login - Authentification utilisateur et gestion des sessions

### 1.1 Vérification des identifiants (depuis MongoDB/base de données principale)

```redis
# Cette étape se fait noormalement via MongoDB
# Après validation --> création de session
```

### 1.2 Création d'une nouvelle session

```redis
# Générer un ID de session unique (côté application)
# Exemple: session_id = "sess_" + uuid.v4()

# Créer la session avec expiration (24h = 86400 secondes)
SETEX session:sess_abc123def456 86400 '{
  "user_id": "123",
  "username": "jean_dupont",
  "email": "jean@example.com",
  "connected": true,
  "login_time": "2025-09-26T10:00:00Z",
  "last_activity": "2025-09-26T10:00:00Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "expires": "2025-09-27T10:00:00Z"
}'
```

### 1.3 Ajouter la session à la liste des sessions actives de l'utilisateur

```redis
# Ajouter la session ID à un set des sessions actives
SADD user_sessions:123 "sess_abc123def456"

# Définir une expiration pour le set
EXPIRE user_sessions:123 86400
```

### 1.5 Statistiques de connexion

```redis
# Incrémenter le compteur de connexions
INCR user_login_count:123

# Enregistrer la dernière connexion
SET user_last_login:123 "2025-09-26T10:00:00Z"
```

## 2. Vérification et gestion des sessions

### 2.1 Vérifier si une session est valide

```redis
# Récupérer les informations de session
GET session:sess_abc123def456

# Si la session existe, mettre à jour la dernière activité
SET session:sess_abc123def456 '{
  "user_id": "123",
  "username": "jean_dupont",
  "email": "jean@example.com",
  "connected": true,
  "login_time": "2025-09-26T10:00:00Z",
  "last_activity": "2025-09-26T10:15:00Z",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "expires": "2025-09-27T10:00:00Z"
}'

# Prolonger l'expiration de la session
EXPIRE session:sess_abc123def456 86400
```

### 2.2 Logout - Supprimer une session

```redis
# Supprimer la session
DEL session:sess_abc123def456

# Retirer la session de la liste des sessions actives
SREM user_sessions:123 "sess_abc123def456"
```

### 2.3 Logout de toutes les sessions d'un utilisateur

```redis
# Récupérer toutes les sessions actives
SMEMBERS user_sessions:123

# Pour chaque session_id récupéré, la supprimer
DEL session:sess_abc123def456
DEL session:sess_def789ghi012
...

# Vider le set des sessions actives
DEL user_sessions:123
```

## 3. GET /user/prefs - Récupérer les préférences de l'utilisateur

### 3.1 Récupération simple des préférences

```redis
# Récupérer les préférences depuis Redis
GET prefs:123
```

### 3.2 Récupération avec vérification d'existence

```redis
# Vérifier si les préférences existent
EXISTS prefs:123

# Si elles n'existent pas, les charger depuis la base de données principale
# puis les mettre en cache dans Redis
```

### 3.3 Récupération de préférences spécifiques (si stockées séparément)

```redis
# Si les préférences sont stockées dans un hash
HGETALL prefs:123

# Récupérer des préférences spécifiques
HMGET prefs:123 tags allergenes type_recettes ingredients theme_interface
```

### 3.4 Structure recommandée avec hash pour les préférences

```redis
# Stocker les préférences dans un hash pour plus de flexibilité
HMSET prefs:123
  "tags" "italien,rapide,végétarien"
  "allergenes" "gluten,lactose"
  "type_recettes" "vegan,végétarien"
  "ingredients" "tofu,tomates,basilic"
  "theme_interface" "sombre"
  "langue" "fr"
  "notifications" "true"
  "newsletter" "false"

# Définir une expiration (optionnel)
EXPIRE prefs:123 7200
```

## 4. POST /user/prefs - Mettre à jour les préférences de l'utilisateur

### 4.1 Mise à jour complète des préférences (JSON)

```redis
# Remplacer toutes les préférences
SET prefs:123 '{
  "user_id": "123",
  "tags": ["italien", "rapide", "végétarien"],
  "allergenes": ["gluten", "lactose"],
  "type_recettes": ["vegan", "végétarien"],
  "ingredients": ["tofu", "tomates", "basilic"],
  "theme_interface": "sombre",
  "langue": "fr",
  "notifications": true,
  "newsletter": false,
  "updated_at": "2025-09-26T10:30:00Z"
}'

# Définir une expiration
EXPIRE prefs:123 7200
```

### 4.2 Mise à jour partielle des préférences (Hash)

```redis
# Mettre à jour des champs spécifiques
HMSET prefs:123
  "theme_interface" "clair"
  "notifications" "false"
  "updated_at" "2025-09-26T10:30:00Z"

# Ajouter un nouveau tag aux préférences
HGET prefs:123 tags
# Côté application: parser, ajouter le nouveau tag, remettre à jour
HSET prefs:123 "tags" "italien,rapide,végétarien,asiatique"
```

### 4.3 Mise à jour avec gestion des listes (tags, allergènes, etc.)

```redis
# Utiliser des sets pour les listes d'éléments uniques
# Tags préférés
SADD user_tags:123 "italien" "rapide" "végétarien"
SREM user_tags:123 "ancien_tag"

# Allergènes
SADD user_allergenes:123 "gluten" "lactose"
SREM user_allergenes:123 "ancien_allergene"

# Récupérer les listes
SMEMBERS user_tags:123
SMEMBERS user_allergenes:123
```

### 4.4 Invalidation du cache après mise à jour

```redis
# Après mise à jour des préférences, invalider les caches liés
DEL user_recommendations:123
DEL user_search_cache:123
```

## 5. Commandes supplémentaires utiles

### 5.1 Gestion des sessions multiples

```redis
# Lister toutes les sessions actives d'un utilisateur
SMEMBERS user_sessions:123

# Compter le nombre de sessions actives
SCARD user_sessions:123

# Vérifier si une session spécifique est active
SISMEMBER user_sessions:123 "sess_abc123def456"
```

### 5.2 Cache des recommandations basées sur les préférences

```redis
# Cache des recommandations personnalisées (expire après 1h)
SETEX user_recommendations:123 3600 '[
  {"recette_id": "rec_001", "score": 0.95},
  {"recette_id": "rec_002", "score": 0.88},
  {"recette_id": "rec_003", "score": 0.82}
]'
```

### 5.3 Historique des recherches

```redis
# Stocker les dernières recherches (FIFO avec limite)
LPUSH user_search_history:123 "pizza italienne"
LTRIM user_search_history:123 0 9  # Garder seulement les 10 dernières

# Récupérer l'historique
LRANGE user_search_history:123 0 -1
```

### 5.4 Préférences temporaires (session)

```redis
# Stocker des préférences temporaires pour la session
HMSET session_prefs:sess_abc123def456
  "current_filters" "italien,rapide"
  "sort_by" "popularité"
  "results_per_page" "20"

# Expiration automatique avec la session
EXPIRE session_prefs:sess_abc123def456 86400
```

### 5.5 Statistiques utilisateur

```redis
# Nombre de recettes consultées
INCR user_stats:123:recipes_viewed

# Nombre de recherches effectuées
INCR user_stats:123:searches_made

# Dernière activité
SET user_stats:123:last_activity "2025-09-26T10:30:00Z"

# Récupérer toutes les statistiques
MGET user_stats:123:recipes_viewed user_stats:123:searches_made user_stats:123:last_activity
```

## 6. Patterns de nettoyage et maintenance

### 6.1 Nettoyage des sessions expirées

```redis
# Script Lua pour nettoyer les sessions expirées
# (À exécuter périodiquement côté application)

# Rechercher les sessions expirées par pattern
SCAN 0 MATCH session:* COUNT 1000

# Pour chaque session trouvée, vérifier si elle est expirée
# Si expirée, la supprimer et nettoyer les références
```

### 6.2 Nettoyage des données utilisateur inactifs

```redis
# Identifier les utilisateurs inactifs (pas de session depuis X jours)
# Nettoyer leurs caches temporaires
DEL user_recommendations:123
DEL user_search_cache:123
DEL user_search_history:123
```

### 6.3 Backup des préférences importantes

```redis
# Sauvegarder les préférences importantes avant nettoyage
# Ces données peuvent être restaurées depuis la base principale si nécessaire
BGSAVE
```

## 7. Commandes pour le monitoring et debug

### 7.1 Statistiques globales

```redis
# Nombre total de sessions actives
EVAL "return #redis.call('keys', 'session:*')" 0

# Nombre d'utilisateurs avec des préférences en cache
EVAL "return #redis.call('keys', 'prefs:*')" 0

# Mémoire utilisée
INFO memory
```

### 7.2 Debug d'une session spécifique

```redis
# Informations complètes d'une session
GET session:sess_abc123def456
TTL session:sess_abc123def456

# Toutes les données liées à un utilisateur
KEYS *:123
```

## 8. Configuration Redis recommandée

```redis
# Dans redis.conf ou via CONFIG SET

# Politique d'éviction pour gérer la mémoire
CONFIG SET maxmemory-policy allkeys-lru

# Persistance pour les données importantes
CONFIG SET save "900 1"  # Sauvegarde après 15min si au moins 1 clé modifiée

```
