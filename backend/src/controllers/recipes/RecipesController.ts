import type { Request, Response } from "express";
import {
  filterRecipeByTitle,
  getAllRecipes,
  getRecipeById,
} from "../../models/recipes";

export class RecipesController {
  static GetAll(req: Request, res: Response) {
    const data = getAllRecipes();
    res.status(200).send({
      data: data,
    });
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

  static Search(req: Request, res: Response) {
    const title = req.query.title ? String(req.query.title) : "";
    const data = filterRecipeByTitle(title);
    res.status(200).send({
      data: data,
    });
  }

  static Create(req: Request, res: Response) {
    const { body } = req;

    // TODO
    res.status(201).send({
      data: { id: "new-id", ...body },
    });
  }

  static Update(req: Request, res: Response) {
    const { id } = req.params;
    const { body } = req;

    // TODO
    res.status(200).send({
      data: { id, ...body },
    });
  }
}
