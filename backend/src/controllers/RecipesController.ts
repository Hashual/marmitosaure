import type { Request, Response } from "express"
import {
    countRecipes, createRecipe,
    getRecipeById,
    getRecipes
} from "../models/recipes"
import type { RecipeSearchFilters } from "../types/Recipe"
import { parsePage } from "../utils/pagination"
import fs from "fs";
import path from "path";
import {uuid} from "@datastax/astra-db-ts";

export class RecipesController {
    static async GetRecipes(req: Request, res: Response) {
        let numData = await countRecipes();

        const title = req.query.title ? String(req.query.title) : "";
        const tags = req.query.tags ? String(req.query.tags).split(",") : [];
        const author_id = req.query.author_id ? String(req.query.author_id) : "";
        const maxPreparationTime = req.query.maxPreparationTime ? Number(req.query.maxPreparationTime) : undefined;
        const ingredients = req.query.ingredients ? String(req.query.ingredients).split(",") : [];

        const searchFilters: RecipeSearchFilters = {
            title: title || undefined,
            tags: tags.length > 0 ? tags : undefined,
            author_id: author_id || undefined,
            ingredients: ingredients.length > 0 ? ingredients : undefined,
            maxPreparationTime: maxPreparationTime,
        };

        const paginationOptions = parsePage(req);
        const data = await getRecipes(paginationOptions, searchFilters);
        
        res.status(200).send({
            data: data,
            pagination: {
                page: paginationOptions.page,
                limit: paginationOptions.limit,
                perPage: Math.ceil(numData / paginationOptions.limit),
                total: numData,
            }
        });
    }

    static async GetById(req: Request, res: Response) {
        const { id } = req.params;
        console.log(id)

        const data = id ? await getRecipeById(id) : undefined;
        if (!data) {
            return res.status(404).send({ error: "Recipe not found" });
        }
        res.status(200).send({
            data: data,
        });
    }

    static async Create(req: Request, res: Response) {
        const author_id = req.session.user?._id;
        if (!author_id) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        const file = (req as any).file;
        const image_url = file ? `/uploads/${file.filename}` : undefined;

        const {
            title,
            description,
            preparation_time,
            origin,
            steps,
            ingredients,
            utensils,
            tags
        } = req.body;

        if (
            !title ||
            !description ||
            !preparation_time ||
            !origin ||
            !steps ||
            !ingredients ||
            !utensils ||
            !tags ||
            !author_id
        ) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        const recipe = await createRecipe(
            title,
            author_id,
            description,
            preparation_time,
            origin,
            steps,
            ingredients,
            utensils,
            tags,
            image_url
        );


        res.status(201).send({
            data: recipe,
        });
    }


//     static Update(req: Request, res: Response) {
//         const { id } = req.params;
//         const { key, value } = req.body;

//         if (!id) {
//             return res
//                 .status(400)
//                 .send({ error: "Missing or invalid recipe ID" });
//         }

//         if (!key || value === undefined) {
//             return res
//                 .status(400)
//                 .send({ error: "Missing key or value in request body" });
//         }

//         updateRecipe(id, key, value);

//         res.status(200).send({
//             data: { id, key, value },
//         });
//     }

//     static Delete(req: Request, res: Response) {
//         const { id } = req.params;

//         if (!id) {
//             return res
//                 .status(400)
//                 .send({ error: "Missing or invalid recipe ID" });
//         }

//         const recipe = getRecipeById(id);

//         if (!recipe) {
//             return res.status(404).send({ error: "Recipe not found" });
//         }

//         deleteRecipe(id);

//         res.status(200).send({
//             data: { id },
//         });
//     }
}
