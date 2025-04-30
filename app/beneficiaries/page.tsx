"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, User, Loader2 } from "lucide-react"
import { getSupabase } from "@/lib/supabase"

export default function BeneficiariesPage() {
  const { user } = useAuth()
  const [beneficiaries, setBeneficiaries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const supabase = getSupabase()

  useEffect(() => {
    async function loadBeneficiaries() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("beneficiaries")
          .select(`
            id,
            beneficiary_id,
            profiles!beneficiaries_beneficiary_id_fkey(account_number)
          `)
          .eq("user_id", user.id)

        if (error) throw error

        setBeneficiaries(data || [])
      } catch (err) {
        console.error("Error loading beneficiaries:", err)
        setError("Failed to load beneficiaries")
      } finally {
        setLoading(false)
      }
    }

    loadBeneficiaries()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard" passHref>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Past Beneficiaries</h1>
      </div>

      {beneficiaries.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-gray-500">
            No beneficiaries yet. Send money to add beneficiaries.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {beneficiaries.map((beneficiary) => (
            <Link key={beneficiary.id} href={`/send-money?account=${beneficiary.profiles.account_number}`} passHref>
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 mr-4 bg-blue-100">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Account: {beneficiary.profiles.account_number}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
