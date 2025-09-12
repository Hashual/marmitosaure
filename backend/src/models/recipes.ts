import type { Recipe } from "../types/Recipe";
import recipesData from "../mocks/recipes.json";

const recipes: Recipe[] = recipesData.map(r => ({
	...r,
	date_creation: new Date(r.date_creation)
}));

export function getAllRecipes(): Recipe[] {
	return recipes;
}

export function getRecipeById(id: string): Recipe | undefined {
	return recipes.find(recipe => recipe._id === id);
}

export function filterRecipeByTitle(title: string): Recipe[] {
	return recipes.filter(recipe => recipe.title.includes(title));
}