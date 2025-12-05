import db from "../lib/cassandra";
import type { Like } from "../types/Like";
import type { Recipe } from "../types/Recipe";

export function getRecipeLikes(recipeId: string): Number {
    // TODO
    return 0;
}

export function likeRecipe(recipe_id: string, user_id: string, publication_date: Date): Like | undefined {
    try {
        const like: Like = {
            recipe_id,
            user_id,
            publication_date
        }
        db().collection("Users").insertOne(like);
        return like;
    } catch (error) {
        console.log("couldn't like recipe: ", error);
        return undefined;
    }
        
}