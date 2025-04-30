import { createClient } from "@supabase/supabase-js"

// Create a single instance for client-side
let clientInstance = null

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseKey)
  }

  return clientInstance
}

// Check if the database is reachable
export async function isSupabaseReachable(): Promise<boolean> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.from("users").select("id").limit(1)
    return error === null
  } catch (error) {
    console.error("Error checking Supabase connection:", error)
    return false
  }
}
