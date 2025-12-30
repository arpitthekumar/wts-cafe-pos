"use client"

import { useState } from "react"
import { Order, OrderStatus } from "@/lib/types"
import { Button } from "@/components/ui"

interface OrderCardProps {
  order: Order
  onStatusUpdate: (status: OrderStatus) => void
  nextStatus: OrderStatus
  nextStatusLabel: string
  onAccept?: () => void
  onAddItems?: (orderId: string) => void
  showAccept?: boolean
}

export function OrderCard({ 
  order, 
  onStatusUpdate, 
  nextStatus, 
  nextStatusLabel,
  onAccept,
  onAddItems,
  showAccept = false,
}: OrderCardProps) {
  const [accepted, setAccepted] = useState(false)

  function handleAccept() {
    setAccepted(true)
    if (onAccept) {
      onAccept()
    }
  }

  return (
    <div className={`rounded border bg-background p-3 ${!accepted && showAccept ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950" : ""}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold">Table {order.tableNumber}</span>
        <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
      </div>
      
      {order.notes && (
        <div className="mb-2 rounded bg-muted p-2 text-xs">
          <span className="font-medium">Notes: </span>
          {order.notes}
        </div>
      )}

      <div className="mb-2 space-y-1 text-xs text-muted-foreground">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.quantity}x {item.menuItemName}
              {item.notes && <span className="text-yellow-600"> • {item.notes}</span>}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <p className="mb-2 text-xs text-muted-foreground">
        {new Date(order.createdAt).toLocaleTimeString()}
      </p>

      <div className="space-y-2">
        {showAccept && !accepted && (
          <Button
            size="sm"
            variant="default"
            className="w-full"
            onClick={handleAccept}
          >
            ✓ Accept Order
          </Button>
        )}
        
        {accepted && (
          <p className="text-center text-xs text-green-600">✓ Accepted</p>
        )}

        {onAddItems && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => onAddItems(order.id)}
          >
            + Add Items
          </Button>
        )}

        <Button
          size="sm"
          className="w-full"
          onClick={() => onStatusUpdate(nextStatus)}
        >
          {nextStatusLabel}
        </Button>
      </div>
    </div>
  )
}
