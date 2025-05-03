"use client"

import { ErrorDisplay } from "@/components/error-display"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorDisplay
      title="Error Loading Dashboard"
      message="We couldn't load your dashboard data. Please try again later."
    />
  )
}
