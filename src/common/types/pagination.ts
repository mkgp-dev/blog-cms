export type PaginationMeta = {
    page: number;
    pageSize: number;
    total: number;
};

export type Paginated<T> = {
    data: T[];
    meta: PaginationMeta;
};
