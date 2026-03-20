import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/common/auth/useAuth";

type PublicLayoutProps = {
    children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
    const { token } = useAuth();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(24,24,27,0.08),transparent_55%)]" />
            <header
                data-testid="public-nav-shell"
                className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8"
            >
                <div
                    data-testid="public-nav"
                    className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/75 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/65"
                >
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Blog CMS" className="size-10 object-contain" />
                    </Link>
                    <nav className="flex items-center">
                        <Button asChild className="rounded-full">
                            <Link to={token ? "/admin/posts" : "/login"}>
                                {token ? "Dashboard" : "Login"}
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-10.5 px-4 pb-12 pt-32 sm:px-6 sm:pt-28 lg:px-8">
                {children}
            </main>
        </div>
    );
}
