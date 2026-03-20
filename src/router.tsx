import { createBrowserRouter, Navigate } from "react-router";
import AdminLayout from "@/features/admin/components/AdminLayout";
import RequireAuth from "@/features/admin/components/RequireAuth";
import CommentsPage from "@/features/admin/pages/CommentsPage";
import PostsPage from "@/features/admin/pages/PostsPage";
import HomePage from "@/features/public/pages/HomePage";
import PostContentPage from "@/features/public/pages/PostContentPage";
import LoginPage from "@/pages/Login";
import NotFoundPage from "@/pages/NotFound";

export const router = createBrowserRouter([
    { path: "/", element: <HomePage /> },
    { path: "/content/:id", element: <PostContentPage /> },
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
