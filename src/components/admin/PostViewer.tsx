import { cn } from "@/lib/utils";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type PostViewerProps = {
    content: string;
    className?: string;
};

export default function PostViewer({ content, className }: PostViewerProps) {
    const editor = useEditor({
        extensions: [StarterKit, Underline],
        content: content || "",
        editable: false,
        editorProps: {
            attributes: {
                class: "prose max-w-none focus:outline-none",
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