"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center text-amber-500 mb-2">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Sorry, you don't have permission to access this page. This area is restricted to administrators only.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/dashboard" passHref>
            <Button>Return to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
