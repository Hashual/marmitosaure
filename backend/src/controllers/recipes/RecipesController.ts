import type { Request, Response } from "express";

export class RecipesController {
	static GetAll(req: Request, res: Response) {
		// TODO
		res.status(200).send({
			data: []
		})
	}

	static GetById(req: Request, res: Response) {
		const { id } = req.params;
		
		// TODO
		res.status(200).send({
			data: { id }
		})
	}

	static Search(req: Request, res: Response) {
		const { q } = req.query;

		// TODO
		res.status(200).send({
			data: { q }
		})
	}

	static Create(req: Request, res: Response) {
		const { body } = req;

		// TODO
		res.status(201).send({
			data: { id: "new-id", ...body }
		})
	}

	static Update(req: Request, res: Response) {
		const { id } = req.params;
		const { body } = req;

		// TODO
		res.status(200).send({
			data: { id, ...body }
		})
	}
}