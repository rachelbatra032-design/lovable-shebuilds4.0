import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // getSession reads the saved session locally, so a brief network hiccup
    // doesn't kick the user back to the sign-in page. Data access is still
    // protected by the database's own access rules.
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) throw redirect({ to: "/auth", search: { redirect: location.pathname } });
    return { user };
  },
  component: () => <Outlet />,
});
