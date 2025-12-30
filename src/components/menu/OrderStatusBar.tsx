"use client"

import { Order } from "@/lib/types"

interface OrderStatusBarProps {
  order: Order
}

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  preparing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ready: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function OrderStatusBar({ order }: OrderStatusBarProps) {
  return (
    <div className="border-b bg-muted/50 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm font-medium">Current Order</p>
          <p className="text-xs text-muted-foreground">
            {order.items.length} item(s) • ${order.total.toFixed(2)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
    </div>
  )
}



