export type PaginationMeta = {
    page: number;
    pageSize: number;
    total: number;
}

export type Paginated<T> = {
    data: T[];
    meta: PaginationMeta;
};

export type Post = {
    id: string;
    title: string;
    content: string;
    published: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    authorId: string;
};

export type Comment = {
    id: string;
    username: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    post?: {
        id: string;
        title: string;
    }
};