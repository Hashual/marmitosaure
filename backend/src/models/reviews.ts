import db from "../lib/cassandra.ts";
import type { PaginationOptions } from "../types/PaginationOptions.ts";
import type { RatingWithRecipe, Review, ReviewSortFilter, ReviewWithRecipe } from "../types/Review.ts";
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

export async function getBestRatedRecipes(month: number, year: number, paginationOptions: PaginationOptions): Promise<RatingWithRecipe[]> {
    const currentDb = await db();

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    console.log("Fetching reviews between", startDate, "and", endDate);

    const luceneQuery = `publication_date:[${startDate.toISOString()} TO ${endDate.toISOString()}]`;

    const reviews = await currentDb.collection("notices").find({ lucene: luceneQuery }).toArray() as unknown as Review[];

    const recipesRatings = new Map<string, { sum: number; count: number }>();
    
    reviews.forEach((review) => {
        const current = recipesRatings.get(review.recipes_id) || { sum: 0, count: 0 };
        recipesRatings.set(review.recipes_id, {
            sum: current.sum + review.notation,
            count: current.count + 1,
        });
    });

    const sortedRecipes = Array.from(recipesRatings.entries())
        .sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count))
        .slice(paginationOptions.perPage, paginationOptions.perPage + paginationOptions.limit);

    const ratingsWithRecipe: RatingWithRecipe[] = await Promise.all(
        sortedRecipes.map(async ([recipeId, ratings]) => {
            const recipe = await getRecipeById(recipeId);
            return {
                recipe: recipe!,
                rating: ratings.sum / ratings.count,
            };
        })
    );

    return ratingsWithRecipe;
}