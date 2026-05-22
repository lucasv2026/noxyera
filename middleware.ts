import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Récupère la clé anonyme Supabase — compatible nouvelles (PUBLISHABLE) et anciennes (ANON) configs
function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── 1. Espace admin — géré par son propre layout (cookie .env) ──────────
  if (pathname.startsWith("/admin-noxyera")) {
    return NextResponse.next();
  }

  // ── 2. Routes API et assets — laisser passer ────────────────────────────
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // ── 3. Routes publiques — laisser passer ────────────────────────────────
  const publicPrefixes = [
    "/login",
    "/espace-technicien",
    "/techniciens",
    "/devenir-technicien",
    "/tarifs",
    "/blog",
    "/suivi-sanitaire",
    "/audit",
    "/rapports-publics",
  ];
  if (
    pathname === "/" ||
    publicPrefixes.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // ── 4. Routes protégées — vérification Supabase ─────────────────────────
  const isClientRoute     = pathname.startsWith("/dashboard");
  const isTechnicienRoute = pathname.startsWith("/technicien");

  if (!isClientRoute && !isTechnicienRoute) {
    return NextResponse.next();
  }

  // Supabase non configuré → laisser passer (dev sans .env)
  const supabaseAnonKey = getSupabaseAnonKey();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Construire la réponse avec rafraîchissement de session
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Utilisateur non connecté ────────────────────────────────────────────
  if (!user) {
    const loginPath = isTechnicienRoute ? "/espace-technicien" : "/login";
    const redirectResponse = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c));
    return redirectResponse;
  }

  // ── Vérification du rôle pour technicien uniquement ─────────────────────
  // Pour /dashboard : tout utilisateur authentifié est accepté
  // (le dashboard gère lui-même l'affichage selon le rôle)
  if (isTechnicienRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile?.role !== "technicien") {
      const redirectResponse = NextResponse.redirect(new URL("/espace-technicien", request.url));
      response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c));
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
