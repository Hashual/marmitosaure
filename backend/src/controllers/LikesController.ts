import type { Request, Response } from "express";
import { LikesRepository } from "../models/likes";
import { getRecipeById } from "../models/recipes";

export class LikesController {

    static postRecipeLike(req: Request, res: Response) {
        const { 
            recipe_id, 
            user_id,
            publication_date
        } = req.body;

        if (
            !recipe_id||
            !user_id||
            !publication_date
        ) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        const like = LikesRepository.likeRecipe(recipe_id, user_id, publication_date);
        if (!like) {
            res.status(304).send({ error: "Couldn't like recipe" });
        }

        res.status(201).send({
            data: like,
        });
    }

    static deleteRecipeLike(req: Request, res: Response) {
        const {
            recipe_id,
            user_id
        } = req.body;

        if (
            !recipe_id||
            !user_id
        ) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        if (!LikesRepository.userLikedRecipe(user_id, recipe_id)) {
            return res.status(404).send({ error: "User did not like that recipe" });
        }
    }
}