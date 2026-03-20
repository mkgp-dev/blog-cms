import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useAuth } from "@/common/auth/useAuth";

export default function NotFoundPage() {
    const { token } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <div className="space-y-3 text-center">
                <h1 className="text-2xl font-semibold">Page not found</h1>
                <p className="text-sm text-muted-foreground">
                    The page you are looking for does not exist.
                </p>
                <Button asChild>
                    <Link to={token ? "/admin/posts" : "/"}>
                        {token ? "Go to dashboard" : "Go to homepage"}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
