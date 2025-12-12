import type { Recipe } from "./Recipe";
import type { User } from "./User";

export type Review = {
    recipes_id: string;
    user_id: string;
    comment: string;
    notation: number;
    publication_date: Date;
    nb_likes: number;
};


export type ReviewWithRecipe = Review & {
    recipe: Recipe
}

export enum ReviewSortBy {
    notation = 'notation',
    publicationDate = 'publication_date',
}

export type ReviewSortFilter = {
    sortBy?: ReviewSortBy;
}

export type RatingWithRecipe = {
    recipe: Recipe;
    rating: number;
}

export type UserWithAverageRating = {
    user: User;
    averageRating: number;
}