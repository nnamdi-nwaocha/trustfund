import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { LiveChat } from "@/components/live-chat"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
      <LiveChat />
    </>
  )
}
