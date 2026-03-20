import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/common/api/client";
import { PostCard } from "@/features/public/components/PostCard";
import { PublicLayout } from "@/features/public/components/PublicLayout";
import { PublicPostListSkeleton } from "@/features/public/components/PublicPostListSkeleton";
import {
    fetchPublicBlogPosts,
    getResolvedPublicBlogDataSource,
} from "@/features/public/data/public-blog-data";
import { publicQueryKeys } from "@/features/public/lib/public-query-keys";

const PAGE_SIZE = 9;

export default function HomePage() {
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const source = getResolvedPublicBlogDataSource();
    const [hasScrolled, setHasScrolled] = useState(false);

    const postsQuery = useInfiniteQuery({
        queryKey: publicQueryKeys.feed({ pageSize: PAGE_SIZE, source }),
        initialPageParam: 1,
        queryFn: ({ pageParam }) =>
            fetchPublicBlogPosts({ page: pageParam, pageSize: PAGE_SIZE }),
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
            return loaded < lastPage.meta.total ? allPages.length + 1 : undefined;
        },
    });

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = postsQuery;

    const posts = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

    useEffect(() => {
        if (typeof window === "undefined" || hasScrolled) {
            return;
        }

        const handleScroll = () => {
            if (window.scrollY > 24) {
                setHasScrolled(true);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [hasScrolled]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasScrolled || !hasNextPage || isFetchingNextPage) {
            return;
        }
        if (typeof window === "undefined" || typeof window.IntersectionObserver === "undefined") {
            return;
        }

        const observer = new window.IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage();
                }
            },
            { rootMargin: "420px 0px" }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [fetchNextPage, hasNextPage, hasScrolled, isFetchingNextPage, posts.length]);

    return (
        <PublicLayout>
            <section className="flex flex-col gap-6">
                <div className="flex items-center justify-start gap-4">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-2xl font-semibold">Published posts</h2>
                        <p className="text-sm text-muted-foreground">
                            Browse my amusing contents.
                        </p>
                    </div>
                </div>

                {isLoading ? <PublicPostListSkeleton count={PAGE_SIZE} /> : null}

                {!isLoading && error && posts.length === 0 ? (
                    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                        {getErrorMessage(error)}
                    </div>
                ) : null}

                {!isLoading && !error && posts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
                        No published posts are available yet.
                    </div>
                ) : null}

                {!isLoading && posts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : null}

                {posts.length > 0 ? (
                    <div className="flex flex-col items-center gap-4">
                        {isFetchingNextPage ? (
                            <div className="w-full">
                                <PublicPostListSkeleton count={3} />
                            </div>
                        ) : null}

                        {error && posts.length > 0 ? (
                            <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
                        ) : null}

                        <div
                            ref={sentinelRef}
                            data-testid="post-feed-sentinel"
                            className="h-px w-full"
                        />

                        {hasNextPage ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void fetchNextPage()}
                                disabled={isFetchingNextPage}
                                data-testid="load-more-posts"
                            >
                                {isFetchingNextPage ? "Loading more..." : "Load more"}
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                You have reached the end of the feed.
                            </p>
                        )}
                    </div>
                ) : null}
            </section>
        </PublicLayout>
    );
}
