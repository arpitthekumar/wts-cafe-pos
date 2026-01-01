"use client"

import { useState, useEffect } from "react"
import { MenuItem, Category, Table, OrderItem } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"

interface CreateOrderModalProps {
  cafeId: string
  onClose: () => void
  onOrderCreated: () => void
}

export function CreateOrderModal({ cafeId, onClose, onOrderCreated }: CreateOrderModalProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [cart, setCart] = useState<OrderItem[]>([])
  const [orderType, setOrderType] = useState<"table" | "pickup">("table")
  const [selectedTableId, setSelectedTableId] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currency = useCafeCurrency(cafeId)

  useEffect(() => {
    fetchData()
  }, [cafeId])

  async function fetchData() {
    try {
      const [itemsRes, catsRes, tablesRes] = await Promise.all([
        fetch(`/api/menu/${cafeId}/items`),
        fetch(`/api/menu/${cafeId}/categories`),
        fetch(`/api/tables?cafeId=${cafeId}`),
      ])

      if (itemsRes.ok) {
        const items = await itemsRes.json()
        setMenuItems(items)
      }
      if (catsRes.ok) {
        const cats = await catsRes.json()
        setCategories(cats)
      }
      if (tablesRes.ok) {
        const tablesData = await tablesRes.json()
        setTables(tablesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  function addToCart(item: MenuItem) {
    if (!item.available) return

    const existingItem = cart.find((cartItem) => cartItem.menuItemId === item.id)

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === existingItem.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      )
    } else {
      setCart([
        ...cart,
        {
          id: Date.now().toString(),
          menuItemId: item.id,
          menuItemName: item.name,
          quantity: 1,
          price: item.price,
        },
      ])
    }
  }

  function removeFromCart(itemId: string) {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(
      cart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  async function submitOrder() {
    if (cart.length === 0) {
      alert("Please add items to cart")
      return
    }

    if (!customerName || !customerEmail) {
      alert("Please enter customer name and email")
      return
    }

    if (orderType === "table" && !selectedTableId) {
      alert("Please select a table")
      return
    }

    setIsSubmitting(true)
    try {
      const tableId = orderType === "table" ? selectedTableId : "pickup"
      const selectedTable = tables.find(t => t.id === selectedTableId)
      const tableNumber = orderType === "table" && selectedTable ? selectedTable.number : 0

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeId,
          tableId,
          tableNumber,
          items: cart,
          customerName,
          customerEmail,
        }),
      })

      if (response.ok) {
        if (orderType === "table" && selectedTableId) {
          // Update table status to occupied
          await fetch(`/api/tables/${selectedTableId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "occupied" }),
          })

          // Create table session
          await fetch("/api/table-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cafeId,
              tableId: selectedTableId,
              tableNumber,
              customerName,
              customerEmail,
            }),
          })
        }

        onOrderCreated()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to create order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredItems = selectedCategory === "all"
    ? menuItems.filter((item) => item.available)
    : menuItems.filter((item) => item.category === selectedCategory && item.available)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Order</h2>
          <Button variant="outline" onClick={onClose}>✕</Button>
        </div>

        <div className="mb-4 space-y-4">
          <div>
            <Label>Order Type</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={orderType === "table" ? "default" : "outline"}
                onClick={() => setOrderType("table")}
              >
                Table Order
              </Button>
              <Button
                variant={orderType === "pickup" ? "default" : "outline"}
                onClick={() => setOrderType("pickup")}
              >
                Pickup Order
              </Button>
            </div>
          </div>

          {orderType === "table" && (
            <div>
              <Label htmlFor="table">Select Table *</Label>
              <select
                id="table"
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 mt-2"
              >
                <option value="">Select a table</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    Table {table.number} {table.capacity ? `(${table.capacity} seats)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="customerEmail">Customer Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="mb-4">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`rounded px-3 py-1 text-sm ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded px-3 py-1 text-sm ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded border p-2 cursor-pointer hover:bg-muted"
              onClick={() => addToCart(item)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.price, currency)}</p>
                </div>
                <Button size="sm" variant="outline">+</Button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="mb-4 rounded border p-4">
            <h3 className="font-semibold mb-2">Cart ({cart.length})</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-sm">
                    {item.quantity}x {item.menuItemName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{formatCurrency(item.price * item.quantity, currency)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submitOrder} disabled={isSubmitting || cart.length === 0}>
            {isSubmitting ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </div>
    </div>
  )
}

