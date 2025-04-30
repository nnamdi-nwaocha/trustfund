"use client"

import { ErrorDisplay } from "@/components/error-display"

export default function BeneficiariesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Error Loading Beneficiaries"
      message="We couldn't load your beneficiaries data. Please try again later."
    />
  )
}
