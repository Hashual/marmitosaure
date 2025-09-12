import { read } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Tag } from "../types/Tag.ts";

export async function getAllTags(): Promise<Tag[]> {
    const filePath = path.join(__dirname, "..", "mocks", "tags.json");
    const data = await readFile(filePath, "utf-8");
    console.log(data);
    const tags = JSON.parse(data) as Tag[];
    console.log(tags);
    return tags
}
