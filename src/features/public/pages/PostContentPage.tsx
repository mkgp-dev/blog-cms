import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/common/api/client";
import RichTextViewer from "@/common/components/RichTextViewer";
import { formatDateTime } from "@/common/lib/format-date-time";
import { PostComments } from "@/features/public/components/PostComments";
import { PostDetailSkeleton } from "@/features/public/components/PostDetailSkeleton";
import { PublicLayout } from "@/features/public/components/PublicLayout";
import {
    fetchPublicBlogPost,
    getResolvedPublicBlogDataSource,
} from "@/features/public/data/public-blog-data";
import { publicQueryKeys } from "@/features/public/lib/public-query-keys";

export default function PostContentPage() {
    const { id } = useParams();
    const source = getResolvedPublicBlogDataSource();

    const postQuery = useQuery({
        queryKey: publicQueryKeys.post(id ?? "", source),
        queryFn: () => fetchPublicBlogPost(id ?? ""),
        enabled: Boolean(id),
    });

    const post = postQuery.data?.data;

    return (
        <PublicLayout>
            <div>
                <Button asChild variant="ghost" className="px-0">
                    <Link to="/">
                        <ArrowLeft className="size-4" />
                        <span>Back</span>
                    </Link>
                </Button>
            </div>

            {postQuery.isLoading ? <PostDetailSkeleton /> : null}

            {!postQuery.isLoading && postQuery.error ? (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardHeader>
                        <CardTitle>Unable to load this post</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-destructive">
                        {getErrorMessage(postQuery.error)}
                    </CardContent>
                </Card>
            ) : null}

            {!postQuery.isLoading && !postQuery.error && post ? (
                <div className="flex flex-col gap-4">
                    <article className="flex flex-col gap-6 rounded-3xl border border-border/70 bg-card/90 p-6 lg:p-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Published {formatDateTime(post.publishedAt || post.createdAt)}
                                </p>
                                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
                                    {post.title}
                                </h1>
                            </div>
                        </div>
                        <RichTextViewer
                            content={post.content}
                            className="min-h-80 border-none bg-transparent p-0 text-base"
                        />
                    </article>

                    <PostComments postId={post.id} />
                </div>
            ) : null}
        </PublicLayout>
    );
}
