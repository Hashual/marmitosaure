import type { Request, Response } from "express";
import { getAllTags } from "../models/tags.js";



export class TagsController {

    static async getAll(req: Request, res: Response) {
        const data = await getAllTags();
        res.status(200).send({ data });
}
}