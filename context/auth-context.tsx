"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type User,
  getCurrentUser,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
} from "@/lib/auth-service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    additionalData: {
      username: string;
      first_name: string;
      last_name: string;
      phone_number: string;
      country: string;
    }
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Add setUser here
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for session on load
  useEffect(() => {
    async function loadSession() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading session:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    additionalData: {
      username: string;
      first_name: string;
      last_name: string;
      phone_number: string;
      country: string;
    }
  ) => {
    try {
      const newUser = await authSignUp(email, password, additionalData);
      setUser(newUser);
    } catch (error) {
      console.error("Auth context signup error:", error);
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with:", email);
      const user = await authSignIn(email, password); // Fetch user data
      console.log("User fetched:", user);
      setUser(user); // Set user in context
      console.log("User set in context. Navigating to dashboard...");
      router.push("/dashboard"); // Navigate to the dashboard
      console.log("router.push executed");
    } catch (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await authSignOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Auth context signout error:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    setUser, // Include setUser in the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
