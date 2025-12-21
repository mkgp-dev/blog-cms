import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function NotFoundPage() {

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <div className="space-y-3 text-center">
                <h1 className="text-2xl font-semibold">Page not found</h1>
                <p className="text-sm text-muted-foreground">
                    The page you are looking for does not exist.
                </p>
                <Button asChild>
                    <Link to="/admin/posts">Go to dashboard</Link>
                </Button>
            </div>
        </div>
    );
}