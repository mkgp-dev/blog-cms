import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage, login } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { token, setToken, ready } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    useEffect(() => {
        if (ready && token) {
            navigate("/admin/posts", { replace: true });
        }
    }, [token, ready, navigate]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const nextErrors: { email?: string; password?: string } = {};
        if (!email.trim()) nextErrors.email = "Email is required.";
        if (!password.trim()) nextErrors.password = "Password is required.";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            const result = await login({ email: email.trim(), password });
            await setToken(result.token);

            const redirectTo =
                (location.state as { from?: Location })?.from?.pathname || "/admin/posts";
            navigate(redirectTo, { replace: true });
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <div className="flex flex-col w-full items-center gap-6 lg:justify-start">
                <a href="/login">
                    <img
                        src="/logo.png"
                        alt="logo"
                        title="logo"
                        className="h-20"
                    />
                </a>

                <Card className="w-full max-w-sm">
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    aria-invalid={Boolean(errors.email)}
                                    className={errors.email ? "border-destructive" : undefined}
                                />
                                {errors.email ? (
                                    <p className="text-xs text-destructive">{errors.email}</p>
                                ) : null}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    aria-invalid={Boolean(errors.password)}
                                    className={errors.password ? "border-destructive" : undefined}
                                />
                                {errors.password ? (
                                    <p className="text-xs text-destructive">{errors.password}</p>
                                ) : null}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <div className="flex flex-row items-center gap-2">
                                        <Spinner />
                                        <span>Signing in...</span>
                                    </div>
                                ) : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}