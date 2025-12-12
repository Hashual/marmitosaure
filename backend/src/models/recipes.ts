import mongoose, {type RootFilterQuery} from "mongoose"
import type {RecipeSearchFilters} from "../types/Recipe";
import type {PaginationOptions} from "../types/PaginationOptions";

const RecipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    preparation_time: Number,
    origin: String,
    steps: [String],
    ingredients: Array<{
        quantity: String,
        name: String,
        type: String
    }>,
    utensils: Array<{
        name: String,
        type: String
    }>,
    tags: [String],
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
    return await Recipes.countDocuments().exec();
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

    if (searchFilters?.author_id) {
        findOptions.author_id = { $regex: searchFilters.author_id, $options: 'i' };
    }

    if (searchFilters?.maxPreparationTime) {
        findOptions.preparation_time = { $lte: searchFilters.maxPreparationTime };
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

export async function createRecipe(title: string, author_id: string, description: string, preparation_time: string, origin: string, steps: string[], ingredients: { quantity: string; name: string; type: string }[], utensils: { name: string; type: string }[], tags: string[], image_url?: string) {
    const newRecipe = new Recipes ({
        title,
        author_id,
        description,
        preparation_time,
        origin,
        steps,
        ingredients,
        utensils,
        tags,
        image_url,
    });
    return await newRecipe.save().then((recipe) => {
        return recipe;
    })
}

// export function deleteRecipe(_id: string) {
// 	const index = recipes.findIndex(recipe => recipe._id === _id);
// 	recipes.splice(index, 1);
// }
