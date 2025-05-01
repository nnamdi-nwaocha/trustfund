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
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  const signUp = async (email: string, password: string) => {
    try {
      const newUser = await authSignUp(email, password);
      setUser(newUser);
      // router.push("/dashboard")
    } catch (error) {
      console.error("Auth context signup error:", error);
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const user = await authSignIn(email, password);
      setUser(user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Auth context signin error:", error);
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
