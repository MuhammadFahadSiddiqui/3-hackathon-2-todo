"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useSession, signOut as betterAuthSignOut } from "@/lib/auth-client";

// T004: AuthState interface per data-model.md
interface User {
  id: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// T005: AuthProvider with Better Auth session
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error } = useSession();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: null,
    user: null,
    loading: true,
    error: null,
  });

  // Update state when session changes
  useEffect(() => {
    if (isPending) {
      setState((prev) => ({ ...prev, loading: true }));
      return;
    }

    if (error) {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || "Session error",
      });
      return;
    }

    if (session?.user) {
      setState({
        isAuthenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email || "",
        },
        loading: false,
        error: null,
      });
    } else {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  }, [session, isPending, error]);

  // Refresh user - triggers session refetch
  const refreshUser = useCallback(async () => {
    // Session is automatically refreshed by Better Auth
    // Just wait a tick for state to update
    await new Promise((resolve) => setTimeout(resolve, 100));
  }, []);

  // Legacy login function (not used with Better Auth, but kept for API compatibility)
  const login = useCallback(() => {
    // Better Auth handles login via signIn.email()
    // This is a no-op kept for backward compatibility
  }, []);

  const logout = useCallback(async () => {
    // Clear the backend auth token
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }

    try {
      await betterAuthSignOut();
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch {
      // Still mark as logged out even if signout fails
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
