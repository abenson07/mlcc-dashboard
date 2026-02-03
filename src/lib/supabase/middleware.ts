import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

const authRoutes = [
  "/dashboard/login",
  "/signup",
  "/reset-password",
  "/auth/callback",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Only redirect unauthenticated users to login. Do NOT redirect authenticated
    // users away from auth routes here — let the auth pages do that. This avoids
    // ERR_TOO_MANY_REDIRECTS when edge middleware and server/client disagree on session.
    if (!user && !authRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
  } catch {
    return response;
  }

  return response;
}
