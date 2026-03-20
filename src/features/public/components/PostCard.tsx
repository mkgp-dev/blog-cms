import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/common/lib/format-date-time";
import type { PublicPost } from "@/features/public/types/public-blog";

function stripHtml(value: string) {
    return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function buildExcerpt(value: string, limit = 180) {
    const plainText = stripHtml(value);
    if (plainText.length <= limit) {
        return plainText;
    }

    return `${plainText.slice(0, limit).trimEnd()}...`;
}

type PostCardProps = {
    post: PublicPost;
};

export function PostCard({ post }: PostCardProps) {
    return (
        <Card data-testid="post-card" className="h-full border-border/70 bg-card/90 shadow-none">
            <CardHeader>
                <CardDescription>
                    {formatDateTime(post.publishedAt || post.createdAt)}
                </CardDescription>
                <CardTitle className="text-xl leading-tight">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm leading-6 text-muted-foreground">
                    {buildExcerpt(post.content)}
                </p>
            </CardContent>
            <CardFooter>
                <Link
                    to={`/content/${post.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                    <span>Read article</span>
                    <ArrowRight className="size-4" />
                </Link>
            </CardFooter>
        </Card>
    );
}
