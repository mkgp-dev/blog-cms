import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RichTextViewer from "@/common/components/RichTextViewer";
import { formatDateTime } from "@/common/lib/format-date-time";
import type { AdminPost } from "@/features/admin/types/admin-blog";

type PostViewDialogProps = {
    open: boolean;
    post: AdminPost | null;
    onOpenChange: (open: boolean) => void;
};

export function PostViewDialog({ open, post, onOpenChange }: PostViewDialogProps) {
    if (!post) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-175">
                <DialogHeader>
                    <DialogTitle>{post.title}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                    </Badge>
                    <span>Created {formatDateTime(post.createdAt)}</span>
                    <span>Updated {formatDateTime(post.updatedAt)}</span>
                </div>
                <RichTextViewer
                    content={post.content}
                    className="mt-4 min-h-55 max-h-90 overflow-y-auto"
                />
            </DialogContent>
        </Dialog>
    );
}
