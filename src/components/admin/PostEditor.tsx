import { cn } from "@/lib/utils";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, CircleSmall, Code, Heading2, Heading3, Highlighter, Italic, ListOrdered, Redo2, TextQuote, Undo2 } from "lucide-react";

type PostEditorProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

export default function PostEditor({ value, onChange, className }: PostEditorProps) {

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
        ],
        content: value || "",
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "tiptap focus:outline-none",
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const html = editor.getHTML();
        if (value !== html) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    const canBold = editor?.can().chain().focus().toggleBold().run() ?? false;
    const canItalic = editor?.can().chain().focus().toggleItalic().run() ?? false;
    const canH2 = editor?.can().chain().focus().toggleHeading({ level: 2 }).run() ?? false;
    const canH3 = editor?.can().chain().focus().toggleHeading({ level: 3 }).run() ?? false;
    const canBullet = editor?.can().chain().focus().toggleBulletList().run() ?? false;
    const canOrdered = editor?.can().chain().focus().toggleOrderedList().run() ?? false;
    const canQuote = editor?.can().chain().focus().toggleBlockquote().run() ?? false;
    const canCode = editor?.can().chain().focus().toggleCode().run() ?? false;
    const canCodeBlock = editor?.can().chain().focus().toggleCodeBlock().run() ?? false;
    const canUndo = editor?.can().chain().focus().undo().run() ?? false;
    const canRedo = editor?.can().chain().focus().redo().run() ?? false;

    return (
        <div className={cn("rounded-md border bg-background", className)}>
            <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
                <Button
                    type="button"
                    variant={editor?.isActive("bold") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    disabled={!canBold}
                >
                    <Bold />
                </Button>
                <Button
                    type="button"
                    variant={editor?.isActive("italic") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={!canItalic}
                >
                    <Italic />
                </Button>
                <Button
                    type="button"
                    variant={editor?.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    disabled={!canH2}
                >
                    <Heading2 />
                </Button>
                <Button
                    type="button"
                    variant={editor?.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                    disabled={!canH3}
                >
                    <Heading3 />
                </Button>
                <Button
                    type="button"
                    variant={editor?.isActive("bulletList") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    disabled={!canBullet}
                >
                    <CircleSmall />
                </Button>
                <Button
                    type="button"
                    variant={editor?.isActive("orderedList") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    disabled={!canOrdered}
                >
                    <ListOrdered />
                </Button>
                <Button
                    type="button"
                    variant={editor?.isActive("blockquote") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    disabled={!canQuote}
                >
                    <TextQuote />
                </Button>
                <Button
                    type="button"
                    variant={editor?.isActive("code") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleCode().run()}
                    disabled={!canCode}
                >
                    <Highlighter />
                </Button>
                <Button
                    type="button"
                    variant={editor?.isActive("codeBlock") ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                    disabled={!canCodeBlock}
                >
                    <Code />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().undo().run()}
                    disabled={!canUndo}
                >
                    <Undo2 />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => editor?.chain().focus().redo().run()}
                    disabled={!canRedo}
                >
                    <Redo2 />
                </Button>
            </div>
            <EditorContent editor={editor} className="min-h-55 max-h-90 overflow-y-auto p-3 text-sm" />
        </div>
    );
}