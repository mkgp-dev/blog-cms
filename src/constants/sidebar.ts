import { MessageSquareText, StickyNote, type LucideIcon } from "lucide-react";

export type SidebarDefinition = {
    name: string;
    path: string;
    icon: LucideIcon,
};

export const SIDEBAR_LIST: SidebarDefinition[] = [
    {
        name: "Posts",
        path: "/admin/posts",
        icon: StickyNote,
    },
    {
        name: "Comments",
        path: "/admin/comments",
        icon: MessageSquareText,
    },
];