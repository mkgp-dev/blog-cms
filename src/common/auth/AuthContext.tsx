import {
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { AuthContext } from "@/common/auth/auth-context";
import { clearToken, getToken, setToken } from "@/common/auth/token-storage";
import { onUnauthorized } from "@/common/auth/unauthorized-events";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let active = true;

        getToken()
            .then((storedToken) => {
                if (active) {
                    setTokenState(storedToken ?? null);
                }
            })
            .finally(() => {
                if (active) {
                    setReady(true);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const setTokenValue = useCallback(async (value: string | null) => {
        if (value) {
            await setToken(value);
            setTokenState(value);
            return;
        }

        await clearToken();
        setTokenState(null);
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
        [logout, ready, setTokenValue, token]
    );

    return createElement(AuthContext.Provider, { value }, children);
}
