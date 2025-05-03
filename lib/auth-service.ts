import { sendVerificationEmail } from "./email-service";
import { getSupabase } from "./supabase";
import { createVerificationToken } from "./token-service";

// User type definition
export interface User {
  id: string;
  email: string;
  role?: string;
  email_verified?: boolean;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country?: string;
}

// Session management
export function setSession(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
    document.cookie = `user_id=${user.id}; path=/; max-age=2592000`; // 30 days
  }
}

export function getSession(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    console.log("Session data:", userStr);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Error parsing user session:", e);
        localStorage.removeItem("user");
        return null;
      }
    }
  }
  return null;
}

export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    document.cookie = "user=; path=/; max-age=0";
  }
}

// Simple password encoding (NOT secure, just for demo)
function encodePassword(password: string): string {
  return btoa(password); // Base64 encoding
}

// Authentication functions
export async function signUp(
  email: string,
  password: string,
  additionalData: {
    username: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    country: string;
  }
): Promise<User> {
  try {
    const supabase = getSupabase();
    const encodedPassword = encodePassword(password);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing user:", checkError);
      throw new Error("Error during signup process");
    }

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user with role USER and email_verified set to false
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        email,
        password: encodedPassword, // Ensure this is hashed
        username: additionalData.username,
        first_name: additionalData.first_name,
        last_name: additionalData.last_name,
        phone_number: additionalData.phone_number,
        country: additionalData.country,
        email_verified: false,
        role: "USER",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user:", insertError);
      throw new Error("Failed to create user account");
    }

    if (!newUser) {
      throw new Error("User creation failed");
    }

    console.log("User data on sign-up:", newUser);

    // Create profile for the user with 0 balance
    const accountNumber = Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();

    const { error: profileError } = await supabase.from("profiles").insert({
      id: newUser.id,
      account_number: accountNumber,
      balance: 0, // Starting balance is 0
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // If profile creation fails, delete the user
      await supabase.from("users").delete().eq("id", newUser.id);
      throw new Error("Failed to create user profile");
    }

    // Create verification token and send verification email
    try {
      const token = await createVerificationToken(newUser.id);
      await sendVerificationEmail(email, token);
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Continue with signup even if email fails
    }

    // Set session
    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      email_verified: newUser.email_verified,
      username: newUser.username,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
    };
    setSession(userData);

    return userData;
  } catch (error) {
    console.error("Signup error details:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const supabase = getSupabase();
    const encodedPassword = encodePassword(password);

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", encodedPassword)
      .single();

    if (error) {
      console.error("Sign in error:", error);
      throw new Error("Invalid email or password");
    }

    if (!user) {
      throw new Error("User not found");
    }

    console.log("User data on sign-in:", user);

    // Set session
    const userData: User = {
      id: user.id,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      country: user.country,
    };
    setSession(userData);

    return userData;
  } catch (error) {
    console.error("Sign in error details:", error);
    throw error;
  }
}

export async function signOut() {
  clearSession();
}

export async function getCurrentUser(): Promise<User | null> {
  return getSession();
}

export async function resendVerificationEmail(
  userId: string,
  email: string
): Promise<boolean> {
  try {
    const token = await createVerificationToken(userId);
    await sendVerificationEmail(email, token);
    return true;
  } catch (error) {
    console.error("Error resending verification email:", error);
    return false;
  }
}
