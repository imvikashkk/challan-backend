interface QueryPagination {
    page?: string | number;
    size?: string | number;
}

interface PaginationResponse {
    skip: number;
    take?: number;
    page: number;
    size?: number;
}

export interface MetaResponse {
    total: number;
    page?: number;
    size?: number;
    pageCount: number;
}

// export function getPagination(query: QueryPagination): PaginationResponse {
//     const page = Number(query?.page) || 1
//     const size = Number(query?.size) || 25
//     const skip = (page - 1) * size;
//     const take = size;
//     return { page, size, skip, take }
// }

export function getPagination(query: QueryPagination): PaginationResponse {
    const page = Number(query?.page) || 1;
    const size = query?.size ? Number(query.size) : undefined;

    const skip = size ? (page - 1) * size : 0;
    const take = size; // If size is undefined, take will also be undefined, fetching all records.

    return { page, size, skip, take };
}

export function getMeta(pagination: PaginationResponse, count: number): MetaResponse {
    return {
        page: pagination.page,
        size: pagination.size,
        pageCount: Math.ceil(count / pagination.size),
        total: count,
    };
}