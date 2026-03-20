import { getPublicBlogDataSource } from "@/features/public/config/public-blog-data-source";
import {
    createPublicComment,
    fetchPublicComments,
    fetchPublicPost,
    fetchPublicPosts,
    type PublicCommentListParams,
    type PublicPostListParams,
} from "@/features/public/api/public-blog-api";
import {
    createMockPublicComment,
    fetchMockPublicComments,
    fetchMockPublicPost,
    fetchMockPublicPosts,
} from "@/features/public/data/mock-public-blog-data";

export function getResolvedPublicBlogDataSource() {
    return getPublicBlogDataSource();
}

export async function fetchPublicBlogPosts(params: PublicPostListParams) {
    return getResolvedPublicBlogDataSource() === "mock"
        ? fetchMockPublicPosts(params)
        : fetchPublicPosts(params);
}

export async function fetchPublicBlogPost(id: string) {
    return getResolvedPublicBlogDataSource() === "mock"
        ? fetchMockPublicPost(id)
        : fetchPublicPost(id);
}

export async function fetchPublicBlogComments(
    postId: string,
    params: PublicCommentListParams
) {
    return getResolvedPublicBlogDataSource() === "mock"
        ? fetchMockPublicComments(postId, params)
        : fetchPublicComments(postId, params);
}

export async function createPublicBlogComment(
    postId: string,
    input: { username: string; content: string }
) {
    return getResolvedPublicBlogDataSource() === "mock"
        ? createMockPublicComment(postId, input)
        : createPublicComment(postId, input);
}
