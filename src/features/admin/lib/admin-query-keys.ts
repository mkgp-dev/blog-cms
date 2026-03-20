export const adminQueryKeys = {
    postsList: ["admin-posts"] as const,
    posts: (params: {
        page: number;
        pageSize: number;
        q?: string;
        published?: boolean;
        startDate?: string;
        endDate?: string;
    }) => ["admin-posts", params] as const,
    commentsList: ["admin-comments"] as const,
    comments: (params: {
        page: number;
        pageSize: number;
        q?: string;
        startDate?: string;
        endDate?: string;
    }) => ["admin-comments", params] as const,
};
