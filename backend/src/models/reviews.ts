import db from "../lib/cassandra.ts";
import type { PaginationOptions } from "../types/PaginationOptions.ts";
import type { Review, ReviewSortFilter, ReviewWithRecipe } from "../types/Review.ts";
import { getRecipeById } from "./recipes.ts";

export async function getAllUserReviews(userId: string, paginationOptions: PaginationOptions, sortFilter: ReviewSortFilter): Promise<Review[]> {
    const currentDb = await db();

    const reviews = await currentDb.collection("notices")
        .find({ user_id: userId })
        .sort(sortFilter.sortBy ? { [sortFilter.sortBy]: -1 } : {})
        .limit(paginationOptions.limit)
        .skip(paginationOptions.perPage)
        .toArray();
    return reviews as unknown as Review[];
}

export async function getAllUserReviewsWithRecipes(userId: string, paginationOptions: PaginationOptions, sortFilter: ReviewSortFilter): Promise<ReviewWithRecipe[]> {
    const reviews = await getAllUserReviews(userId, paginationOptions, sortFilter);

    const reviewsWithRecipe: ReviewWithRecipe[] = await Promise.all(
        reviews.map(async (review) => { 
            const recipe = await getRecipeById(review.recipes_id);
            return {
                ...review,
                recipe: recipe!,
            };
        })
    )

    return reviewsWithRecipe;
}