"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"

export default function SendMoneyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountNumber = searchParams.get("account") || ""

  const [recipientAccount, setRecipientAccount] = useState(accountNumber)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const supabase = getSupabase()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to send money")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Validate amount
      const amountNum = Number.parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid amount")
      }

      // Get sender profile
      const { data: senderProfile, error: senderError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (senderError || !senderProfile) {
        throw new Error("Could not retrieve your account information")
      }

      // Check if sender has enough balance
      if (senderProfile.balance < amountNum) {
        throw new Error("Insufficient balance")
      }

      // Get recipient profile
      const { data: recipientProfile, error: recipientError } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_number", recipientAccount)
        .single()

      if (recipientError || !recipientProfile) {
        throw new Error("Recipient account not found")
      }

      // Prevent sending to self
      if (recipientProfile.id === user.id) {
        throw new Error("You cannot send money to yourself")
      }

      // Start a transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          sender_id: user.id,
          recipient_id: recipientProfile.id,
          amount: amountNum,
          note: note || null,
        })
        .select()

      if (transactionError) {
        throw new Error("Failed to create transaction")
      }

      // Update sender balance
      const { error: updateSenderError } = await supabase
        .from("profiles")
        .update({ balance: senderProfile.balance - amountNum })
        .eq("id", user.id)

      if (updateSenderError) {
        throw new Error("Failed to update your balance")
      }

      // Update recipient balance
      const { error: updateRecipientError } = await supabase
        .from("profiles")
        .update({ balance: recipientProfile.balance + amountNum })
        .eq("id", recipientProfile.id)

      if (updateRecipientError) {
        throw new Error("Failed to update recipient balance")
      }

      // Add to beneficiaries if not already there
      const { data: existingBeneficiary } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("user_id", user.id)
        .eq("beneficiary_id", recipientProfile.id)
        .maybeSingle()

      if (!existingBeneficiary) {
        await supabase.from("beneficiaries").insert({
          user_id: user.id,
          beneficiary_id: recipientProfile.id,
        })
      }

      setSuccess(true)

      // Reset form
      setRecipientAccount("")
      setAmount("")
      setNote("")

      // Redirect after a delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      setError(error.message || "Failed to send money")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard" passHref>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Send Money</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
          <CardDescription>Send money to another account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Money sent successfully! Redirecting...</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Account Number</Label>
              <Input
                id="recipient"
                placeholder="10-digit account number"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit account number"
                disabled={isLoading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isLoading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="What's this payment for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isLoading || success}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} className="w-full" disabled={isLoading || success}>
            {isLoading ? "Processing..." : "Send Money"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
