import reviewsData from "../mocks/reviews.json";
import type { Review } from "../types/Review.ts";

const reviews: Review[] = reviewsData.map((r: any) => ({
    _id: r._id,
    recipe_id: r.recipe_id,
    author: r.author,
    like: Number(r.like),
    comment: r.comment,
    date_creation: r.date_creation ? new Date(r.date_creation) : new Date(),
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
        _id: (Math.random() * 1e9).toString(),
        recipe_id: body.recipe_id,
        author: body.author,
        like: body.like,
        comment: body.comment,
        date_creation: now,
    };

    reviews.push(newReview);
    return newReview;
}

export function getLikes(reviewId: string): number {
    const review = reviews.find((r) => r._id === reviewId);
    return review ? review.like : 0;
}

export function likeReview(reviewId: string) {
    const review = reviews.find((r) => r._id === reviewId);
    if (review) {
        review.like += 1;
    }
}
