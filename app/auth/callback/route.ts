import { NextResponse } from "next/server"

export async function GET(request) {
  // Since we're not using Supabase Auth, we can just redirect to the dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
