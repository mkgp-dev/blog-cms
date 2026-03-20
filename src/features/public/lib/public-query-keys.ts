import type { PublicBlogDataSource } from "@/features/public/config/public-blog-data-source";

export const publicQueryKeys = {
    feed: (params: { pageSize: number; source: PublicBlogDataSource }) =>
        ["public-feed", params] as const,
    post: (id: string, source: PublicBlogDataSource) =>
        ["public-post", source, id] as const,
    commentsList: (postId: string, source: PublicBlogDataSource) =>
        ["public-comments", source, postId] as const,
    comments: (
        postId: string,
        params: { page: number; pageSize: number; source: PublicBlogDataSource }
    ) => ["public-comments", params.source, postId, params] as const,
};
