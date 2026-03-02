import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const PUBLIC_PATHS = ["/", "/login", "/auth/callback"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { supabaseResponse, user } = await updateSession(request);

  // If already logged in and visiting /login, redirect to /dashboard
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect all routes that are not public
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith("/auth/")
  );

  if (!isPublic && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
