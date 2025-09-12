import { User } from "./User";
import { Tag } from "./Tag";

export type Recipe = {
	_id: string;
	title: string;
	description: string;
	ingredients: string[];
	steps: string[];
	tags: Tag[];
	author: User[];
	date_creation: Date;
}