export function parsePage(pages: number, defaultLimit = 20) {
    const page = pages < 1 ? 1 : pages;
    return { page, limit: defaultLimit };
}

export function paginate<T>(items: T[], page: number, limit: number) {
    const total = items.length;
    let totalPages = Math.ceil(total / limit);
    if (totalPages < 1) totalPages = 1;
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
    };
}
