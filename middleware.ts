import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Check if user is logged in by looking for the user cookie
  const userCookie = req.cookies.get("user")?.value
  const isLoggedIn = !!userCookie

  // Protected routes
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/send-money") ||
    req.nextUrl.pathname.startsWith("/beneficiaries")

  // Auth routes
  const isAuthRoute = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/"

  // Redirect if needed
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/send-money/:path*", "/beneficiaries/:path*", "/login"],
}
