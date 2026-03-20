import type { PublicComment, PublicPost } from "@/features/public/types/public-blog";

export type AdminPost = PublicPost & {
    published: boolean;
    authorId: string;
};

export type AdminComment = PublicComment & {
    post?: {
        id: string;
        title: string;
    };
};
