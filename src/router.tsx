import { useAuth } from "@/lib/auth";
import { createBrowserRouter, Navigate } from "react-router";
import LoginPage from "@/pages/Login";
import RequireAuth from "@/components/admin/RequireAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import PostsPage from "@/pages/Posts";
import CommentsPage from "@/pages/Comments";
import NotFoundPage from "@/pages/NotFound";

function RootRedirect() {
    const { token } = useAuth();
    return <Navigate to={token ? "/admin/posts" : "/login"} replace />;
}

export const router = createBrowserRouter([
    { path: "/", element: <RootRedirect /> },
    { path: "/login", element: <LoginPage /> },
    {
        path: "/admin",
        element: <RequireAuth />,
        children: [
            {
                element: <AdminLayout />,
                children: [
                    { index: true, element: <Navigate to="posts" replace /> },
                    { path: "posts", element: <PostsPage /> },
                    { path: "comments", element: <CommentsPage /> },
                ],
            },
        ],
    },
    { path: "*", element: <NotFoundPage /> },
]);