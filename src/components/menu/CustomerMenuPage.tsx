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
import { CustomerProfile } from "./CustomerProfile"
import { FeedbackNotification } from "./FeedbackNotification"
import { BillingModal } from "./BillingModal"
import { ThemeToggle } from "../common"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"

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
  const [tableSession, setTableSession] = useState<{ id: string; customerName: string; customerEmail: string } | null>(null)
  const [showFeedbackNotification, setShowFeedbackNotification] = useState(false)
  const [previousOrderStatus, setPreviousOrderStatus] = useState<string | null>(null)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const currency = useCafeCurrency(cafe?.id)

  useEffect(() => {
    validateTableAndFetchData()
  }, [cafeName, tableId])

  useEffect(() => {
    if (cafe && table) {
      fetchMenuData()
      fetchCurrentOrder()
      fetchTableSession()
      const interval = setInterval(() => {
        fetchCurrentOrder()
        fetchTableSession()
      }, 3000)
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

  async function fetchTableSession() {
    if (!table) return
    try {
      const response = await fetch(`/api/table-sessions?tableId=${table.id}`)
      if (response.ok) {
        const session = await response.json()
        if (session && session.isActive) {
          setTableSession(session)
          // Always sync customer details from session to persist across reloads
          if (session.customerName && session.customerEmail) {
            setCustomerDetails({
              name: session.customerName,
              email: session.customerEmail,
            })
          }
        } else {
          setTableSession(null)
        }
      }
    } catch (error) {
      console.error("Error fetching table session:", error)
    }
  }

  async function fetchCurrentOrder() {
    if (!cafe || !table) return
    try {
      const response = await fetch(`/api/orders?cafeId=${cafe.id}&tableId=${table.id}&status=pending,preparing,ready,served`)
      if (response.ok) {
        const orders = await response.json()
        const activeOrder = orders.find((o: Order) => 
          o.status !== "completed" && o.status !== "cancelled"
        )
        
        // Check if order status changed to ready or served for feedback notification
        if (activeOrder) {
          // Show feedback when order becomes served
          if (activeOrder.status === "served" && 
              previousOrderStatus && 
              previousOrderStatus !== "served") {
            setShowFeedbackNotification(true)
          }
          setPreviousOrderStatus(activeOrder.status)
        }
        
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
        
        // Create or update table session
        if (customerDetails) {
          await fetch("/api/table-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cafeId: cafe.id,
              tableId: table.id,
              tableNumber: table.number,
              customerName: customerDetails.name,
              customerEmail: customerDetails.email,
            }),
          })
        }
        
        fetchCurrentOrder()
        fetchTableSession()
        
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
    if (!table || !tableSession) return
    
    try {
      // End table session
      const sessionRes = await fetch(`/api/table-sessions?tableId=${table.id}`, {
        method: "DELETE",
      })
      
      if (!sessionRes.ok) {
        throw new Error("Failed to end session")
      }
      
      // Mark table as cleaning
      const tableRes = await fetch(`/api/tables/${table.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cleaning" }),
      })
      
      if (!tableRes.ok) {
        throw new Error("Failed to update table status")
      }
      
      // Clear all local state
      setShowLeaveTable(false)
      setTableSession(null)
      setCustomerDetails(null)
      setCurrentOrder(null)
      
      // Refresh page to show clean state
      window.location.reload()
    } catch (error) {
      console.error("Error leaving table:", error)
      alert("Failed to leave table. Please try again.")
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
              Cart ({cart.length}) - {formatCurrency(total, currency)}
            </Button>
            <ThemeToggle/>
          </div>
        </div>
      </header>

      {(tableSession || customerDetails) && (
        <CustomerProfile
          customerName={customerDetails?.name || tableSession?.customerName || "Guest"}
          customerEmail={customerDetails?.email || tableSession?.customerEmail || ""}
          cafeId={cafe?.id || ""}
          tableId={table?.id || ""}
          onLeaveTable={() => setShowLeaveTable(true)}
        />
      )}

      {currentOrder && tableSession && (
        <OrderStatusBar order={currentOrder} />
      )}
      
      {/* Show billing modal button only for served orders */}
      {currentOrder && tableSession && currentOrder.status === "served" && (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
          <Button
            onClick={() => setShowBillingModal(true)}
            className="w-full"
            variant="outline"
          >
            💰 Select Payment Method
          </Button>
        </div>
      )}

      {showFeedbackNotification && currentOrder && currentOrder.status === "served" && (
        <FeedbackNotification
          order={currentOrder}
          onClose={() => setShowFeedbackNotification(false)}
          onSubmitReview={async (rating, comment) => {
            await submitReview(rating, comment)
            setShowFeedbackNotification(false)
          }}
        />
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
              currency={currency}
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
        currency={currency}
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
              {currentOrder && (currentOrder.status === "completed" || currentOrder.status === "served")
                ? "Would you like to leave a review before leaving?"
                : "Are you sure you want to leave the table?"}
            </p>
            <div className="flex gap-2">
              {currentOrder && (currentOrder.status === "completed" || currentOrder.status === "served") && (
                <Button
                  onClick={() => {
                    setShowReview(true)
                    setShowLeaveTable(false)
                  }}
                  className="flex-1"
                >
                  Yes, Leave Review
                </Button>
              )}
              <Button
                variant="outline"
                onClick={async () => {
                  await handleLeaveTable()
                  setShowLeaveTable(false)
                }}
                className="flex-1"
              >
                {currentOrder && (currentOrder.status === "completed" || currentOrder.status === "served")
                  ? "No, Just Leave"
                  : "Leave Table"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showBillingModal && currentOrder && (
        <BillingModal
          order={currentOrder}
          currency={currency}
          cafeName={cafe?.name || ""}
          onClose={() => setShowBillingModal(false)}
          onPaymentComplete={async () => {
            setShowBillingModal(false)
            await fetchCurrentOrder()
            await fetchTableSession()
            // Don't mark table as cleaning - that happens only on Leave Table
          }}
        />
      )}
    </div>
  )
}

