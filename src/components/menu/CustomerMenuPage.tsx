"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MenuItem, OrderItem, Category, Order } from "@/lib/types"
import { Button } from "@/components/ui"
import { CartSidebar } from "./CartSidebar"
import { CategoryFilter } from "./CategoryFilter"
import { MenuItemCard } from "./MenuItemCard"
import { OrderStatusBar } from "./OrderStatusBar"
import { ReviewModal } from "./ReviewModal"
import { CallEmployeeButton } from "./CallEmployeeButton"
import { CustomerDetailsForm } from "./CustomerDetailsForm"

export function CustomerMenuPage() {
  const params = useParams()
  const cafeName = params.cafeName as string
  const tableId = params.tableId as string

  const [cafe, setCafe] = useState<{ id: string; name: string } | null>(null)
  const [table, setTable] = useState<{ id: string; number: number; capacity?: number; status?: string } | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [cart, setCart] = useState<OrderItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [showReview, setShowReview] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerDetails, setCustomerDetails] = useState<{ name: string; email: string } | null>(null)
  const [showLeaveTable, setShowLeaveTable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    validateTableAndFetchData()
  }, [cafeName, tableId])

  useEffect(() => {
    if (cafe && table) {
      fetchMenuData()
      fetchCurrentOrder()
      const interval = setInterval(fetchCurrentOrder, 3000)
      return () => clearInterval(interval)
    }
  }, [cafe, table])

  async function validateTableAndFetchData() {
    try {
      setLoading(true)
      setError(null)
      
      const decodedName = decodeURIComponent(cafeName)
      const response = await fetch(
        `/api/tables/validate?cafeName=${encodeURIComponent(decodedName)}&tableId=${encodeURIComponent(tableId)}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Invalid table or café")
        setLoading(false)
        return
      }
      
      const data = await response.json()
      if (data.valid) {
        setCafe(data.cafe)
        setTable(data.table)
      } else {
        setError("Table validation failed")
        setLoading(false)
      }
    } catch (error) {
      console.error("Error validating table:", error)
      setError("Failed to validate table. Please check the URL.")
      setLoading(false)
    }
  }

  async function fetchMenuData() {
    if (!cafe) return
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch(`/api/menu/${cafe.id}/items`),
        fetch(`/api/menu/${cafe.id}/categories`),
      ])
      if (itemsRes.ok) {
        const items = await itemsRes.json()
        setMenuItems(items)
      }
      if (catsRes.ok) {
        const cats = await catsRes.json()
        setCategories(cats)
      }
    } catch (error) {
      console.error("Error fetching menu:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCurrentOrder() {
    if (!cafe || !table) return
    try {
      const response = await fetch(`/api/orders?cafeId=${cafe.id}&tableId=${table.id}&status=pending,preparing,ready`)
      if (response.ok) {
        const orders = await response.json()
        const activeOrder = orders.find((o: Order) => 
          o.status !== "completed" && o.status !== "cancelled"
        )
        setCurrentOrder(activeOrder || null)
        
        const completedOrder = orders.find((o: Order) => o.status === "completed")
        if (completedOrder && !showReview) {
          const reviewRes = await fetch(`/api/reviews?orderId=${completedOrder.id}`)
          if (reviewRes.ok) {
            const review = await reviewRes.json()
            if (!review) {
              setShowReview(true)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error)
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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function handlePlaceOrder() {
    if (cart.length === 0) return
    if (!customerDetails) {
      setShowCustomerForm(true)
      return
    }
    submitOrder()
  }

  function handleCustomerDetailsSubmit(name: string, email: string) {
    setCustomerDetails({ name, email })
    setShowCustomerForm(false)
    submitOrder()
  }

  async function submitOrder() {
    if (cart.length === 0 || !customerDetails || !cafe || !table) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeId: cafe.id,
          tableId: table.id,
          items: cart,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
        }),
      })

      if (response.ok) {
        setCart([])
        setShowCart(false)
        fetchCurrentOrder()
        // Update table status to occupied
        await fetch(`/api/tables/${tableId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "occupied" }),
        })
      } else {
        alert("Failed to place order. Please try again.")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLeaveTable() {
    // Mark table as cleaning
    if (!table) return
    await fetch(`/api/tables/${table.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cleaning" }),
    })
    setShowLeaveTable(false)
    // Show review if order was completed
    if (currentOrder?.status === "completed") {
      setShowReview(true)
    }
  }

  async function submitReview(rating: number, comment?: string) {
    if (!currentOrder || !cafe || !table) return

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeId: cafe.id,
          tableId: table.id,
          orderId: currentOrder.id,
          rating,
          comment,
        }),
      })

      if (response.ok) {
        setShowReview(false)
        alert("Thank you for your review!")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const filteredItems = selectedCategory === "all"
    ? menuItems.filter((item) => item.available)
    : menuItems.filter((item) => item.category === selectedCategory && item.available)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading menu...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-bold sm:text-2xl">
            {cafe ? `${cafe.name} Menu` : "Loading..."}
          </h1>
          <div className="flex items-center gap-2">
            <CallEmployeeButton cafeId={cafe?.id || ""} tableId={table?.id || ""} />
            <Button onClick={() => setShowCart(!showCart)} variant="outline" size="sm">
              Cart ({cart.length}) - ${total.toFixed(2)}
            </Button>
          </div>
        </div>
      </header>

      {currentOrder && (
        <>
          <OrderStatusBar order={currentOrder} />
          {currentOrder.status === "completed" && (
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <Button
                onClick={() => setShowLeaveTable(true)}
                className="w-full"
                variant="outline"
              >
                Leave Table & Leave Review
              </Button>
            </div>
          )}
        </>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={() => addToCart(item)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No items available in this category
          </div>
        )}
      </div>

      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        total={total}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onSubmitOrder={handlePlaceOrder}
        isSubmitting={isSubmitting}
      />

      {showCustomerForm && (
        <CustomerDetailsForm
          onSubmit={handleCustomerDetailsSubmit}
          onCancel={() => setShowCustomerForm(false)}
        />
      )}

      {showReview && currentOrder && (
        <ReviewModal
          order={currentOrder}
          onClose={() => {
            setShowReview(false)
            setShowLeaveTable(false)
          }}
          onSubmit={async (rating, comment) => {
            await submitReview(rating, comment)
            await handleLeaveTable()
          }}
        />
      )}

      {showLeaveTable && !showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Leave Table</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Would you like to leave a review before leaving?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowReview(true)
                  setShowLeaveTable(false)
                }}
                className="flex-1"
              >
                Yes, Leave Review
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await handleLeaveTable()
                  setShowLeaveTable(false)
                }}
                className="flex-1"
              >
                No, Just Leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

