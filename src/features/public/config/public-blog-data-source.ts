export type PublicBlogDataSource = "real" | "mock";

export const DEFAULT_PUBLIC_BLOG_DATA_SOURCE: PublicBlogDataSource = "real";

declare global {
    interface Window {
        __BLOG_PUBLIC_DATA_SOURCE__?: PublicBlogDataSource;
    }
}

export function getPublicBlogDataSource(): PublicBlogDataSource {
    if (typeof window !== "undefined" && window.__BLOG_PUBLIC_DATA_SOURCE__) {
        return window.__BLOG_PUBLIC_DATA_SOURCE__;
    }

    return DEFAULT_PUBLIC_BLOG_DATA_SOURCE;
}
