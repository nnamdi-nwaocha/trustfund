import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Check if user is logged in by looking for the user cookie
  const userCookie = req.cookies.get("user")?.value;
  const isLoggedIn = !!userCookie;

  console.log("All cookies:", req.cookies);
  console.log("User cookie:", userCookie);
  console.log("Is logged in:", isLoggedIn);

  // Protected routes
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/send-money") ||
    req.nextUrl.pathname.startsWith("/beneficiaries") ||
    req.nextUrl.pathname.startsWith("/settings"); // Add /settings here

  // Auth routes
  const isAuthRoute =
    req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/";

  // Redirect if user is not logged in and tries to access a protected route
  if (!isLoggedIn && isProtectedRoute) {
    console.log("Redirecting to /login...");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect if user is logged in and tries to access an auth route
  if (isLoggedIn && isAuthRoute) {
    console.log("Redirecting to /dashboard...");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/send-money/:path*",
    "/beneficiaries/:path*",
    "/settings/:path*", // Add /settings here
    "/login",
  ],
};
