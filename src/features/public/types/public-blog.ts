export type PublicPost = {
    id: string;
    title: string;
    content: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type PublicComment = {
    id: string;
    username: string;
    content: string;
    createdAt: string;
    updatedAt: string;
};
