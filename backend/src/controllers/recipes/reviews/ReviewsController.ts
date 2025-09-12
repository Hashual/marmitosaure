import type { Request, Response } from "express";

export class ReviewsController {
	static Create(req: Request, res: Response) {
		const { id } = req.params;
		const { body } = req;

		// TODO
		res.status(201).send({
			data: { id, ...body }
		})
	}

	static GetAll(req: Request, res: Response) {
		const { id } = req.params;

		// TODO
		res.status(200).send({
			data: []
		})
	}

	static Like(req: Request, res: Response) {
		const { id } = req.params;

		// TODO
		res.status(200).send({
			data: {}
		})
	}

	static CountLikes(req: Request, res: Response) {
		const { id } = req.params;

		// TODO
		res.status(200).send({
			data: { likes: 0 }
		})
	}
}