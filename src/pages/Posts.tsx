import { createPost, deletePost, fetchPosts, getErrorMessage, updatePost } from "@/lib/api";
import type { Post } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { DataTable } from "@/components/ui/data-table";
import PaginationBar from "@/components/admin/PaginationBar";
import PostDialog from "@/components/admin/PostDialog";
import { PostViewDialog } from "@/components/admin/PostViewDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { CirclePlus, MoreHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterState = {
    q: string;
    published: "all" | "published" | "draft";
    range?: DateRange;
};

const defaultFilters: FilterState = {
    q: "",
    published: "all",
    range: undefined,
};

export default function PostsPage() {
    const queryClient = useQueryClient();

    const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [dialogState, setDialogState] = useState<{
        open: boolean;
        mode: "create" | "edit";
        post: Post | null;
    }>({
        open: false,
        mode: "create",
        post: null,
    });

    const [viewPost, setViewPost] = useState<Post | null>(null);
    const [deletePostState, setDeletePostState] = useState<Post | null>(null);

    const searchParams = useMemo(() => {
        return {
            page,
            pageSize,
            q: filters.q.trim() || undefined,
            published: filters.published === "all" ? undefined : filters.published === "published",
            startDate: filters.range?.from
                ? filters.range.from.toISOString()
                : undefined,
            endDate: filters.range?.to
                ? filters.range.to.toISOString()
                : undefined,
        };
    }, [filters, page, pageSize]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["posts", searchParams],
        queryFn: () => fetchPosts(searchParams),
    });

    useEffect(() => {
        if (error) toast.error(getErrorMessage(error));
    }, [error]);

    const createMutation = useMutation({
        mutationFn: createPost,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            setDialogState({ open: false, mode: "create", post: null });
            toast.success("Post created.");
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { title: string; content: string; published: boolean } }) => updatePost(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            setDialogState({ open: false, mode: "create", post: null });
            toast.success("Post updated.");
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePost(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            setDeletePostState(null);
            toast.success("Post deleted.");
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const posts = data?.data ?? [];
    const meta = data?.meta;
    const totalPages = meta ? Math.max(1, Math.ceil(meta.total / pageSize)) : 1;

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const columns = useMemo<ColumnDef<Post>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
            },
            {
                accessorKey: "published",
                header: "Status",
                cell: ({ row }) => (
                    <Badge variant={row.original.published ? "default" : "secondary"}>
                        {row.original.published ? "Published" : "Draft"}
                    </Badge>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => formatDateTime(row.original.createdAt),
            },
            {
                accessorKey: "updatedAt",
                header: "Updated",
                cell: ({ row }) => formatDateTime(row.original.updatedAt),
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setViewPost(row.original)}>
                                    View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        setDialogState({ open: true, mode: "edit", post: row.original })
                                    }
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setDeletePostState(row.original)}
                                    className="text-destructive"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                ),
            },
        ],
        []
    );

    const handleApplyFilters = () => {
        setFilters(draftFilters);
        setPage(1);
    };

    const handleResetFilters = () => {
        setDraftFilters(defaultFilters);
        setFilters(defaultFilters);
        setPage(1);
    };

    const handleSubmitPost = (payload: { title: string; content: string; published: boolean }) => {
        if (dialogState.mode === "create") {
            createMutation.mutate(payload);
        } else if (dialogState.post) {
            updateMutation.mutate({ id: dialogState.post.id, payload });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Posts</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your posts efficiently by creating, editing, publishing, and organizing content in one place.
                    </p>
                </div>
                <Button onClick={() => setDialogState({ open: true, mode: "create", post: null })}>
                    <CirclePlus />
                    <span>Create a new post</span>
                </Button>
            </div>

            <div className="grid items-end gap-4 md:grid-cols-4">
                <div className="space-y-2">
                    <Label htmlFor="post-search">Search title</Label>
                    <Input
                        id="post-search"
                        value={draftFilters.q}
                        onChange={(event) =>
                            setDraftFilters((prev) => ({ ...prev, q: event.target.value }))
                        }
                        placeholder="Search posts..."
                        className="h-9"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="post-status">Published</Label>
                    <Select
                        value={draftFilters.published}
                        onValueChange={(value) =>
                            setDraftFilters((prev) => ({
                                ...prev,
                                published: value as FilterState["published"],
                            }))
                        }
                    >
                        <SelectTrigger id="post-status" className="h-9 w-full">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Unpublished</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Date range</Label>
                    <DateRangePicker
                        value={draftFilters.range}
                        onChange={(range) =>
                            setDraftFilters((prev) => ({ ...prev, range }))
                        }
                        className="h-9"
                    />
                </div>
                <div className="flex items-end gap-2">
                    <Button type="button" onClick={handleApplyFilters}>
                        Apply
                    </Button>
                    <Button type="button" variant="outline" onClick={handleResetFilters}>
                        Reset
                    </Button>
                </div>
            </div>

            <DataTable columns={columns} data={posts} isLoading={isLoading} />

            {meta ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>
                            Page {meta.page} of {Math.max(1, Math.ceil(meta.total / meta.pageSize))}
                        </span>
                        <select
                            value={pageSize}
                            onChange={(event) => {
                                setPageSize(Number(event.target.value));
                                setPage(1);
                            }}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        >
                            {[10, 20, 50].map((size) => (
                                <option key={size} value={size}>
                                    {size} / page
                                </option>
                            ))}
                        </select>
                    </div>
                    <PaginationBar
                        page={page}
                        pageSize={pageSize}
                        total={meta.total}
                        onPageChange={setPage}
                    />
                </div>
            ) : null}

            <PostDialog
                open={dialogState.open}
                mode={dialogState.mode}
                initialValues={dialogState.post}
                onOpenChange={(open) =>
                    setDialogState((prev) => ({ ...prev, open, post: open ? prev.post : null }))
                }
                onSubmit={handleSubmitPost}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            <PostViewDialog
                open={Boolean(viewPost)}
                post={viewPost}
                onOpenChange={(open) => {
                    if (!open) setViewPost(null);
                }}
            />

            <ConfirmDialog
                open={Boolean(deletePostState)}
                title="Delete this post?"
                description="This action cannot be undone."
                onOpenChange={(open) => {
                    if (!open) setDeletePostState(null);
                }}
                onConfirm={() => {
                    if (deletePostState) deleteMutation.mutate(deletePostState.id);
                }}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}