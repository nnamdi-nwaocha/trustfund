"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { resendVerificationEmail } from "@/lib/auth-service"

export function EmailVerificationBanner() {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only show for logged in users who haven't verified their email
  if (!user || user.email_verified) {
    return null
  }

  const handleResend = async () => {
    setSending(true)
    setError(null)
    setSent(false)

    try {
      const success = await resendVerificationEmail(user.id, user.email)
      if (success) {
        setSent(true)
      } else {
        setError("Failed to send verification email. Please try again later.")
      }
    } catch (err) {
      console.error("Error resending verification email:", err)
      setError("An error occurred. Please try again later.")
    } finally {
      setSending(false)
    }
  }

  return (
    <Alert className="bg-amber-50 border-amber-200 mb-6">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-amber-800">Please verify your email address to access all features.</span>
        {sent ? (
          <span className="text-green-600 font-medium">Verification email sent!</span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100 w-fit"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
        )}
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </AlertDescription>
    </Alert>
  )
}
