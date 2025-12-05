import type { Request, Response } from "express";
import { getRecipeLikes, likeRecipe } from "../models/likes";
import { getRecipeById } from "../models/recipes";

export class LikesController {
    static getRecipeLikes(req: Request, res: Response) {
        const { recipeId } = req.params;

        const likesNumber = recipeId ? getRecipeLikes(recipeId) : undefined;
        if (!likesNumber) {
            return res.status(404).send({ error: "Recipe not found" });
        }
        res.status(200).send({
            data: likesNumber,
        });
    }

    static postRecipeLikes(req: Request, res: Response) {
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

        const like = likeRecipe(recipe_id, user_id, publication_date);
        if (!like) {
            res.status(304).send({ error: "Couldn't like recipe" });
        }

        res.status(201).send({
            data: like,
        });
    }
}