import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const WIP_ROUTE_PREFIXES = [
  "/admin/committees",
  "/admin/inbox",
  "/admin/action-items",
];

// Per-browser opt-in, toggled from Settings — see WipFeaturesContext.tsx.
const WIP_FEATURES_COOKIE = "admin-migrate-wip-features";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isWipRoute = WIP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isWipRoute && request.cookies.get(WIP_FEATURES_COOKIE)?.value !== "true") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}

// Only auth-gated surfaces. A catch-all matcher makes every public page
// (especially `/`) invoke a Fluid function + Supabase getUser() — that was
// almost all of the project's CPU time. Marketing routes stay off this list
// so Vercel can serve them from the CDN.
export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/admin-retire",
    "/admin-retire/:path*",
    "/old-admin",
    "/old-admin/:path*",
    "/login",
    "/signup",
  ],
};
