import type { Paginated } from "@/common/types/pagination";
import type { PublicComment, PublicPost } from "@/features/public/types/public-blog";

const TOTAL_MOCK_POSTS = 27;
const MOCK_BASE_DATE = new Date("2026-03-01T08:00:00.000Z").getTime();

function createMockPost(index: number): PublicPost {
    const sequence = String(index + 1).padStart(12, "0");
    const createdAt = new Date(MOCK_BASE_DATE + index * 86_400_000).toISOString();

    return {
        id: `00000000-0000-4000-8000-${sequence}`,
        title: `Mock Chronicle ${String(index + 1).padStart(2, "0")}`,
        content: [
            `<p>Mock post ${index + 1} exists so the public UI can be exercised without a large live dataset.</p>`,
            "<p>This article is part of the developer-only mock source for layout and scrolling validation.</p>",
            `<h2>Section ${index + 1}</h2>`,
            "<p>The visual rhythm, spacing, and typography should still feel realistic while testing.</p>",
        ].join(""),
        publishedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
    };
}

const mockPosts = Array.from({ length: TOTAL_MOCK_POSTS }, (_, index) => createMockPost(index));

const mockCommentsByPost = new Map<string, PublicComment[]>(
    mockPosts.map((post, index) => [
        post.id,
        [
            {
                id: `comment-${index + 1}-1`,
                username: "UI Reviewer",
                content: "This mock comment keeps the reading flow realistic during UI testing.",
                createdAt: new Date(MOCK_BASE_DATE + index * 86_400_000 + 3_600_000).toISOString(),
                updatedAt: new Date(MOCK_BASE_DATE + index * 86_400_000 + 3_600_000).toISOString(),
            },
        ],
    ])
);

function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
        data: items.slice(startIndex, endIndex),
        meta: {
            page,
            pageSize,
            total: items.length,
        },
    };
}

export async function fetchMockPublicPosts(params: { page: number; pageSize: number }) {
    return paginate(mockPosts, params.page, params.pageSize);
}

export async function fetchMockPublicPost(id: string) {
    const post = mockPosts.find((item) => item.id === id);

    if (!post) {
        throw new Error("Post not found");
    }

    return { data: post };
}

export async function fetchMockPublicComments(
    postId: string,
    params: { page: number; pageSize: number }
) {
    const post = mockPosts.find((item) => item.id === postId);

    if (!post) {
        throw new Error("Post not found");
    }

    const comments = mockCommentsByPost.get(postId) ?? [];
    return paginate(comments, params.page, params.pageSize);
}

export async function createMockPublicComment(
    postId: string,
    input: { username: string; content: string }
) {
    const post = mockPosts.find((item) => item.id === postId);

    if (!post) {
        throw new Error("Post not found");
    }

    const timestamp = new Date().toISOString();
    const nextComment: PublicComment = {
        id: `comment-${postId}-${Date.now()}`,
        username: input.username,
        content: input.content,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    const existingComments = mockCommentsByPost.get(postId) ?? [];
    mockCommentsByPost.set(postId, [nextComment, ...existingComments]);

    return { data: nextComment };
}
