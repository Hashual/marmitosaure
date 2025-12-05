import type { Recipe } from "../types/Recipe";
import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    preparation_time: String,
    steps: [String],
    ingredients: {
        quantity: String,
        name: String,
        type: String
        },
    ustensils: {
        name: String,
        type: String
    },
    tags: [String],
    origines: String,
    author_id: String,
    image_url: String,
    creation_date: {type: Date, default: Date.now},
});

const Recipes = mongoose.model('Recipe', RecipeSchema);


export function getAllRecipes(): Recipe[] {
	return recipes;
}

export function getRecipeById(_id: string): Recipe | undefined {
	return recipes.find(recipe => recipe._id === _id);
}

export function filterRecipeByTitle(title: string): Recipe[] {
	return recipes.filter(recipe => recipe.title.includes(title));
}

export function updateRecipe<T extends keyof Recipe>(_id: string, key: T, value: Recipe[T]) {
	let recipe = recipes.find(recipe => recipe._id === _id);
	if (recipe) { recipe[key] = value; }
}

export function createRecipe(_id: string, title: string, description: string, ingredients: string[], steps: string[], tags: Tag[], author: User, date_creation: Date): Recipe {
	let recipe: Recipe = {
		_id,
		title,
		description,
		ingredients,
		steps,
		tags,
		author,
		date_creation
	};

	recipes.push(recipe);
	return recipe;
}

export function deleteRecipe(_id: string) {
	const index = recipes.findIndex(recipe => recipe._id === _id);
	recipes.splice(index, 1);
}