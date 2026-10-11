import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "college-portal-super-secret-jwt-key-32-chars-minimum-token"
);
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "college_portal_session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, next internals, and public endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Public authentication routes
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let session: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, AUTH_SECRET);
      session = payload;
    } catch {
      // invalid or expired token
    }
  }

  // 1. If trying to access login while already authenticated, redirect to role dashboard
  if (isAuthRoute && session) {
    if (session.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  // 2. Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // 3. Protect Student routes
  if (pathname.startsWith("/student")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Backward compatibility export if Next.js checks either function name
export const middleware = proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
  ],
};
