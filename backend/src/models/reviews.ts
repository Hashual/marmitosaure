import reviewsData from "../mocks/reviews.json";
import type { Review } from "../types/Review.ts";

const reviews: Review[] = reviewsData.map((r: any) => ({
    recipe_id: r.recipe_id,
    user_id: r.user_id,
    comment: r.comment,
    publication_date: r.publication_date
        ? new Date(r.publication_date)
        : new Date(),
}));

function isValidReviewBody(body: any): boolean {
    return (
        typeof body.recipe_id === "string" &&
        typeof body.author === "object" &&
        typeof body.comment === "string" &&
        typeof body.like === "number"
    );
}

export function getAllReviews(): Review[] {
    return reviews;
}

export function createReview(body: any): Review | null {
    if (!isValidReviewBody(body)) return null;

    const now = new Date();
    const newReview: Review = {
        recipe_id: body.recipe_id,
        user_id: body.user_id,
        comment: body.comment,
        publication_date: now,
    };

    reviews.push(newReview);
    return newReview;
}
