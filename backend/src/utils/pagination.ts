import type { Request } from "express"

export function parsePage(req: Request, defaultLimit = 20) {
    const requestedPage = parseInt(String(req.query.page ?? "1"), 10) || 1;
    const page = requestedPage < 1 ? 1 : requestedPage;
    return { page, limit: defaultLimit };
}