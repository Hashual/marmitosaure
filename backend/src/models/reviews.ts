import reviewsData from "../mocks/reviews.json";
import type { Review } from "../types/Review.ts";

const reviews: Review[] = reviewsData.map((r: any) => ({
    review_id: r.review_id,
    recipe_id: r.recipe_id,
    user_id: r.user_id,
    nickname: r.nickname,
    comment: r.comment,
    note: r.note,
    publication_date: r.publication_date
        ? new Date(r.publication_date)
        : new Date(),
    nb_likes: Number(r.nb_likes),
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
        review_id: (Math.random() * 1e9).toString(),
        recipe_id: body.recipe_id,
        user_id: body.user_id,
        nickname: body.nickname,
        comment: body.comment,
        note: body.note,
        publication_date: now,
        nb_likes: body.nb_likes,
    };

    reviews.push(newReview);
    return newReview;
}

export function getLikes(reviewId: string): number {
    const review = reviews.find((r) => r.review_id === reviewId);
    return review ? review.nb_likes : 0;
}

export function likeReview(reviewId: string) {
    const review = reviews.find((r) => r.review_id === reviewId);
    if (review) {
        review.nb_likes += 1;
    }
}
