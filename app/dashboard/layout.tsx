"use client"

import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Send, Users, LogOut, Shield } from "lucide-react"
import { LiveChat } from "@/components/live-chat"

export default function DashboardLayout({ children }) {
  const { signOut } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-blue-600">Trustfund</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-5 w-5 mr-1" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>

      {/* LiveChat integration */}
      <LiveChat />

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 inset-x-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-around h-16">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center w-full text-xs font-medium ${
                pathname === "/dashboard" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Home className="h-6 w-6" />
              <span>Home</span>
            </Link>
            <Link
              href="/send-money"
              className={`flex flex-col items-center justify-center w-full text-xs font-medium ${
                pathname === "/send-money" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Send className="h-6 w-6" />
              <span>Send</span>
            </Link>
            <Link
              href="/beneficiaries"
              className={`flex flex-col items-center justify-center w-full text-xs font-medium ${
                pathname === "/beneficiaries" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="h-6 w-6" />
              <span>Beneficiaries</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
