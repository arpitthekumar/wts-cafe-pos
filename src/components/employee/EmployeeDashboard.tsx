"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Order, HelpRequest, OrderStatus } from "@/lib/types"
import { Button } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { OrderCard } from "./OrderCard"
import { HelpRequestsPanel } from "./HelpRequestsPanel"
import { AddItemsModal } from "./AddItemsModal"
import { TablesDashboard } from "./TablesDashboard"
import { CreateOrderModal } from "./CreateOrderModal"
import { OrderItem } from "@/lib/types"
import { sounds } from "@/lib/utils/sound"

export function EmployeeDashboard() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [showAddItemsModal, setShowAddItemsModal] = useState(false)
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  const previousReadyOrders = useRef<Set<string>>(new Set())
  const cafeId = (session?.user as any)?.cafeId
  
  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }

    // Use cafeId from session or default to cafe-1 for employees
    const effectiveCafeId = cafeId || "cafe-1"
    
    fetchData(effectiveCafeId)
    const interval = setInterval(() => fetchData(effectiveCafeId), 3000)
    return () => clearInterval(interval)
  }, [session, cafeId])

  async function fetchData(cafeIdToUse?: string) {
    const effectiveCafeId = cafeIdToUse || cafeId || "cafe-1"
    
    try {
      const [ordersRes, helpRes] = await Promise.all([
        fetch(`/api/orders?cafeId=${effectiveCafeId}`),
        fetch(`/api/help-requests?cafeId=${effectiveCafeId}&status=pending`),
      ])

      if (ordersRes.ok) {
        const data = await ordersRes.json()
        const activeOrders = data.filter(
          (o: Order) => o.status !== "completed" && o.status !== "cancelled"
        )
        setOrders(activeOrders)

        // Check for new ready orders and play sound
        const readyOrders = activeOrders.filter((o: Order) => o.status === "ready")
        const currentReadyIds = new Set<string>(readyOrders.map((o: Order) => o.id))
        const newReadyOrders = readyOrders.filter(
          (o: Order) => !previousReadyOrders.current.has(o.id)
        )
        
        if (newReadyOrders.length > 0) {
          sounds.orderReady()
        }
        previousReadyOrders.current = currentReadyIds
      }

      if (helpRes.ok) {
        const data = await helpRes.json()
        setHelpRequests(data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // If marking as served, update table status to served
        if (newStatus === "served") {
          const order = orders.find(o => o.id === orderId)
          if (order) {
            await fetch(`/api/tables/${order.tableId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "served" }),
            })
          }
        }
        
        fetchData(cafeId || "cafe-1")
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  async function respondToHelpRequest(requestId: string) {
    try {
      const response = await fetch(`/api/help-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "responded",
          respondedBy: (session?.user as any)?.name || "Employee"
        }),
      })

      if (response.ok) {
        fetchData(cafeId || "cafe-1")
      }
    } catch (error) {
      console.error("Error responding to help request:", error)
    }
  }

  function handleAcceptOrder() {
    // Order accepted - could update status or just acknowledge
    // For now, we'll just refresh to show it's been seen
    fetchData(cafeId || "cafe-1")
  }

  function handleAddItems(orderId: string) {
    setSelectedOrderId(orderId)
    setShowAddItemsModal(true)
  }

  async function handleAddItemsToOrder(items: OrderItem[]) {
    if (!selectedOrderId) return

    try {
      const response = await fetch(`/api/orders/${selectedOrderId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })

      if (response.ok) {
        fetchData(cafeId || "cafe-1")
        setShowAddItemsModal(false)
        setSelectedOrderId(null)
      } else {
        alert("Failed to add items to order")
      }
    } catch (error) {
      console.error("Error adding items:", error)
      alert("Failed to add items to order")
    }
  }

  const ordersByStatus = {
    pending: orders.filter((o) => o.status === "pending"),
    preparing: orders.filter((o) => o.status === "preparing"),
    ready: orders.filter((o) => o.status === "ready"),
    served: orders.filter((o) => o.status === "served"),
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Employee Dashboard"
          subtitle="Manage orders and customer requests"
          role="employee"
        />

        {helpRequests.length > 0 && (
          <HelpRequestsPanel
            requests={helpRequests}
            onRespond={respondToHelpRequest}
          />
        )}

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="font-headline text-lg font-extrabold text-foreground">Tables & Placement Status</h2>
          <div className="flex gap-2.5">
            <button 
              onClick={async () => {
                if (confirm("Reset all tables to 'Ready to Use'? This will clear all sessions.")) {
                  try {
                    await fetch("/api/tables/reset-all", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ cafeId: cafeId || "cafe-1" }),
                    })
                    alert("All tables have been reset to 'Ready to Use'")
                  } catch (error) {
                    console.error("Error resetting tables:", error)
                    alert("Failed to reset tables")
                  }
                }
              }}
              className="flex items-center gap-1.5 h-10 px-4 rounded-chip border border-zinc-200 hover:border-orange-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-orange-50/20 text-zinc-600 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 font-bold text-sm transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
            >
              🔄 Reset All Tables
            </button>
            <button 
              onClick={() => setShowCreateOrderModal(true)}
              className="flex items-center gap-1.5 h-10 px-4 rounded-chip bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/10 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              + Create Order
            </button>
          </div>
        </div>

        <div className="mb-6">
          <TablesDashboard cafeId={cafeId || "cafe-1"} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <OrderColumn
            title="New Orders"
            orders={ordersByStatus.pending}
            onStatusUpdate={updateOrderStatus}
            nextStatus="preparing"
            nextStatusLabel="Start Preparing"
            onAccept={handleAcceptOrder}
            onAddItems={handleAddItems}
            showAccept={true}
          />
          <OrderColumn
            title="Preparing"
            orders={ordersByStatus.preparing}
            onStatusUpdate={updateOrderStatus}
            nextStatus="ready"
            nextStatusLabel="Mark Ready"
            onAddItems={handleAddItems}
          />
          <OrderColumn
            title="Ready"
            orders={ordersByStatus.ready}
            onStatusUpdate={updateOrderStatus}
            nextStatus="served"
            nextStatusLabel="Mark as Served"
            onAddItems={handleAddItems}
          />
          <OrderColumn
            title="Served"
            orders={ordersByStatus.served || []}
            onStatusUpdate={updateOrderStatus}
            nextStatus="completed"
            nextStatusLabel="Complete Order"
            onAddItems={handleAddItems}
          />
        </div>

        {showAddItemsModal && selectedOrderId && (
          <AddItemsModal
            orderId={selectedOrderId}
            cafeId={cafeId}
            onClose={() => {
              setShowAddItemsModal(false)
              setSelectedOrderId(null)
            }}
            onAddItems={handleAddItemsToOrder}
          />
        )}

        {showCreateOrderModal && (
          <CreateOrderModal
            cafeId={cafeId || "cafe-1"}
            onClose={() => setShowCreateOrderModal(false)}
            onOrderCreated={() => {
              setShowCreateOrderModal(false)
              fetchData(cafeId || "cafe-1")
            }}
          />
        )}
      </div>
    </div>
  )
}

interface OrderColumnProps {
  title: string
  orders: Order[]
  onStatusUpdate: (orderId: string, status: OrderStatus) => void
  nextStatus: OrderStatus
  nextStatusLabel: string
  onAccept?: () => void
  onAddItems?: (orderId: string) => void
  showAccept?: boolean
  disabled?: boolean
}

function OrderColumn({ 
  title, 
  orders, 
  onStatusUpdate, 
  nextStatus, 
  nextStatusLabel,
  onAccept,
  onAddItems,
  showAccept,
  disabled,
}: OrderColumnProps) {
  return (
    <div className="rounded-[20px] border border-border/60 bg-zinc-50/30 dark:bg-zinc-900/10 p-4 min-h-[300px]">
      <h2 className="mb-4 font-headline text-sm font-extrabold text-foreground flex items-center justify-between">
        <span>{title}</span>
        <span className="bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-bold">{orders.length}</span>
      </h2>
      <div className="space-y-3.5">
        {orders.length === 0 ? (
          <p className="text-xs text-muted-foreground font-semibold text-center py-6">No orders</p>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={(status) => onStatusUpdate(order.id, status)}
              nextStatus={nextStatus}
              nextStatusLabel={nextStatusLabel}
              onAccept={onAccept}
              onAddItems={onAddItems}
              showAccept={showAccept}
              disabled={disabled}
            />
          ))
        )}
      </div>
    </div>
  )
}

