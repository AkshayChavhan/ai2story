import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Next.js Middleware — Route protection and session management.
 *
 * - Protects dashboard routes (redirects to /login if unauthenticated)
 * - Redirects authenticated users away from auth pages
 * - Detects expired sessions (single device enforcement) and redirects to login
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const pathname = nextUrl.pathname;

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

  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/share/") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact");

  // Check for expired session (single device enforcement)
  if (isLoggedIn && session.expired) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("error", "session-expired");
    // Clear the session cookie by signing out
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
});

/**
 * Middleware matcher — runs on all routes except:
 * - Static files (_next/static, _next/image)
 * - Favicon
 * - Public uploads
 * - API routes (except /api/auth which NextAuth needs)
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|images|fonts).*)",
  ],
};
