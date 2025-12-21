import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearToken, getToken, setToken } from "@/lib/storage";
import { onUnauthorized } from "@/lib/events";

type AuthContextValue = {
    token: string | null;
    setToken: (token: string | null) => Promise<void>;
    logout: () => Promise<void>;
    ready: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;
        getToken()
            .then((data) => {
                if (active) setTokenState(data ?? null);
            })
            .finally(() => {
                if (active) setReady(true);
            });
        return () => {
            active = false;
        };
    }, []);

    const setTokenValue = useCallback(async (value: string | null) => {
        if (value) {
            await setToken(value);
            setTokenState(value);
        } else {
            await clearToken();
            setTokenState(null);
        }
    }, []);

    const logout = useCallback(async () => {
        await setTokenValue(null);
    }, [setTokenValue]);

    useEffect(() => {
        const unsubscribe = onUnauthorized(() => {
            void setTokenValue(null);
        });
        return () => {
            unsubscribe();
        };
    }, [setTokenValue]);

    const value = useMemo(
        () => ({ token, setToken: setTokenValue, logout, ready }),
        [token, setTokenValue, logout, ready]
    );

    return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used with AuthProvider");

    return context;
}