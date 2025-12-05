import type { Request, Response } from "express";
import { LikesRepository } from "../models/likes";
import { getRecipeById } from "../models/recipes";

export class LikesController {

    static postRecipeLike(req: Request, res: Response) {
        const { 
            recipe_id,
            publication_date
        } = req.body;

        if (
            !recipe_id||
            !publication_date
        ) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        const user = req.session.user
        if (!user) {
            return res.status(401).send({ error: "There is not user session currently open" });
        }
        const user_id = user._id;

        const like = LikesRepository.likeRecipe(recipe_id, user_id, publication_date);
        if (!like) {
            res.status(304).send({ error: "Couldn't like recipe" });
        }

        res.status(201).send({
            data: like,
        });
    }

    static deleteRecipeLike(req: Request, res: Response) {
        const { recipe_id } = req.body;

        if (!recipe_id) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        const user = req.session.user
        if (!user) {
            return res.status(401).send({ error: "There is not user session currently open" });
        }
        const user_id = user._id;

        if (!LikesRepository.userLikedRecipe(user_id, recipe_id)) {
            return res.status(404).send({ error: "User did not like that recipe" });
        }
    }
}
