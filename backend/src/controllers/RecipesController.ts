import type { Request, Response } from "express";
import {
    createRecipe,
    deleteRecipe,
    filterRecipeByTitle,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
} from "../models/recipes";
import { paginate, parsePage } from "../utils/pagination";

export class RecipesController {
    static GetAll(req: Request, res: Response) {
        let data = getAllRecipes();

        const title = req.query.title ? String(req.query.title) : "";
        if (title !== "") {
            data = filterRecipeByTitle(title);
        }

        const tags = req.query.tags ? String(req.query.tags).split(",") : [];
        const { page, limit } = parsePage(req, 20);

        let filteredData = data;
        if (tags.length > 0) {
            filteredData = data.filter((recipe) =>
                tags.every((tag) => recipe.tags.includes(tag))
            );
        }

        const result = paginate(filteredData, page, limit);

        res.status(200).send(result);
    }

    static GetById(req: Request, res: Response) {
        const { id } = req.params;

        const data = id ? getRecipeById(id) : undefined;
        if (!data) {
            return res.status(404).send({ error: "Recipe not found" });
        }
        res.status(200).send({
            data: data,
        });
    }

    static Create(req: Request, res: Response) {
        const {
            _id,
            title,
            description,
            ingredients,
            steps,
            tags,
            author,
            date_creation,
        } = req.body;

        if (
            !_id ||
            !title ||
            !description ||
            !ingredients ||
            !steps ||
            !tags ||
            !author ||
            !date_creation
        ) {
            return res.status(400).send({ error: "Missing required fields" });
        }

        const recipe = createRecipe(
            _id,
            title,
            description,
            ingredients,
            steps,
            tags,
            author,
            new Date(date_creation)
        );

        res.status(201).send({
            data: recipe,
        });
    }

    static Update(req: Request, res: Response) {
        const { id } = req.params;
        const { key, value } = req.body;

        if (!id) {
            return res
                .status(400)
                .send({ error: "Missing or invalid recipe ID" });
        }

        if (!key || value === undefined) {
            return res
                .status(400)
                .send({ error: "Missing key or value in request body" });
        }

        updateRecipe(id, key, value);

        res.status(200).send({
            data: { id, key, value },
        });
    }

    static Delete(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            return res
                .status(400)
                .send({ error: "Missing or invalid recipe ID" });
        }

        const recipe = getRecipeById(id);

        if (!recipe) {
            return res.status(404).send({ error: "Recipe not found" });
        }

        deleteRecipe(id);

        res.status(200).send({
            data: { id },
        });
    }
}
