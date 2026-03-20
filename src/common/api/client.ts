import { getToken } from "@/common/auth/token-storage";
import { notifyUnauthorized } from "@/common/auth/unauthorized-events";

const LOCAL_API_BASE_URL = "http://localhost:3000";
const HEALTH_CHECK_TTL_MS = 10_000;
const HEALTH_TIMEOUT_MS = 2_500;

type ApiErrorPayload = {
    error?: {
        code?: string;
        message?: string;
        details?: unknown;
    };
};

let resolvedBaseUrl: string | null = null;
let lastHealthCheck = 0;
let resolvePromise: Promise<string> | null = null;

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

const BASE_URL_CANDIDATES = parseBaseUrls(import.meta.env.VITE_API_BASE_URLS);

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

export function buildQuery(
    params: Record<string, string | number | boolean | undefined | null>
) {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") {
            continue;
        }

        search.set(key, String(value));
    }

    return search.toString();
}

export function buildBlogPath(path: string) {
    return `/v1/blog${path.startsWith("/") ? path : `/${path}`}`;
}

async function checkHealth(base: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    try {
        const response = await fetch(`${base}/`, {
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
        if (await checkHealth(base)) {
            return base;
        }
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

    if (resolvePromise) {
        return resolvePromise;
    }

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

export async function requestJson<T>(
    path: string,
    options: RequestInit = {},
    withAuth = true
): Promise<T> {
    const method = (options.method ?? "GET").toUpperCase();
    const canRetry = method === "GET" || method === "HEAD";
    const headers = new Headers(options.headers);

    headers.set("Accept", "application/json");

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (withAuth) {
        const token = await getToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
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
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong";
}
