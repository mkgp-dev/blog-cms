import type { Post } from "@/lib/types";
import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import PostEditor from "@/components/admin/PostEditor";

type PostDialogProps = {
    open: boolean;
    mode: "create" | "edit";
    initialValues?: Post | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: { title: string; content: string; published: boolean }) => void;
    isSubmitting?: boolean;
};

type FormState = {
    title: string;
    content: string;
    published: boolean;
};

export default function PostDialog({ open, mode, initialValues, onOpenChange, onSubmit, isSubmitting = false }: PostDialogProps) {
    const [form, setForm] = useState<FormState>({
        title: "",
        content: "",
        published: false,
    });

    const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

    useEffect(() => {
        if (!open) return;

        setForm({
            title: initialValues?.title ?? "",
            content: initialValues?.content ?? "",
            published: initialValues?.published ?? false,
        });

        setErrors({});
    }, [open, initialValues]);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        const nextErrors: { title?: string; content?: string } = {};
        if (!form.title.trim()) nextErrors.title = "Title is required.";
        if (!form.content.trim()) nextErrors.content = "Content is required.";
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) return;
        onSubmit({
            title: form.title.trim(),
            content: form.content.trim(),
            published: form.published,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-175">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "New Post" : "Edit Post"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="post-title">Title</Label>
                        <Input
                            id="post-title"
                            value={form.title}
                            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                            aria-invalid={Boolean(errors.title)}
                            className={errors.title ? "border-destructive" : undefined}
                        />
                        {errors.title ? (
                            <p className="text-xs text-destructive">{errors.title}</p>
                        ) : null}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="post-content">Content</Label>
                        <PostEditor
                            value={form.content}
                            onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
                            className={errors.content ? "border-destructive" : undefined}
                        />
                        {errors.content ? (
                            <p className="text-xs text-destructive">{errors.content}</p>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="post-published"
                            checked={form.published}
                            onCheckedChange={(checked) =>
                                setForm((prev) => ({ ...prev, published: Boolean(checked) }))
                            }
                        />
                        <Label htmlFor="post-published">Published</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}