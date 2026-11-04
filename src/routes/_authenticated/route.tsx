import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { StaffMode } from "@/components/staff-mode";
import { verifyRestockAccess } from "@/lib/member.functions";
import { ShopProvider } from "@/components/shop-provider";
import { MemberShell } from "@/components/member-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { mode: "login" } });
    const { allowed: staff } = await verifyRestockAccess();
    return { user: data.user, staff };
  },
  component: AuthenticatedLayout,
});
function AuthenticatedLayout() {
  const { user, staff } = Route.useRouteContext();
  return <StaffMode key={user.id} id={user.id} staff={staff}><ShopProvider userId={user.id} canBuy={!staff}><MemberShell><Outlet /></MemberShell></ShopProvider></StaffMode>;
}
