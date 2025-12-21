import { useAuth } from "@/lib/auth";
import { Navigate, Outlet, useLocation } from "react-router";

export default function RequireAuth() {
    const { token, ready } = useAuth();
    const location = useLocation();

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}