"use client"

import { Order } from "@/lib/types"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"
import { Check, Loader2, ChefHat, CheckCircle2, ShieldAlert } from "lucide-react"

interface OrderStatusBarProps {
  order: Order
}

const steps = [
  { key: "pending", label: "Received", desc: "Sent to kitchen" },
  { key: "preparing", label: "Preparing", desc: "Chef is cooking" },
  { key: "ready", label: "Ready", desc: "Ready to serve" },
  { key: "served", label: "Served", desc: "Delivered to table" }
]

export function OrderStatusBar({ order }: OrderStatusBarProps) {
  const currency = useCafeCurrency(order.cafeId)

  const getStepIndex = (status: Order["status"]): number => {
    if (status === "completed" || status === "served") return 3
    if (status === "ready") return 2
    if (status === "preparing") return 1
    return 0 // pending or others
  }

  const activeIndex = getStepIndex(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
      <div className="bg-card border border-border/60 rounded-[20px] p-5 shadow-xs">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h3 className="font-headline text-sm font-extrabold text-foreground flex items-center gap-1.5">
              {isCancelled ? (
                <ShieldAlert className="w-4 h-4 text-red-500" />
              ) : activeIndex === 3 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <ChefHat className="w-4 h-4 text-orange-500 animate-pulse" />
              )}
              <span>
                {isCancelled 
                  ? "Order Cancelled" 
                  : activeIndex === 3 
                    ? "Order Delivered" 
                    : "Live Order Status"}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} • Total: {formatCurrency(order.total * 1.18, currency)} (incl. tax)
            </p>
          </div>
          <div className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-lg self-start sm:self-center">
            Order #{order.id.slice(-6).toUpperCase()}
          </div>
        </div>

        {isCancelled ? (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/15 border border-red-200/50 dark:border-red-900/30 rounded-xl text-center">
            <p className="text-xs font-bold text-red-600 dark:text-red-400">
              This order was cancelled. Please contact the café staff if you have questions.
            </p>
          </div>
        ) : (
          /* Visual Stepper Tracker */
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between relative px-2 max-w-md mx-auto">
              {/* Progress background line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />
              
              {/* Active progress line */}
              <div 
                className="absolute top-4 left-4 h-0.5 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${(activeIndex / 3) * 100}%` }}
              />

              {steps.map((step, idx) => {
                const isCompleted = idx < activeIndex
                const isActive = idx === activeIndex
                
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10 w-1/4">
                    {/* Circle Node */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                      isCompleted 
                        ? "bg-orange-500 border-orange-500 text-white" 
                        : isActive 
                          ? "bg-background border-orange-500 text-orange-500 shadow-md shadow-orange-500/25 scale-110" 
                          : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500"
                    }`}>
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : isActive && idx < 3 ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    
                    {/* Stage Label */}
                    <span className={`text-[10px] font-bold mt-2.5 tracking-wide transition-colors duration-300 text-center ${
                      isActive ? "text-orange-500 font-extrabold" : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[8px] text-muted-foreground/70 hidden sm:block text-center mt-0.5 leading-none">
                      {step.desc}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
