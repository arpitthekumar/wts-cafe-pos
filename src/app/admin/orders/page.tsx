"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Order, OrderStatus } from "@/lib/types"
import { Button } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

export default function OrdersPage() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId || "cafe-1"
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | "all">("all")
  const [dateFilter, setDateFilter] = useState<string>("today")

  useEffect(() => {
    fetchOrders()
  }, [cafeId, filter, dateFilter])

  async function fetchOrders() {
    try {
      const response = await fetch(`/api/orders?cafeId=${cafeId}`)
      if (response.ok) {
        const data = await response.json()
        let filtered = data

        if (filter !== "all") {
          filtered = filtered.filter((o: Order) => o.status === filter)
        }

        // Date filter
        const now = new Date()
        if (dateFilter === "today") {
          filtered = filtered.filter((o: Order) => {
            const orderDate = new Date(o.createdAt)
            return orderDate.toDateString() === now.toDateString()
          })
        } else if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter((o: Order) => new Date(o.createdAt) >= weekAgo)
        }

        setOrders(filtered)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0)
  const completedOrders = orders.filter((o) => o.status === "completed")

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ready: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Orders & Sales"
          subtitle="View orders history and sales reports"
          role="admin"
        />

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{completedOrders.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="all">All Time</option>
          </select>

          <div className="flex gap-2">
            {(["all", "pending", "preparing", "ready", "completed", "cancelled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              No orders found
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold">Table {order.tableNumber}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.menuItemName}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

