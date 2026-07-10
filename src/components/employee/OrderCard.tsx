"use client"

import { useState } from "react"
import { Order, OrderStatus } from "@/lib/types"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"
import { Clock, Check, Edit3, ClipboardList, CheckCircle2, ArrowRight } from "lucide-react"

interface OrderCardProps {
  order: Order
  onStatusUpdate: (status: OrderStatus) => void
  nextStatus: OrderStatus
  nextStatusLabel: string
  onAccept?: () => void
  onAddItems?: (orderId: string) => void
  showAccept?: boolean
  disabled?: boolean
}

export function OrderCard({ 
  order, 
  onStatusUpdate, 
  nextStatus, 
  nextStatusLabel,
  onAccept,
  onAddItems,
  showAccept = false,
  disabled = false,
}: OrderCardProps) {
  const [accepted, setAccepted] = useState(false)
  const currency = useCafeCurrency(order.cafeId)

  function handleAccept() {
    setAccepted(true)
    if (onAccept) {
      onAccept()
    }
  }

  const isNew = showAccept && !accepted
  const isReady = order.status === "ready"

  return (
    <div className={`relative border rounded-[20px] bg-card p-4 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3 ${
      isNew 
        ? "border-amber-400 bg-amber-50/15 dark:bg-amber-950/10" 
        : isReady 
          ? "border-green-400 bg-green-50/10 dark:bg-green-950/5 animate-pulse-slow" 
          : "border-border/60"
    }`}>
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <span className="font-headline font-extrabold text-foreground text-sm">Table {order.tableNumber}</span>
            {isNew && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            )}
            {isReady && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            )}
          </div>
          <span className="text-orange-500 dark:text-orange-400 font-headline font-extrabold text-sm">{formatCurrency(order.total * 1.18, currency)}</span>
        </div>
        
        {/* Order level Chef Notes */}
        {order.notes && (
          <div className="mb-3.5 rounded-xl border border-orange-200/50 dark:border-orange-950/40 bg-orange-50/30 dark:bg-orange-950/10 p-2.5 text-[11px] leading-relaxed text-orange-800 dark:text-orange-300 flex items-start gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p><span className="font-bold">Chef Note:</span> {order.notes}</p>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-3.5 space-y-1.5 text-xs text-foreground/90 font-medium">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start gap-2">
              <div className="flex-1 leading-snug">
                <span className="font-bold text-orange-600 dark:text-orange-400 mr-1.5">{item.quantity}x</span>
                <span>{item.menuItemName}</span>
                {item.notes && (
                  <span className="block text-[10px] text-red-500 font-semibold italic mt-0.5">• Note: {item.notes}</span>
                )}
              </div>
              <span className="text-muted-foreground text-[10px] mt-0.5 shrink-0">{formatCurrency(item.price * item.quantity, currency)}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Time & Action Buttons */}
      <div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3 font-semibold">
          <Clock className="w-3 h-3" />
          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="space-y-2">
          {showAccept && !accepted && (
            <button
              onClick={handleAccept}
              className="w-full h-9 rounded-chip bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Order</span>
            </button>
          )}
          
          {accepted && (
            <div className="flex items-center justify-center gap-1 py-1 text-xs font-bold text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Accepted</span>
            </div>
          )}

          <div className="flex gap-2">
            {onAddItems && (
              <button
                onClick={() => onAddItems(order.id)}
                className="flex-1 h-9 rounded-chip border border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-foreground text-muted-foreground font-bold text-xs transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            <button
              onClick={() => onStatusUpdate(nextStatus)}
              disabled={disabled && !accepted}
              className="flex-[2] h-9 rounded-chip bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-white font-bold text-xs transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1"
            >
              <span>{nextStatusLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
