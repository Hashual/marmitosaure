import type { Request } from "express"

const NUMBER_OF_ITEMS_PER_PAGE = 9;

export function parsePage(req: Request, defaultLimit = NUMBER_OF_ITEMS_PER_PAGE) {
    const requestedPage = parseInt(String(req.query.page ?? "1"), 10) || 1;
    const page = requestedPage < 1 ? 1 : requestedPage;
    return { page, limit: defaultLimit };
}