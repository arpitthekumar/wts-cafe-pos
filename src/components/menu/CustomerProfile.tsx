"use client"

import { useState, useEffect } from "react"
import { Order } from "@/lib/types"
import { Button } from "@/components/ui"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"
import { User, LogOut, Receipt } from "lucide-react"

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
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [cafeId, customerEmail, tableId])

  async function fetchOrders() {
    try {
      const response = await fetch(`/api/orders?cafeId=${cafeId}&tableId=${tableId}&status=pending,preparing,ready,served,completed`)
      if (response.ok) {
        const allOrders = await response.json()
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
    pending: "bg-amber-50 text-amber-600 border-amber-200/40 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
    preparing: "bg-blue-50 text-blue-600 border-blue-200/40 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
    ready: "bg-green-50 text-green-600 border-green-200/40 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
    served: "bg-purple-50 text-purple-600 border-purple-200/40 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
    completed: "bg-zinc-100 text-zinc-600 border-zinc-200/40 dark:bg-zinc-900/40 dark:text-zinc-400 dark:border-zinc-800/40",
    cancelled: "bg-red-50 text-red-600 border-red-200/40 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="bg-card border border-border/60 rounded-[20px] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-headline text-lg font-extrabold text-foreground leading-snug">
                Welcome, {customerName}!
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>{orders.length} order{orders.length !== 1 ? "s" : ""} placed • Active Table Session</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={onLeaveTable}
            className="self-start sm:self-center flex items-center gap-1.5 h-10 px-4 rounded-chip border border-zinc-200 hover:border-red-200 dark:border-zinc-800 dark:hover:border-red-950 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-red-50 dark:hover:bg-red-950/10 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-sm transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Table</span>
          </button>
        </div>
        
        {orders.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border/80">
            <p className="text-xs font-bold text-muted-foreground tracking-wide uppercase mb-3">
              Your Placed Orders
            </p>
            <div className="flex flex-wrap gap-2.5">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-border/60 bg-muted/40 dark:bg-zinc-900/30 px-3.5 py-2 text-xs font-medium flex items-center gap-3 transition-colors hover:bg-muted/70"
                >
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="text-foreground/80 font-semibold">
                    {formatCurrency(order.total * 1.18, currency)}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
