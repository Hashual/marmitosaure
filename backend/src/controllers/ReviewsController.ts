import type { Request, Response } from "express";

import { parsePage } from "../utils/pagination.ts";
import { getUserFromId } from "../models/user.ts";
import { getAllUserReviews, getAllUserReviewsWithRecipes, getBestRatedRecipes } from "../models/reviews.ts";
import { ReviewSortBy, type ReviewSortFilter } from "../types/Review.ts";

export class ReviewsController {
    async getAllForUser(req: Request, res: Response) {
        const paginationOptions = parsePage(req);
        const userId = req.params.userId;
        
        if (!userId) {
            return res.status(400).send({ error: "User ID is required" });
        }

        const user = await getUserFromId(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        const sort = req.query.sort as string | undefined;
        if (sort) {
            if (!ReviewSortBy[sort as keyof typeof ReviewSortBy]) {
                return res.status(400).send({ error: "Invalid sort parameter" });
            }
        }

        const formattedSort = sort ? ReviewSortBy[sort as keyof typeof ReviewSortBy] : undefined;

        const sortFilter: ReviewSortFilter = {
            sortBy: formattedSort,
        };

        const includeRecipes = req.query.includeRecipes === 'true' || req.query.includeRecipes === '1';

        const reviews = includeRecipes ? 
            await getAllUserReviewsWithRecipes(userId, paginationOptions, sortFilter) 
            : await getAllUserReviews(userId, paginationOptions, sortFilter);

        res.status(200).send({
            data: reviews,
            pagination: paginationOptions
        });
    }

    async getBestRated(req: Request, res: Response) {
        const paginationOptions = parsePage(req);
        const month = parseInt(req.query.month as string);
        const year = parseInt(req.query.year as string);

        if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
            return res.status(400).send({ error: "Invalid month or year parameter" });
        }

        const bestRated = await getBestRatedRecipes(month, year, paginationOptions);

        res.status(200).send({
            data: bestRated,
            pagination: paginationOptions
        });
    }
}
