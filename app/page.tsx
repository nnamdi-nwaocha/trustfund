"use client"

// import { useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/context/auth-context"
// import { Loader2 } from "lucide-react"

export default function HomePage() {
  // const router = useRouter()
  // const { user, loading } = useAuth()

  // useEffect(() => {
  //   if (!loading) {
  //     if (user) {
  //       router.push("/dashboard")
  //     } else {
  //       router.push("/login")
  //     }
  //   }
  // }, [user, loading, router])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Temporarily Unavailable
        </h1>
        <p className="text-gray-600 text-sm">
          Please check back soon.
        </p>
      </div>
    </div>
  )
}
