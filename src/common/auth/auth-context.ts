import { createContext } from "react";

export type AuthContextValue = {
    token: string | null;
    setToken: (token: string | null) => Promise<void>;
    logout: () => Promise<void>;
    ready: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
