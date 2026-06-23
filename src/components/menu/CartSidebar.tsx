"use client"

import { OrderItem, Currency } from "@/lib/types"
import { Button } from "@/components/ui"
import { formatCurrency } from "@/lib/utils/currency"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles, ChefHat } from "lucide-react"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
  cart: OrderItem[]
  total: number
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onSubmitOrder: () => void
  isSubmitting: boolean
  currency?: Currency
  notes?: string
  onNotesChange?: (notes: string) => void
  tableNumber?: number
}

function isVegItem(name: string): boolean {
  const nonVegKeywords = [
    "chicken", "egg", "meat", "mutton", "fish", "pork", "beef", "burger", 
    "prawn", "crab", "bacon", "sausage", "salami", "ham", "pepperoni", 
    "kabab", "kebab", "wings", "tikka"
  ]
  const lowerName = name.toLowerCase()
  return !nonVegKeywords.some(keyword => lowerName.includes(keyword))
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
  currency = "USD",
  notes = "",
  onNotesChange,
  tableNumber,
}: CartSidebarProps) {
  const gst = total * 0.18
  const grandTotal = total + gst

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="relative h-full w-full max-w-md bg-background shadow-2xl flex flex-col z-50 border-l border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      My Basket
                    </h2>
                    {tableNumber !== undefined && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                        <Sparkles className="w-3 h-3" /> Table {tableNumber}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-3xl">
                    🛒
                  </div>
                  <p className="text-muted-foreground font-medium">Your cart is empty</p>
                  <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground tracking-wide uppercase px-1">
                      Items in Cart
                    </h3>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                      {cart.map((item) => {
                        const veg = isVegItem(item.menuItemName)
                        return (
                          <div key={item.id} className="p-4 flex items-start gap-3 transition-colors hover:bg-muted/10">
                            {/* Veg / Non-Veg Tag */}
                            <div className={`mt-1 flex-shrink-0 w-4 h-4 border rounded flex items-center justify-center ${veg ? 'border-green-600' : 'border-red-600'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${veg ? 'bg-green-600' : 'bg-red-600'}`} />
                            </div>
                            
                            {/* Item details */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm leading-snug break-words">
                                {item.menuItemName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatCurrency(item.price, currency)} each
                              </p>
                              <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1">
                                {formatCurrency(item.price * item.quantity, currency)}
                              </p>
                            </div>

                            {/* Quantity Controls & Delete */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-xl overflow-hidden h-8 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  className="px-2.5 h-full hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors flex items-center justify-center"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-1 text-center font-bold text-sm min-w-[20px] select-none text-foreground">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="px-2.5 h-full hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors flex items-center justify-center"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Cooking Instructions (Zomato style) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground px-1">
                      <ChefHat className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold uppercase tracking-wide">Cooking Instructions</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => onNotesChange?.(e.target.value)}
                        placeholder="e.g. make it extra spicy, less ice, no onions..."
                        className="w-full text-sm bg-card border border-border rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-foreground"
                      />
                    </div>
                  </div>

                  {/* Bill Details Breakdown (Zomato style) */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-muted-foreground tracking-wide uppercase px-1">
                      Bill Details
                    </h3>
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-border rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Item Total</span>
                        <span>{formatCurrency(total, currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          GST (18%)
                        </span>
                        <span>{formatCurrency(gst, currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Restaurant Handling Fee</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold uppercase text-xs">FREE</span>
                      </div>
                      <div className="border-t border-border/85 pt-3 flex justify-between items-center">
                        <span className="font-bold text-foreground">Grand Total</span>
                        <span className="text-lg font-extrabold text-foreground">{formatCurrency(grandTotal, currency)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Place Order Button */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-border bg-card shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  onClick={onSubmitOrder}
                  className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-between px-5 relative overflow-hidden cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-full flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending to Chef...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-left">
                        <span className="block text-[10px] text-orange-100 uppercase tracking-wider font-semibold">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                        </span>
                        <span className="text-base font-extrabold">{formatCurrency(grandTotal, currency)}</span>
                      </div>
                      <div className="flex items-center gap-1 font-extrabold text-sm tracking-wide uppercase">
                        Place Order
                      </div>
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
