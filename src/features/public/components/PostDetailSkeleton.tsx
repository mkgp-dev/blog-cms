import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PostDetailSkeleton() {
    return (
        <Card data-testid="post-detail-skeleton" className="border-border/70 bg-card/90 shadow-none">
            <CardHeader className="gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-4/5" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-40 w-full" />
            </CardContent>
        </Card>
    );
}
