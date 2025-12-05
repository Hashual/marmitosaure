import mongoose, { type RootFilterQuery } from "mongoose"
import { parsePage } from "../utils/pagination"
import type { Request } from "express"
import type { RecipeSearchFilters } from "../types/Recipe";
import type { PaginationOptions } from "../types/PaginationOptions";

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

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
}
const Recipes = mongoose.model('recipes', RecipeSchema);

export async function countRecipes() {
	const count = await Recipes.countDocuments().exec();
	return count;
}

export async function getRecipes(paginationOptions: PaginationOptions, searchFilters?: RecipeSearchFilters) {
    const { page, limit } = paginationOptions;

    const findOptions: RootFilterQuery<typeof RecipeSchema> = {};
    if (searchFilters?.title) {
        findOptions.title = { $regex: searchFilters.title, $options: 'i' };
    }

    if (searchFilters?.tags) {
        findOptions.tags = { $all: searchFilters.tags };
    }

    const recipes = await Recipes.find(findOptions)
        .skip((page) * limit)
        .limit(limit)
        .exec();

    return recipes;
}

export async function getRecipeById(id: string): Promise<any> {
    const recipe = await Recipes.find({ _id: id }).exec();
    return recipe;
}

// export function updateRecipe<T extends keyof Recipe>(_id: string, key: T, value: Recipe[T]) {
// 	let recipe = recipes.find(recipe => recipe._id === _id);
// 	if (recipe) { recipe[key] = value; }
// }

// export function createRecipe(_id: string, title: string, description: string, ingredients: string[], steps: string[], tags: Tag[], author: User, date_creation: Date): Recipe {
// 	let recipe: Recipe = {
// 		_id,
// 		title,
// 		description,
// 		ingredients,
// 		steps,
// 		tags,
// 		author,
// 		date_creation
// 	};

// 	recipes.push(recipe);
// 	return recipe;
// }

// export function deleteRecipe(_id: string) {
// 	const index = recipes.findIndex(recipe => recipe._id === _id);
// 	recipes.splice(index, 1);
// }