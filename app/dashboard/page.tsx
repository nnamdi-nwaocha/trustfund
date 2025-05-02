"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Send, Users, Loader2, RefreshCw, Shield } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const supabase = getSupabase();

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      setProfile(profileData);

      // Get transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select(
          `
          *,
          sender:profiles!transactions_sender_id_fkey(account_number),
          recipient:profiles!transactions_recipient_id_fkey(account_number)
        `
        )
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (transactionError) {
        throw transactionError;
      }

      setTransactions(transactionData || []);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>{error}</p>
        <Button onClick={handleRefresh} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
        <p>Profile not found. Please try logging out and back in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Welcome to Trustfund</h1>
          <p className="text-gray-500">
            Built on trust. Designed for your future.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-80">
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(profile.balance)}
          </div>
          <div className="mt-1 text-sm opacity-80">
            Account: {profile.account_number}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href={user?.email_verified ? "/send-money" : "#"} passHref>
          <Button
            className="w-full h-20 flex flex-col"
            variant="outline"
            disabled={!user?.email_verified}
            title={
              !user?.email_verified ? "Verify your email to send money" : ""
            }
          >
            <Send className="h-6 w-6 mb-1" />
            <span>Send Money</span>
          </Button>
        </Link>
        <Link href={user?.email_verified ? "/beneficiaries" : "#"} passHref>
          <Button
            className="w-full h-20 flex flex-col"
            variant="outline"
            disabled={!user?.email_verified}
            title={
              !user?.email_verified
                ? "Verify your email to access beneficiaries"
                : ""
            }
          >
            <Users className="h-6 w-6 mb-1" />
            <span>Beneficiaries</span>
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-blue-200 mb-2" />
                <p>No transactions yet</p>
                <p className="text-xs mt-1">
                  Your secure financial journey starts here
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const isSender = transaction.sender_id === user.id;
              const isIncoming = !isSender;
              const accountNumber = isSender
                ? transaction.recipient?.account_number
                : transaction.sender?.account_number;

              return (
                <Card key={transaction.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <div
                        className={`rounded-full p-2 mr-4 ${isIncoming ? "bg-green-100" : "bg-red-100"}`}
                      >
                        {isIncoming ? (
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {isIncoming
                            ? `From: ${accountNumber || "Unknown"}`
                            : `To: ${accountNumber || "Unknown"}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {transaction.note || "No note"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-semibold ${isIncoming ? "text-green-600" : "text-red-600"}`}
                      >
                        {isIncoming ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
