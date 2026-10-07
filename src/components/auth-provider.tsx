import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { user: User | null; loading: boolean; recovery: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();
  useEffect(() => {
    let alive = true;
    let version = 0;
    const verify = async () => {
      const current = ++version;
      try {
        const { data } = await supabase.auth.getUser();
        if (alive && current === version) { setUser(data.user); setLoading(false); }
      } catch { if (alive && current === version) { setUser(null); setLoading(false); } }
    };
    if (new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery") setRecovery(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") { setRecovery(true); void navigate({ to: "/reset-password" }); }
      if (event === "SIGNED_OUT") { version++; setUser(null); setRecovery(false); setLoading(false); }
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED" && event !== "PASSWORD_RECOVERY") return;
      // Auth callbacks must finish before calling further auth APIs.
      setTimeout(() => {
        if (!alive) return;
        if (event !== "SIGNED_OUT") { void verify(); void queryClient.invalidateQueries(); }
        void router.invalidate();
      }, 0);
    });
    void verify();
    return () => { alive = false; subscription.unsubscribe(); };
  }, [queryClient, router, navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setRecovery(false);
    await navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }
  return <AuthContext.Provider value={{ user, loading, recovery, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthProvider is required");
  return auth;
}