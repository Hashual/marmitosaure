import type { Request } from "express"
import type { PaginationOptions } from "../types/PaginationOptions";

const NUMBER_OF_ITEMS_PER_PAGE = 12;

export function parsePage(req: Request, defaultLimit = NUMBER_OF_ITEMS_PER_PAGE): PaginationOptions {
    const requestedPage = parseInt(String(req.query.page ?? "1"), 10) || 1;
    const page = requestedPage < 1 ? 1 : requestedPage;

    return {
        limit: defaultLimit,
        page: page,
        perPage: (page - 1) * defaultLimit,
    }
}