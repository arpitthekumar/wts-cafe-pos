"use client"

import { useState, useEffect } from "react"
import { Order, TableSession } from "@/lib/types"
import { Button } from "@/components/ui"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"

interface CustomerProfileProps {
  customerName: string
  customerEmail: string
  cafeId: string
  tableId: string
  onLeaveTable: () => void
}

export function CustomerProfile({ customerName, customerEmail, cafeId, tableId, onLeaveTable }: CustomerProfileProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const currency = useCafeCurrency(cafeId)

  useEffect(() => {
    fetchOrders()
    // Poll for orders every 3 seconds
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [cafeId, customerEmail, tableId])

  async function fetchOrders() {
    try {
      // Fetch orders specifically for this table
      const response = await fetch(`/api/orders?cafeId=${cafeId}&tableId=${tableId}&status=pending,preparing,ready,served,completed`)
      if (response.ok) {
        const allOrders = await response.json()
        // Filter orders for this customer at this specific table
        // Match by email (case-insensitive) and exact tableId
        const customerOrders = allOrders.filter(
          (o: Order) => 
            o.customerEmail?.toLowerCase() === customerEmail.toLowerCase() && 
            o.tableId === tableId
        )
        setOrders(customerOrders.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ))
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<Order["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ready: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    served: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <div className="border-b bg-muted/30 px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Welcome, {customerName}!</p>
            <p className="text-xs text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""} • Table Session
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onLeaveTable}
            className="text-xs"
          >
            Leave Table
          </Button>
        </div>
        
        {orders.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Your Orders:</p>
            <div className="flex flex-wrap gap-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-md border bg-background px-2 py-1 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(order.total, currency)} • {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

