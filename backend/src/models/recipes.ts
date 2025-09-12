import type { Recipe } from "../types/Recipe";
import recipesData from "../mocks/recipes.json";

const recipes: Recipe[] = recipesData.map(r => ({
	...r,
	date_creation: new Date(r.date_creation)
}));

function getRecipeById(id: string): Recipe | undefined {
	return recipes.find(recipe => recipe._id === id);
}

function getRecipeByTitle(title: string): Recipe | undefined {
	return recipes.find(recipe => recipe.title === title);
}