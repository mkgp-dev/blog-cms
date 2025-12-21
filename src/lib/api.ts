import { getToken } from "@/lib/storage";
import type { Comment, Paginated, Post } from "@/lib/types";
import { notifyUnauthorized } from "@/lib/events";

function normalizeBaseUrl(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") {
        return "http://localhost:3000/api";
    }
    return trimmed;
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.API_BASE_URL);

type ApiErrorPayload = {
    error?: {
        code?: string;
        message?: string;
        details?: unknown;
    };
};

type CommentSearchParams = {
    page: number;
    pageSize: number;
    q?: string;
    startDate?: string;
    endDate?: string;
};

export class ApiError extends Error {
    status: number;
    code: string;
    details?: unknown;

    constructor(status: number, code: string, message: string, details?: unknown) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

function safeJson(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        search.set(key, String(value));
    }

    return search.toString();
}

async function apiFetch<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
    const base = API_BASE_URL;
    const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (withAuth) {
        const token = await getToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();
    const data = text ? safeJson(text) : null;

    if (!response.ok) {
        if (response.status === 401 && withAuth) {
            notifyUnauthorized();
        }

        const payload = (data ?? {}) as ApiErrorPayload;
        const message = payload.error?.message || response.statusText || "Request failed";
        const code = payload.error?.code || "request_failed";
        throw new ApiError(response.status, code, message, payload.error?.details);
    }

    return data as T;
}

export function getErrorMessage(error: unknown) {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return "Something went wrong";
}

export async function login(credentials: { email: string; password: string }) {
    const response = await apiFetch<any>(
        "/auth/login",
        {
            method: "POST",
            body: JSON.stringify(credentials),
        },
        false
    );

    const token =
        response?.data?.token ??
        response?.token ??
        response?.data?.accessToken ??
        response?.accessToken;

    if (!token || typeof token !== "string") {
        throw new ApiError(500, "invalid_response", "Login response missing token");
    }

    return { token };
}

export type PostSearchParams = {
    page: number;
    pageSize: number;
    q?: string;
    published?: boolean;
    startDate?: string;
    endDate?: string;
};

export async function fetchPosts(params: PostSearchParams) {
    const { page, pageSize, q, published, startDate, endDate } = params;
    const query = buildQuery({
        page,
        pageSize,
        q,
        published,
        startDate,
        endDate,
    });
    const hasFilters =
        Boolean(q || startDate || endDate) || published !== undefined;
    const suffix = query ? `?${query}` : "";
    const path = hasFilters
        ? `/admin/search/posts${suffix}`
        : `/admin/posts${suffix}`;

    return apiFetch<Paginated<Post>>(path);
}

export async function fetchComments(params: CommentSearchParams) {
    const { page, pageSize, q, startDate, endDate } = params;
    const query = buildQuery({
        page,
        pageSize,
        q,
        startDate,
        endDate,
    });
    const hasFilters = Boolean(q || startDate || endDate);
    const suffix = query ? `?${query}` : "";
    const path = hasFilters
        ? `/admin/search/comments${suffix}`
        : `/admin/comments${suffix}`;

    return apiFetch<Paginated<Comment>>(path);
}

export async function createPost(input: { title: string, content: string, published: boolean }) {
    return apiFetch<{ data: Post }>("/admin/posts", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export async function updatePost(
    id: string,
    input: { title: string, content: string, published: boolean }
) {
    return apiFetch<{ data: Post }>(`/admin/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
    });
}

export async function deletePost(id: string) {
    return apiFetch<{ data: { id: string } }>(`/admin/posts/${id}`, {
        method: "DELETE",
    });
}

export async function deleteComment(id: string) {
    return apiFetch<{ data: { id: string } }>(`/admin/comments/${id}`, {
        method: "DELETE",
    });
}