import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DateRangePicker from "@/components/admin/DateRangePicker";
import PaginationBar from "@/components/admin/PaginationBar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteComment, fetchComments, getErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Comment } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

type FilterState = {
    q: string;
    range?: DateRange;
};

const defaultFilters: FilterState = {
    q: "",
    range: undefined,
};

export default function CommentsPage() {
    const queryClient = useQueryClient();

    const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [deleteCommentState, setDeleteCommentState] = useState<Comment | null>(null);

    const searchParams = useMemo(() => {
        return {
            page,
            pageSize,
            q: filters.q.trim() || undefined,
            startDate: filters.range?.from
                ? filters.range.from.toISOString()
                : undefined,
            endDate: filters.range?.to
                ? filters.range.to.toISOString()
                : undefined,
        };
    }, [filters, page, pageSize]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["comments", searchParams],
        queryFn: () => fetchComments(searchParams),
    });

    useEffect(() => {
        if (error) toast.error(getErrorMessage(error));
    }, [error]);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteComment(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["comments"] });
            setDeleteCommentState(null);
            toast.success("Comment deleted.");
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const comments = data?.data ?? [];
    const meta = data?.meta;
    const totalPages = meta ? Math.max(1, Math.ceil(meta.total / pageSize)) : 1;

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const columns = useMemo<ColumnDef<Comment>[]>(
        () => [
            {
                accessorKey: "username",
                header: "Username",
                cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
            },
            {
                accessorKey: "content",
                header: "Comment",
                cell: ({ row }) => (
                    <span className="block max-w-105 truncate">{row.original.content}</span>
                ),
            },
            {
                accessorKey: "postTitle",
                header: "Post",
                cell: ({ row }) => row.original.post?.title ?? row.original.post?.id,
            },
            {
                accessorKey: "createdAt",
                header: "Created",
                cell: ({ row }) => formatDateTime(row.original.createdAt),
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
                                <DropdownMenuItem
                                    onClick={() => setDeleteCommentState(row.original)}
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Comments</h1>
                <p className="text-sm text-muted-foreground">
                    Review and moderate comments across all posts.
                </p>
            </div>

            <div className="grid items-end gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="comment-search">Search comments</Label>
                    <Input
                        id="comment-search"
                        value={draftFilters.q}
                        onChange={(event) =>
                            setDraftFilters((prev) => ({ ...prev, q: event.target.value }))
                        }
                        placeholder="Search username or content..."
                    />
                </div>
                <div className="space-y-2">
                    <Label>Date range</Label>
                    <DateRangePicker
                        value={draftFilters.range}
                        onChange={(range) =>
                            setDraftFilters((prev) => ({ ...prev, range }))
                        }
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

            <DataTable columns={columns} data={comments} isLoading={isLoading} />

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

            <ConfirmDialog
                open={Boolean(deleteCommentState)}
                title="Delete this comment?"
                description="This action cannot be undone."
                onOpenChange={(open) => {
                    if (!open) setDeleteCommentState(null);
                }}
                onConfirm={() => {
                    if (deleteCommentState) deleteMutation.mutate(deleteCommentState.id);
                }}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}