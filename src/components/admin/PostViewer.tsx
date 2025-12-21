import { cn } from "@/lib/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type PostViewerProps = {
    content: string;
    className?: string;
};

export default function PostViewer({ content, className }: PostViewerProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content || "",
        editable: false,
        editorProps: {
            attributes: {
                class: "tiptap",
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const html = editor.getHTML();
        if (content !== html) {
            editor.commands.setContent(content || "");
        }
    }, [content, editor]);

    return (
        <EditorContent
            editor={editor}
            className={cn("rounded-md border bg-muted/40 p-4 text-sm", className)}
        />
    );
}