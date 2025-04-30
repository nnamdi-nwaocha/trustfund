import { getSupabase } from "./supabase"

// User type definition
export interface User {
  id: string
  email: string
  role?: string
}

// Session management
export function setSession(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
    // Also set a cookie for middleware
    document.cookie = `user=${JSON.stringify(user)}; path=/; max-age=2592000` // 30 days
  }
}

export function getSession(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (e) {
        console.error("Error parsing user session:", e)
        return null
      }
    }
  }
  return null
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
    document.cookie = "user=; path=/; max-age=0"
  }
}

// Simple password encoding (NOT secure, just for demo)
function encodePassword(password: string): string {
  return btoa(password) // Base64 encoding
}

// Authentication functions
export async function signUp(email: string, password: string): Promise<User> {
  try {
    const supabase = getSupabase()
    const encodedPassword = encodePassword(password)

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing user:", checkError)
      throw new Error("Error during signup process")
    }

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Create new user with role USER
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ email, password: encodedPassword, role: "USER" })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating user:", insertError)
      throw new Error("Failed to create user account")
    }

    if (!newUser) {
      throw new Error("User creation failed")
    }

    // Create profile for the user with 0 balance
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString()

    const { error: profileError } = await supabase.from("profiles").insert({
      id: newUser.id,
      account_number: accountNumber,
      balance: 0, // Starting balance is now 0
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // If profile creation fails, delete the user
      await supabase.from("users").delete().eq("id", newUser.id)
      throw new Error("Failed to create user profile")
    }

    // Set session
    const userData: User = { id: newUser.id, email: newUser.email, role: newUser.role }
    setSession(userData)

    return userData
  } catch (error) {
    console.error("Signup error details:", error)
    throw error
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const supabase = getSupabase()
    const encodedPassword = encodePassword(password)

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", encodedPassword)
      .single()

    if (error) {
      console.error("Sign in error:", error)
      throw new Error("Invalid email or password")
    }

    if (!user) {
      throw new Error("User not found")
    }

    // Set session
    const userData: User = { id: user.id, email: user.email, role: user.role }
    setSession(userData)

    return userData
  } catch (error) {
    console.error("Sign in error details:", error)
    throw error
  }
}

export async function signOut() {
  clearSession()
}

export async function getCurrentUser(): Promise<User | null> {
  return getSession()
}
