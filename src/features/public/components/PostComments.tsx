import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import PaginationBar from "@/common/components/PaginationBar";
import { getErrorMessage } from "@/common/api/client";
import { formatDateTime } from "@/common/lib/format-date-time";
import {
    createPublicBlogComment,
    fetchPublicBlogComments,
    getResolvedPublicBlogDataSource,
} from "@/features/public/data/public-blog-data";
import { publicQueryKeys } from "@/features/public/lib/public-query-keys";

type PostCommentsProps = {
    postId: string;
};

const PAGE_SIZE = 10;

export function PostComments({ postId }: PostCommentsProps) {
    const queryClient = useQueryClient();
    const source = getResolvedPublicBlogDataSource();

    const [page, setPage] = useState(1);
    const [username, setUsername] = useState("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState<{ username?: string; content?: string }>({});

    const commentsQuery = useQuery({
        queryKey: publicQueryKeys.comments(postId, { page, pageSize: PAGE_SIZE, source }),
        queryFn: () => fetchPublicBlogComments(postId, { page, pageSize: PAGE_SIZE }),
    });

    useEffect(() => {
        if (commentsQuery.error) {
            toast.error(getErrorMessage(commentsQuery.error));
        }
    }, [commentsQuery.error]);

    const createCommentMutation = useMutation({
        mutationFn: (payload: { username: string; content: string }) =>
            createPublicBlogComment(postId, payload),
        onSuccess: async () => {
            setUsername("");
            setContent("");
            setErrors({});
            setPage(1);
            await queryClient.invalidateQueries({
                queryKey: publicQueryKeys.commentsList(postId, source),
            });
            toast.success("Comment submitted.");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors: { username?: string; content?: string } = {};
        if (!username.trim()) {
            nextErrors.username = "Name is required.";
        }
        if (!content.trim()) {
            nextErrors.content = "Comment is required.";
        }
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        createCommentMutation.mutate({
            username: username.trim(),
            content: content.trim(),
        });
    };

    const comments = commentsQuery.data?.data ?? [];
    const meta = commentsQuery.data?.meta;

    return (
        <section>
            <Card data-testid="comments-panel" className="border-border/70 bg-card/90 shadow-none">
                <CardHeader>
                    <CardTitle>Comments</CardTitle>
                    <CardDescription>Leave something interesting below.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                    <form
                        data-testid="comment-form"
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="comment-username">Name</Label>
                            <Input
                                id="comment-username"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                aria-invalid={Boolean(errors.username)}
                                data-testid="comment-username"
                            />
                            {errors.username ? (
                                <p className="text-xs text-destructive">{errors.username}</p>
                            ) : null}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="comment-content">Comment</Label>
                            <Textarea
                                id="comment-content"
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                aria-invalid={Boolean(errors.content)}
                                rows={6}
                                data-testid="comment-content"
                                className="resize-none"
                            />
                            {errors.content ? (
                                <p className="text-xs text-destructive">{errors.content}</p>
                            ) : null}
                        </div>
                        <Button
                            type="submit"
                            disabled={createCommentMutation.isPending}
                            data-testid="comment-submit"
                        >
                            {createCommentMutation.isPending ? "Submitting..." : "Submit comment"}
                        </Button>
                    </form>

                    <Separator />

                    <div data-testid="comment-list" className="flex flex-col gap-6">
                        {commentsQuery.isLoading ? (
                            <div data-testid="comments-skeleton" className="flex flex-col gap-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="rounded-lg border p-4">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="mt-4 h-4 w-full" />
                                        <Skeleton className="mt-2 h-4 w-5/6" />
                                    </div>
                                ))}
                            </div>
                        ) : null}

                        {!commentsQuery.isLoading && comments.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                                No comments yet. Be the first to leave one.
                            </div>
                        ) : null}

                        {!commentsQuery.isLoading && comments.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {comments.map((comment) => (
                                    <article key={comment.id} className="rounded-lg border p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="font-medium">{comment.username}</h3>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDateTime(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                            {comment.content}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        ) : null}

                        {meta ? (
                            <PaginationBar
                                page={page}
                                pageSize={meta.pageSize}
                                total={meta.total}
                                onPageChange={setPage}
                            />
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
