import type { User } from './User';

export type Review = {
    _id: string;
    recipe_id: string;
    author: {
        _id: string;
        name: string;
    };
    like: number
    comment: string;
    date_creation: Date;
}