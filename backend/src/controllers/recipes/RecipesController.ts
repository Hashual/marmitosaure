import type { Request, Response } from "express";

export class RecipesController {
	static GetAllRecipes(req: Request, res: Response) {
		res.status(200).send({
			data: []
		})
	}
}