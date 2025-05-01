import { getSupabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"
import { addHours } from "date-fns"

// Create a verification token
export async function createVerificationToken(userId: string): Promise<string> {
  const supabase = getSupabase()
  const token = uuidv4()
  const expiresAt = addHours(new Date(), 24) // Token expires in 24 hours

  try {
    // Delete any existing verification tokens for this user
    await supabase.from("email_verification_tokens").delete().eq("user_id", userId)

    // Create a new verification token
    const { error } = await supabase.from("email_verification_tokens").insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Error creating verification token:", error)
      throw new Error("Failed to create verification token")
    }

    return token
  } catch (error) {
    console.error("Error in createVerificationToken:", error)
    throw error
  }
}

// Verify a token
export async function verifyEmailToken(token: string): Promise<string | null> {
  const supabase = getSupabase()

  try {
    // Find the token
    const { data, error } = await supabase
      .from("email_verification_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .single()

    if (error || !data) {
      console.error("Error finding verification token:", error)
      return null
    }

    // Check if token is expired
    if (new Date(data.expires_at) < new Date()) {
      console.error("Token expired")
      return null
    }

    // Mark user as verified
    const { error: updateError } = await supabase.from("users").update({ email_verified: true }).eq("id", data.user_id)

    if (updateError) {
      console.error("Error updating user verification status:", updateError)
      return null
    }

    // Delete the used token
    await supabase.from("email_verification_tokens").delete().eq("token", token)

    return data.user_id
  } catch (error) {
    console.error("Error in verifyEmailToken:", error)
    return null
  }
}

// Create a password reset token
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const supabase = getSupabase()

  try {
    // Find user by email
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

    if (userError || !user) {
      console.error("User not found:", userError)
      return null
    }

    const token = uuidv4()
    const expiresAt = addHours(new Date(), 1) // Token expires in 1 hour

    // Delete any existing reset tokens for this user
    await supabase.from("password_reset_tokens").delete().eq("user_id", user.id)

    // Create a new reset token
    const { error } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Error creating password reset token:", error)
      return null
    }

    return token
  } catch (error) {
    console.error("Error in createPasswordResetToken:", error)
    return null
  }
}

// Verify a password reset token
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const supabase = getSupabase()

  try {
    // Find the token
    const { data, error } = await supabase
      .from("password_reset_tokens")
      .select("user_id, expires_at")
      .eq("token", token)
      .single()

    if (error || !data) {
      console.error("Error finding password reset token:", error)
      return null
    }

    // Check if token is expired
    if (new Date(data.expires_at) < new Date()) {
      console.error("Token expired")
      return null
    }

    return data.user_id
  } catch (error) {
    console.error("Error in verifyPasswordResetToken:", error)
    return null
  }
}

// Reset password using token
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const supabase = getSupabase()

  try {
    // Verify token and get user ID
    const userId = await verifyPasswordResetToken(token)

    if (!userId) {
      return false
    }

    // Encode the new password (using the same encoding as in auth-service.ts)
    const encodedPassword = btoa(newPassword)

    // Update user's password
    const { error } = await supabase.from("users").update({ password: encodedPassword }).eq("id", userId)

    if (error) {
      console.error("Error updating password:", error)
      return false
    }

    // Delete the used token
    await supabase.from("password_reset_tokens").delete().eq("token", token)

    return true
  } catch (error) {
    console.error("Error in resetPassword:", error)
    return false
  }
}
