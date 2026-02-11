import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js Middleware — Route protection and session management.
 *
 * Uses getToken() from next-auth/jwt (edge-compatible) instead of auth()
 * to avoid importing Prisma/crypto which aren't available in edge runtime.
 *
 * - Protects dashboard routes (redirects to /login if unauthenticated)
 * - Redirects authenticated users away from auth pages
 * - Detects expired sessions (single device enforcement) and redirects to login
 */
export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Get JWT token (edge-compatible, no Prisma needed)
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;

  // Define route categories
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/reset-password");

  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/templates") ||
    pathname.startsWith("/settings");

  // Check for expired session (single device enforcement)
  if (isLoggedIn && token.expired) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("error", "session-expired");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("authjs.session-token");
    response.cookies.delete("__Secure-authjs.session-token");
    return response;
  }

  // Redirect logged-in users away from auth pages to dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard routes — redirect to login if not authenticated
  if (!isLoggedIn && isProtectedPage) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Middleware matcher — runs on all routes except:
 * - Static files (_next/static, _next/image)
 * - Favicon
 * - Public uploads
 * - API routes (handled by their own auth)
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|images|fonts|api).*)",
  ],
};
