"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ErrorDisplayProps {
  title?: string
  message?: string
  retryLink?: string
  showRefreshButton?: boolean
}

export function ErrorDisplay({
  title = "Error Loading Data",
  message = "We're experiencing some technical difficulties. Please try refreshing the page or come back later.",
  retryLink,
  showRefreshButton = true,
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRefresh = () => {
    setIsRetrying(true)
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center text-amber-600 mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <p className="text-gray-700 mb-4">{message}</p>
          <div className="flex flex-col space-y-2">
            {showRefreshButton && (
              <Button onClick={handleRefresh} disabled={isRetrying} className="w-full">
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  "Refresh Page"
                )}
              </Button>
            )}
            {retryLink && (
              <Link href={retryLink} passHref>
                <Button variant="outline" className="w-full">
                  Go Back
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
