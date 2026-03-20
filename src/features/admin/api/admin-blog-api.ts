import {
    buildBlogPath,
    buildQuery,
    requestJson,
} from "@/common/api/client";
import type { Paginated } from "@/common/types/pagination";
import type { AdminComment, AdminPost } from "@/features/admin/types/admin-blog";

export type AdminPostSearchParams = {
    page: number;
    pageSize: number;
    q?: string;
    published?: boolean;
    startDate?: string;
    endDate?: string;
};

export type AdminCommentSearchParams = {
    page: number;
    pageSize: number;
    q?: string;
    startDate?: string;
    endDate?: string;
};

export async function fetchAdminPosts(params: AdminPostSearchParams) {
    const query = buildQuery(params);
    const hasFilters =
        Boolean(params.q || params.startDate || params.endDate) ||
        params.published !== undefined;
    const suffix = query ? `?${query}` : "";
    const path = hasFilters
        ? buildBlogPath(`/posts/search${suffix}`)
        : buildBlogPath(`/posts${suffix}`);

    return requestJson<Paginated<AdminPost>>(path);
}

export async function createPost(input: {
    title: string;
    content: string;
    published: boolean;
}) {
    return requestJson<{ data: AdminPost }>(buildBlogPath("/posts"), {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function updatePost(
    id: string,
    input: { title: string; content: string; published: boolean }
) {
    return requestJson<{ data: AdminPost }>(buildBlogPath(`/posts/${id}`), {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

export async function deletePost(id: string) {
    return requestJson<{ success: boolean }>(buildBlogPath(`/posts/${id}`), {
        method: "DELETE",
    });
}

export async function fetchAdminComments(params: AdminCommentSearchParams) {
    const query = buildQuery(params);
    const hasFilters = Boolean(params.q || params.startDate || params.endDate);
    const suffix = query ? `?${query}` : "";
    const path = hasFilters
        ? buildBlogPath(`/comments/search${suffix}`)
        : buildBlogPath(`/comments${suffix}`);

    return requestJson<Paginated<AdminComment>>(path);
}

export async function deleteComment(id: string) {
    return requestJson<{ success: boolean }>(buildBlogPath(`/comments/${id}`), {
        method: "DELETE",
    });
}
