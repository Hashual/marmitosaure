import type { Request, Response } from "express";

import {
    createReview,
    getAllReviews,
    getLikes,
    likeReview,
} from "../models/reviews.ts";

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

    static Like(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({
                error: "No review id found",
            });
        }

        likeReview(id);

        res.status(200).send({
            data: {},
        });
    }

    static CountLikes(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({
                error: "No review id found",
            });
        }

        const likes = getLikes(id);

        res.status(200).send({
            data: likes,
        });
    }
}
