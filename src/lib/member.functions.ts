import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMemberHome = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, role] = await Promise.all([
      context.supabase.from("profiles").select("display_name").eq("id", context.userId).single(),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);
    if (profile.error || role.error) throw new Error("No se ha podido cargar tu inicio.");
    return { displayName: profile.data.display_name, isAdmin: role.data === true };
  });

export const verifyRestockAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error) throw new Error("No se han podido comprobar tus permisos.");
    return { allowed: data === true };
  });