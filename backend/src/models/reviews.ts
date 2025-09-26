import type { Review } from "../types/Review.ts";
import reviewsData from "../mocks/reviews.json";

const reviews: Review[] = reviewsData.map((r: any) => ({
    _id: r._id,
    recipe_id: r.recipe_id,
    author: r.author,
    like: r.like,
    comment: r.comment,
    date_creation: r.date_creation ? new Date(r.date_creation) : new Date()
}));

export function getAllReviews(): Review[] {
    return reviews;
}

function isValidReviewBody(body: any): boolean {
    return (
        typeof body.recipe_id === "string" &&
        typeof body.author === "object" &&
        typeof body.comment === "string" &&
        typeof body.like === "boolean"
    );
}

export function createReview(body: any): Review | null {
    if (!isValidReviewBody(body)) return null;

    const now = new Date();
    const newReview: Review = {
        _id: (Math.random() * 1e9).toString(),
        recipe_id: body.recipe_id,
        author: body.author,
        like: body.like,
        comment: body.comment,
        date_creation: now
    };

    reviews.push(newReview);
    return newReview;
}
