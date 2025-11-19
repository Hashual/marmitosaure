export type Review = {
    review_id: string;
    recipe_id: string;
    user_id: string;
    nickname: string;
    comment: string;
    note: number;
    publication_date: Date;
    nb_likes: number;
};
