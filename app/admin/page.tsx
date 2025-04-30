"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  LogOut,
  RefreshCw,
  Trash2,
  Plus,
  AlertCircle,
  Shield,
  Search,
  Users,
  ChevronRight,
} from "lucide-react"
import { getSupabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface User {
  id: string
  email: string
  role: string
  created_at: string
  profile?: {
    account_number: string
    balance: number
  }
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [amount, setAmount] = useState("")
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const supabase = getSupabase()

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      try {
        const adminUserStr = localStorage.getItem("adminUser")
        if (!adminUserStr) {
          router.push("/admin/login")
          return
        }

        const admin = JSON.parse(adminUserStr)
        if (admin.role !== "ADMIN") {
          router.push("/admin/login")
          return
        }

        setAdminUser(admin)
      } catch (error) {
        console.error("Error checking admin:", error)
        router.push("/admin/login")
      }
    }

    checkAdmin()
  }, [router])

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          profile:profiles(account_number, balance)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (err: any) {
      console.error("Error loading users:", err)
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (adminUser) {
      loadUsers()
    }
  }, [adminUser])

  // Filter users based on search and tab
  useEffect(() => {
    if (!users.length) return

    let filtered = [...users]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.profile?.account_number.includes(query) ||
          user.role.toLowerCase().includes(query),
      )
    }

    // Apply tab filter
    if (activeTab === "admin") {
      filtered = filtered.filter((user) => user.role === "ADMIN")
    } else if (activeTab === "user") {
      filtered = filtered.filter((user) => user.role === "USER")
    }

    setFilteredUsers(filtered)
  }, [searchQuery, activeTab, users])

  const handleRefresh = () => {
    setRefreshing(true)
    loadUsers()
  }

  const handleLogout = () => {
    localStorage.removeItem("adminUser")
    document.cookie = "adminUser=; path=/; max-age=0"
    router.push("/admin/login")
  }

  const handleAddFunds = async () => {
    if (!selectedUser || !amount) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      })
      return
    }

    try {
      const amountNum = Number.parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid amount")
      }

      // Get current balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", selectedUser.id)
        .single()

      if (profileError) throw profileError

      // Update balance
      const newBalance = profile.balance + amountNum
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", selectedUser.id)

      if (updateError) throw updateError

      // Create transaction record
      await supabase.from("transactions").insert({
        sender_id: adminUser.id,
        recipient_id: selectedUser.id,
        amount: amountNum,
        note: "Admin deposit",
      })

      // Refresh users
      loadUsers()
      setAmount("")
      setSelectedUser(null)
      toast({
        title: "Funds added",
        description: `Successfully added ${formatCurrency(amountNum)} to ${selectedUser.email}'s account.`,
      })
    } catch (err: any) {
      console.error("Error adding funds:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to add funds",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!user) return

    setIsDeleting(true)
    try {
      console.log("Deleting user:", user.id)

      // First, check and delete any beneficiary relationships
      const { error: beneficiaryError } = await supabase
        .from("beneficiaries")
        .delete()
        .or(`user_id.eq.${user.id},beneficiary_id.eq.${user.id}`)

      if (beneficiaryError) {
        console.error("Error deleting beneficiaries:", beneficiaryError)
      }

      // Then, check and delete any transactions
      const { error: transactionError } = await supabase
        .from("transactions")
        .delete()
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)

      if (transactionError) {
        console.error("Error deleting transactions:", transactionError)
      }

      // Delete profile
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id)

      if (profileError) {
        console.error("Error deleting profile:", profileError)
        throw profileError
      }

      // Finally, delete user
      const { error: userError } = await supabase.from("users").delete().eq("id", user.id)

      if (userError) {
        console.error("Error deleting user:", userError)
        throw userError
      }

      // Update users list by filtering out the deleted user
      setUsers(users.filter((u) => u.id !== user.id))
      setFilteredUsers(filteredUsers.filter((u) => u.id !== user.id))

      toast({
        title: "User deleted",
        description: `Successfully deleted user ${user.email}.`,
      })
    } catch (err: any) {
      console.error("Error in delete process:", err)
      toast({
        title: "Error deleting user",
        description: err.message || "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!adminUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-blue-600">Trustfund Admin</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 pb-20">
        {/* Search and Filter */}
        <div className="mb-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="user">Users</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* User List */}
        {loading && !refreshing ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No users found</p>
            {searchQuery && <p className="text-sm">Try a different search term</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                            user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {user.profile ? formatCurrency(user.profile.balance) : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* User Actions */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
                        <SheetHeader className="text-left mb-6">
                          <SheetTitle>User Details</SheetTitle>
                          <SheetDescription>{user.email}</SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6">
                          {/* User Info */}
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-500">Account Information</h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                              <div>
                                <p className="text-xs text-gray-500">Account Number</p>
                                <p className="font-medium">{user.profile?.account_number || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Balance</p>
                                <p className="font-medium">
                                  {user.profile ? formatCurrency(user.profile.balance) : "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Role</p>
                                <p className="font-medium">{user.role}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Created</p>
                                <p className="font-medium text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>

                          {/* Add Funds */}
                          <div className="space-y-3">
                            <h3 className="text-sm font-medium text-gray-500">Add Funds</h3>
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  min="0.01"
                                  step="0.01"
                                  value={amount}
                                  onChange={(e) => {
                                    setAmount(e.target.value)
                                    setSelectedUser(user)
                                  }}
                                />
                              </div>
                              <Button onClick={handleAddFunds} disabled={!amount}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Funds
                              </Button>
                            </div>
                          </div>

                          {/* Delete User */}
                          {user.role !== "ADMIN" && (
                            <div className="pt-4">
                              <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => handleDeleteUser(user)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-2" />
                                )}
                                {isDeleting ? "Deleting..." : "Delete User"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Stats Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-2 px-4">
        <div className="flex justify-around">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="font-semibold">{users.filter((u) => u.role === "USER").length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Admins</p>
            <p className="font-semibold">{users.filter((u) => u.role === "ADMIN").length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Balance</p>
            <p className="font-semibold">
              {formatCurrency(users.reduce((sum, user) => sum + (user.profile?.balance || 0), 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
