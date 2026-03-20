import { useEffect } from "react";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

type RichTextViewerProps = {
    content: string;
    className?: string;
};

export default function RichTextViewer({ content, className }: RichTextViewerProps) {
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
        if (!editor) {
            return;
        }

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
