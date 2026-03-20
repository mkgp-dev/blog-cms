import {
    buildBlogPath,
    buildQuery,
    requestJson,
} from "@/common/api/client";
import type { Paginated } from "@/common/types/pagination";
import type { PublicComment, PublicPost } from "@/features/public/types/public-blog";

export type PublicPostListParams = {
    page: number;
    pageSize: number;
};

export type PublicCommentListParams = {
    page: number;
    pageSize: number;
};

export async function fetchPublicPosts(params: PublicPostListParams) {
    const query = buildQuery(params);
    const suffix = query ? `?${query}` : "";

    return requestJson<Paginated<PublicPost>>(buildBlogPath(`/posts${suffix}`), {}, false);
}

export async function fetchPublicPost(id: string) {
    return requestJson<{ data: PublicPost }>(buildBlogPath(`/posts/${id}`), {}, false);
}

export async function fetchPublicComments(
    postId: string,
    params: PublicCommentListParams
) {
    const query = buildQuery(params);
    const suffix = query ? `?${query}` : "";

    return requestJson<Paginated<PublicComment>>(
        buildBlogPath(`/posts/${postId}/comments${suffix}`),
        {},
        false
    );
}

export async function createPublicComment(
    postId: string,
    input: { username: string; content: string }
) {
    return requestJson<{ data: PublicComment }>(
        buildBlogPath(`/posts/${postId}/comments`),
        {
            method: "POST",
            body: JSON.stringify(input),
        },
        false
    );
}
