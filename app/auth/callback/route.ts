import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // If the invite flow specified a redirect target, use it
        // (e.g. /technicien/onboarding after invite email)
        if (next && next !== "/" && next.startsWith("/")) {
          return NextResponse.redirect(new URL(next, origin));
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_done")
          .eq("user_id", user.id)
          .maybeSingle();

        // Technicien who has never completed onboarding → set password first
        if (profile?.role === "technicien" && !profile?.onboarding_done) {
          return NextResponse.redirect(new URL("/technicien/onboarding", origin));
        }

        const roleRedirect =
          profile?.role === "admin" ? "/admin-noxyera"
          : profile?.role === "technicien" ? "/technicien/missions"
          : "/dashboard";

        return NextResponse.redirect(new URL(roleRedirect, origin));
      }
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback", origin));
}
