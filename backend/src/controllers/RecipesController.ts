import type { Request, Response } from "express"
import {
    countRecipes, createRecipe,
    getRecipeById,
    getRecipes
} from "../models/recipes"
import type { RecipeSearchFilters } from "../types/Recipe"
import { parsePage } from "../utils/pagination"

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
        } = req.body;

        // Parser les données JSON envoyées depuis le frontend
        let steps, ingredients, utensils, tags;
        try {
            steps = typeof req.body.steps === 'string' ? JSON.parse(req.body.steps) : req.body.steps;
            ingredients = typeof req.body.ingredients === 'string' ? JSON.parse(req.body.ingredients) : req.body.ingredients;
            utensils = typeof req.body.utensils === 'string' ? JSON.parse(req.body.utensils) : req.body.utensils;
            tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
        } catch (e) {
            return res.status(400).send({ error: "Invalid JSON format for steps, ingredients, utensils or tags" });
        }

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

    static async Update(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ error: "Missing recipe ID" });
        }

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

        const recipe = await getRecipeById(id);
        if (!recipe) {
            return res.status(404).send({ error: "Recipe not found" });
        }


        const file = (req as any).file;
        const image_url = file ? `/uploads/${file.filename}` : undefined;

        recipe.title = title || recipe.title;
        recipe.description = description || recipe.description;
        recipe.preparation_time = preparation_time || recipe.preparation_time;
        recipe.origin = origin || recipe.origin;
        recipe.steps = steps || recipe.steps;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.utensils = utensils || recipe.utensils;
        recipe.tags = tags || recipe.tags;
        recipe.image_url = image_url || recipe.image_url;

        await recipe.save();

        res.status(200).send({
            data: recipe,
        });
    }

    static async Delete(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ error: "Missing recipe ID" });
        }

        const recipe = await getRecipeById(id);
        if (!recipe) {
            return res.status(404).send({ error: "Recipe not found" });
        }

        await recipe.deleteOne();

        res.status(200).send({
            data: { id },
        });
    }
}
