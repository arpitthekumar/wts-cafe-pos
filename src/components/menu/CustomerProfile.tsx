"use client"

import { useState, useEffect } from "react"
import { Order } from "@/lib/types"
import { Button } from "@/components/ui"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"
import { User, LogOut, Receipt, History, X } from "lucide-react"

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
  const [showHistory, setShowHistory] = useState(false)
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
          
          <div className="self-start sm:self-center flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {orders.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1.5 h-10 px-4 rounded-chip border border-orange-200 hover:border-orange-300 dark:border-orange-900/50 dark:hover:border-orange-850 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold text-sm transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
              >
                <History className="w-4 h-4" />
                <span>Order History ({orders.length})</span>
              </button>
            )}
            
            <button
              onClick={onLeaveTable}
              className="flex items-center gap-1.5 h-10 px-4 rounded-chip border border-zinc-200 hover:border-red-200 dark:border-zinc-800 dark:hover:border-red-950 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-red-50 dark:hover:bg-red-950/10 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 font-bold text-sm transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order History Modal */}
      {showHistory && orders.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          {/* Modal Backdrop Close trigger */}
          <div className="absolute inset-0" onClick={() => setShowHistory(false)} />
          
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl relative z-10 animate-in zoom-in-95 duration-250 flex flex-col max-h-[85vh]">
            {/* Modal Close Button */}
            <button 
              onClick={() => setShowHistory(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-extrabold text-foreground">Order History</h3>
                <p className="text-xs text-muted-foreground font-medium">Placed during this active session</p>
              </div>
            </div>

            {/* Orders List (scrollable container) */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="rounded-xl border border-border/60 bg-muted/20 dark:bg-zinc-900/10 p-4 transition-all hover:bg-muted/40"
                >
                  {/* Status & Time */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-muted-foreground text-xs font-semibold">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Items detail list */}
                  <div className="space-y-1.5 border-t border-border/40 pt-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-foreground/80">
                        <span className="font-medium">
                          {item.menuItemName} <span className="text-muted-foreground font-normal">x{item.quantity}</span>
                        </span>
                        <span className="font-semibold text-muted-foreground">
                          {formatCurrency(item.price * item.quantity, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total including GST */}
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-border/40">
                    <span className="text-xs font-bold text-muted-foreground">Total (incl. GST):</span>
                    <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
                      {formatCurrency(order.total * 1.18, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-border/60 flex justify-end">
              <button
                onClick={() => setShowHistory(false)}
                className="px-5 h-10 rounded-chip bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm transition-all duration-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
