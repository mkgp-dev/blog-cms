import { getToken } from "@/lib/storage";
import type { Comment, Paginated, Post } from "@/lib/types";
import { notifyUnauthorized } from "@/lib/events";

const LOCAL_API_BASE_URL = "http://localhost:3000/api";
const HEALTH_CHECK_TTL_MS = 10000;
const HEALTH_TIMEOUT_MS = 2500;

function normalizeBaseUrl(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") {
        return "";
    }
    return trimmed.replace(/\/+$/, "");
}

function parseBaseUrls(...values: Array<string | undefined>) {
    const entries = values
        .flatMap((value) => value?.split(",") ?? [])
        .map((value) => normalizeBaseUrl(value))
        .filter(Boolean);

    const unique = Array.from(new Set(entries));
    return unique.length ? unique : [LOCAL_API_BASE_URL];
}

const BASE_URL_CANDIDATES = parseBaseUrls(
    import.meta.env.VITE_API_BASE_URLS
);

let resolvedBaseUrl: string | null = null;
let lastHealthCheck = 0;
let resolvePromise: Promise<string> | null = null;

async function checkHealth(base: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
    try {
        const response = await fetch(`${base}/health`, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
        });
        return response.ok;
    } catch {
        return false;
    } finally {
        clearTimeout(timeoutId);
    }
}

async function pickHealthyBase() {
    for (const base of BASE_URL_CANDIDATES) {
        if (await checkHealth(base)) return base;
    }
    return BASE_URL_CANDIDATES[0];
}

async function resolveBaseUrl(force = false) {
    if (BASE_URL_CANDIDATES.length === 1) {
        resolvedBaseUrl = BASE_URL_CANDIDATES[0];
        return resolvedBaseUrl;
    }

    const now = Date.now();
    if (!force && resolvedBaseUrl && now - lastHealthCheck < HEALTH_CHECK_TTL_MS) {
        return resolvedBaseUrl;
    }

    if (resolvePromise) return resolvePromise;
    resolvePromise = pickHealthyBase().then((base) => {
        resolvedBaseUrl = base;
        lastHealthCheck = Date.now();
        resolvePromise = null;
        return base;
    });

    return resolvePromise;
}

function markHealthStale() {
    resolvedBaseUrl = null;
    lastHealthCheck = 0;
}

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
    const method = (options.method ?? "GET").toUpperCase();
    const canRetry = method === "GET" || method === "HEAD";
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    if (withAuth) {
        const token = await getToken();
        if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    const doRequest = async (base: string) => {
        const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
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
    };

    const base = await resolveBaseUrl();
    try {
        return await doRequest(base);
    } catch (error) {
        markHealthStale();

        const shouldRetry =
            canRetry &&
            BASE_URL_CANDIDATES.length > 1 &&
            (error instanceof ApiError ? error.status >= 500 || error.status === 0 : true);

        if (shouldRetry) {
            const fallbackBase = await resolveBaseUrl(true);
            if (fallbackBase !== base) {
                return await doRequest(fallbackBase);
            }
        }

        throw error;
    }
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