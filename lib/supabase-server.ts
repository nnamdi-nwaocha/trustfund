import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

// Server-side Supabase client (for server components and server actions)
export function createServerSupabase() {
  // This should only be called in server components or server actions
  if (typeof window !== "undefined") {
    throw new Error("createServerSupabase should only be called from server components or server actions")
  }

  try {
    return createServerComponentClient<Database>({ cookies })
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    throw error
  }
}
