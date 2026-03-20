import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PublicPostListSkeletonProps = {
    count?: number;
};

export function PublicPostListSkeleton({
    count = 9,
}: PublicPostListSkeletonProps) {
    return (
        <div
            data-testid="post-list-skeleton"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="border-border/70 bg-card/90 shadow-none">
                    <CardHeader>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-full" />
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-4 w-24" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
