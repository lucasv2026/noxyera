import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getProtectedRoute } from "@/lib/auth/roles";
import {
  createMiddlewareClient,
  redirectWithCookies
} from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const protectedRoute = getProtectedRoute(request.nextUrl.pathname);

  if (!protectedRoute) {
    return NextResponse.next();
  }

  // Skip auth in dev when Supabase is not configured OR demo mode is enabled
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithCookies(request, response, protectedRoute.loginPath);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.role !== protectedRoute.role) {
    return redirectWithCookies(request, response, protectedRoute.loginPath);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/technicien/:path*",
    "/admin/:path*"
  ]
};
