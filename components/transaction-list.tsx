import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowDownLeft, ArrowUpRight, AlertCircle } from "lucide-react"
import type { Transaction } from "@/types/database"

interface TransactionListProps {
  transactions: Transaction[]
  userId: string
}

export function TransactionList({ transactions, userId }: TransactionListProps) {
  // Handle case where transactions is undefined or null
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-gray-500">No transactions yet</CardContent>
      </Card>
    )
  }

  // Check if any transaction has missing data
  const hasInvalidData = transactions.some((transaction) => !transaction.sender || !transaction.recipient)

  if (hasInvalidData) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center text-amber-600 mb-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Some transaction data could not be loaded</span>
          </div>
          <p className="text-center text-gray-500 text-sm">Please refresh the page to try again</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const isSender = transaction.sender_id === userId
        const isIncoming = !isSender
        const accountNumber = isSender ? transaction.recipient?.account_number : transaction.sender?.account_number

        return (
          <Card key={transaction.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className={`rounded-full p-2 mr-4 ${isIncoming ? "bg-green-100" : "bg-red-100"}`}>
                  {isIncoming ? (
                    <ArrowDownLeft className={`h-5 w-5 text-green-600`} />
                  ) : (
                    <ArrowUpRight className={`h-5 w-5 text-red-600`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {isIncoming ? `From: ${accountNumber || "Unknown"}` : `To: ${accountNumber || "Unknown"}`}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{transaction.note || "No note"}</p>
                  <p className="text-xs text-gray-400">{formatDate(transaction.created_at)}</p>
                </div>
                <div className={`text-sm font-semibold ${isIncoming ? "text-green-600" : "text-red-600"}`}>
                  {isIncoming ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
