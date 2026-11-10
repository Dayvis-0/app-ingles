import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signInWithCredentials, type AuthRole, type AuthUser } from "../lib/auth";

const STORAGE_KEY = "unajma_current_user";

type StoredSession = {
  user: AuthUser;
  role: AuthRole;
};

type LoginOutcome = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  role: AuthRole | null;
  login: (username: string, password: string) => Promise<LoginOutcome>;
  logout: () => void;
};

/* eslint-disable react-refresh/only-export-components -- provider and hook intentionally live in one context file */
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (
      parsed &&
      typeof parsed.user === "object" &&
      parsed.user !== null &&
      (parsed.role === "docente" || parsed.role === "estudiante")
    ) {
      return parsed as StoredSession;
    }
    return null;
  } catch {
    return null;
  }
}

function persistSession(session: StoredSession | null): void {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<StoredSession | null>(() =>
    readStoredSession(),
  );

  useEffect(() => {
    // Restore an existing session on first mount (state initializer already
    // read it; persist once to normalize corrupt values to nothing).
    persistSession(session);
  }, [session]);

  const login = useCallback(
    async (username: string, password: string): Promise<LoginOutcome> => {
      try {
        const result = await signInWithCredentials(username, password);
        if (!result) {
          return { ok: false, message: "Wrong username or password. Try again." };
        }
        persistSession(result);
        setSession(result);
        return { ok: true };
      } catch (error) {
        const detail =
          error instanceof Error ? error.message : "Unexpected error.";
        return { ok: false, message: `Could not sign in: ${detail}` };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    persistSession(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      role: session?.role ?? null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>.");
  }
  return ctx;
}
