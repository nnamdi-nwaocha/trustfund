"use client"

import { useEffect, useState } from "react"
import { AlertCircle, WifiOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isSupabaseReachable } from "@/lib/supabase"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isDbConnected, setIsDbConnected] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Check database connection
  useEffect(() => {
    const checkConnection = async () => {
      if (!isOnline) return

      setIsChecking(true)
      try {
        const reachable = await isSupabaseReachable()
        setIsDbConnected(reachable)
      } catch (error) {
        console.error("Error checking database connection:", error)
        setIsDbConnected(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkConnection()

    // Recheck every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [isOnline])

  if (!isOnline) {
    return (
      <Alert variant="destructive" className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
        <WifiOff className="h-4 w-4 mr-2" />
        <AlertDescription>You are offline. Please check your internet connection.</AlertDescription>
      </Alert>
    )
  }

  if (!isDbConnected && !isChecking) {
    return (
      <Alert
        variant="warning"
        className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto bg-amber-50 border-amber-200 text-amber-800"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>Having trouble connecting to our servers. Some features may be unavailable.</AlertDescription>
      </Alert>
    )
  }

  return null
}
