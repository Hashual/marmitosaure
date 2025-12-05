import type { Request, Response } from "express"
import {
    countRecipes,
    filterRecipeByTitle,
    getRecipeById,
    getRecipes
} from "../models/recipes"
import { parsePage } from "../utils/pagination"

export class RecipesController {
    static async GetRecipes(req: Request, res: Response) {
        let numData = await countRecipes();
        let data = await getRecipes(numData, req);

        const title = req.query.title ? String(req.query.title) : "";
        if (title !== "") {
            data = await filterRecipeByTitle(title);
            const { page , limit } = parsePage(req);
            data = data.slice((page - 1) * limit, page * limit);
        }

        const tags = req.query.tags ? String(req.query.tags).split(",") : [];
       

        // let filteredData = data;
        // if (tags.length > 0) {
        //     filteredData = data.filter((recipe) =>
        //         tags.every((tag) => recipe.tags.includes(tag))
        //     );
        // }
        res.status(200).send(data);
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

    // static Create(req: Request, res: Response) {
    //     const {
    //         _id,
    //         title,
    //         description,
    //         ingredients,
    //         steps,
    //         tags,
    //         author,
    //         date_creation,
    //     } = req.body;

    //     if (
    //         !_id ||
    //         !title ||
    //         !description ||
    //         !ingredients ||
    //         !steps ||
    //         !tags ||
    //         !author ||
    //         !date_creation
    //     ) {
    //         return res.status(400).send({ error: "Missing required fields" });
    //     }

//         const recipe = createRecipe(
//             _id,
//             title,
//             description,
//             ingredients,
//             steps,
//             tags,
//             author,
//             new Date(date_creation)
//         );

//         res.status(201).send({
//             data: recipe,
//         });
//     }

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
