"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { verifyPasswordResetToken, resetPassword } from "@/lib/token-service"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(false)

  // Verify token on page load
  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setVerifying(false)
        setError("Invalid reset link. Please request a new password reset.")
        return
      }

      try {
        const userId = await verifyPasswordResetToken(token)

        if (userId) {
          setValidToken(true)
        } else {
          setError("Reset link is invalid or has expired. Please request a new password reset.")
        }
      } catch (err) {
        console.error("Error verifying token:", err)
        setError("An error occurred. Please try again later.")
      } finally {
        setVerifying(false)
      }
    }

    checkToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      if (!token) {
        throw new Error("Invalid reset token")
      }

      const result = await resetPassword(token, password)

      if (result) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError("Failed to reset password. Please try again.")
      }
    } catch (err) {
      console.error("Error resetting password:", err)
      setError("An error occurred. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">Create a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {verifying ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p>Verifying your reset link...</p>
            </div>
          ) : error && !validToken ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-600 font-medium text-center">{error}</p>
              <Link href="/forgot-password" passHref>
                <Button>Request New Reset Link</Button>
              </Link>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-green-600 font-medium">Your password has been successfully reset!</p>
              <p>You will be redirected to the login page in a few seconds.</p>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!verifying && validToken && !success && (
            <Link href="/login" passHref>
              <Button variant="link">Back to Login</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
