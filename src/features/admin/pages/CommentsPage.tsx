import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaginationBar from "@/common/components/PaginationBar";
import { getErrorMessage } from "@/common/api/client";
import { formatDateTime } from "@/common/lib/format-date-time";
import {
    deleteComment,
    fetchAdminComments,
} from "@/features/admin/api/admin-blog-api";
import ConfirmDialog from "@/features/admin/components/ConfirmDialog";
import DateRangePicker from "@/features/admin/components/DateRangePicker";
import { adminQueryKeys } from "@/features/admin/lib/admin-query-keys";
import type { AdminComment } from "@/features/admin/types/admin-blog";

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
    const [deleteCommentState, setDeleteCommentState] = useState<AdminComment | null>(null);

    const searchParams = useMemo(
        () => ({
            page,
            pageSize,
            q: filters.q.trim() || undefined,
            startDate: filters.range?.from ? filters.range.from.toISOString() : undefined,
            endDate: filters.range?.to ? filters.range.to.toISOString() : undefined,
        }),
        [filters, page, pageSize]
    );

    const { data, isLoading, error } = useQuery({
        queryKey: adminQueryKeys.comments(searchParams),
        queryFn: () => fetchAdminComments(searchParams),
    });

    useEffect(() => {
        if (error) {
            toast.error(getErrorMessage(error));
        }
    }, [error]);

    const comments = data?.data ?? [];
    const meta = data?.meta;

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteComment(id),
        onSuccess: async () => {
            const nextTotal = (meta?.total ?? 1) - 1;
            if (page > 1 && nextTotal <= (page - 1) * pageSize) {
                setPage((currentPage) => Math.max(1, currentPage - 1));
            }
            await queryClient.invalidateQueries({ queryKey: adminQueryKeys.commentsList });
            setDeleteCommentState(null);
            toast.success("Comment deleted.");
        },
        onError: (mutationError) => toast.error(getErrorMessage(mutationError)),
    });

    const columns = useMemo<ColumnDef<AdminComment>[]>(
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
                    if (!open) {
                        setDeleteCommentState(null);
                    }
                }}
                onConfirm={() => {
                    if (deleteCommentState) {
                        deleteMutation.mutate(deleteCommentState.id);
                    }
                }}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
