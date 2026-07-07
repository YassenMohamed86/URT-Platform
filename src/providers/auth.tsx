import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { trpc } from "./trpc";
import { getCompletedPassageIds } from "@/lib/practiceProgress";

const TOKEN_KEY = "urt_user_token";

export type AuthUser = {
  id: number;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
  });

  const claimMutation = trpc.practice.claimLocalProgress.useMutation();

  // If a token is present but the server says nobody's there (expired,
  // tampered, or from a deployment where AUTH_JWT_SECRET changed), drop it
  // instead of leaving the UI stuck thinking someone might be signed in.
  useEffect(() => {
    if (token && !meQuery.isLoading && meQuery.data === null) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }
  }, [token, meQuery.isLoading, meQuery.data]);

  const setSession = (newToken: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);

    // Prime the cache with what the login/signup response already gave us,
    // so the navbar flips to "signed in" immediately instead of waiting on
    // a fresh /auth.me round trip.
    utils.auth.me.setData(undefined, user);

    // Hand over any progress made as a guest on this device — best effort,
    // failure here shouldn't block signing in.
    const localIds = Array.from(getCompletedPassageIds());
    if (localIds.length > 0) {
      claimMutation.mutate({ passageIds: localIds });
    }

    utils.practice.listCompleted.invalidate();
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    utils.auth.me.invalidate();
    utils.practice.listCompleted.invalidate();
  };

  return (
    <AuthContext.Provider
      value={{
        user: token ? meQuery.data ?? null : null,
        isLoading: !!token && meQuery.isLoading,
        setSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
