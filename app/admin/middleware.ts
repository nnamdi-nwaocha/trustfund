import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Skip the login page from auth check
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next()
  }

  // Check if user is logged in as admin
  const adminCookie = req.cookies.get("adminUser")?.value

  if (!adminCookie) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  try {
    const adminUser = JSON.parse(adminCookie)
    if (adminUser.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/access-denied", req.url))
    }
  } catch (error) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
