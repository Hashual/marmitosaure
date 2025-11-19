import type { Request, Response } from "express";

import { createReview, getAllReviews } from "../models/reviews.ts";

export class ReviewsController {
    static Create(req: Request, res: Response) {
        const { id } = req.params;
        const { body } = req;

        createReview(body);

        res.status(201).send({
            data: { id, ...body },
        });
    }

    static GetAll(req: Request, res: Response) {
        const { id } = req.params;

        const reviews = getAllReviews();

        res.status(200).send({
            data: [],
        });
    }
}
