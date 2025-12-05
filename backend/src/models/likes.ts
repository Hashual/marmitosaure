import db from "../lib/cassandra";
import type { Like } from "../types/Like";
import type { Recipe } from "../types/Recipe";

export class LikesRepository {
    static userLikedRecipe(user_id: string, recipe_id: string): boolean {
        try {
            const like = db().collection("Likes").findOne({ user_id, recipe_id });

            if (!like) { return true; }
            else { return false; }
        } catch (error) {
            console.log("couldn't check if user liked recipe: ", error);
            return false;
        }
    }

    static likeRecipe(recipe_id: string, user_id: string, publication_date: Date): Like | undefined {
        try {
            const like: Like = {
                recipe_id,
                user_id,
                publication_date
            }
            db().collection("Likes").insertOne(like);
            return like;
        } catch (error) {
            console.log("couldn't like recipe: ", error);
            return undefined;
        }
    }

    static dislikeRecipe(recipe_id: string, user_id: string) {
        try {
            return db().collection("Likes").findOneAndDelete({ recipe_id, user_id });
        } catch (error) {
            console.log("couldn't dislike recipe: ", error);
            return false;
        }
    }
}

