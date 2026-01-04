"use client"

import { OrderItem } from "@/lib/types"
import { Button } from "@/components/ui"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  cart: OrderItem[]
  total: number
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onSubmitOrder: () => void
  isSubmitting: boolean
}

export function CartSidebar({
  isOpen,
  onClose,
  cart,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  isSubmitting,
}: CartSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50  bg-black/50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Order</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded border p-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.menuItemName}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-2 text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t p-4">
              <div className="mb-4 flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={onSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



