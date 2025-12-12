# marmitosaure

## Requêtes avancées à faire :
- Recettes les mieux notées par user X
- Recettes les mieux notés par mois

### Recettes avec X ingrédients
Exemple pour récupérer toutes les recettes avec les ingrédients "carrotes" et "tomates" :
`curl http://localhost:5000/recipes?ingredients=tomates,carottes | jq`


### Recettes avec temps de préparation max
Exemple pour récupérer toutes les recettes avec moins de 15 minutes de préparation (inclus) :
`curl http://localhost:5000/recipes?maxPreparationTime=15 | jq`

- Stocker les suggestions en Redis à partir des préférences et le mettre à jour quand de nouvelles recettes avec les tags dans les préférences sont ajoutées
- Utilisateurs qui ont donnés les plus mauvaises notes.