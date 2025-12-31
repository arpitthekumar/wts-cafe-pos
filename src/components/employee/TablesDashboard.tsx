"use client"

import { useState, useEffect } from "react"
import { Table, TableStatus, Order, TableSession } from "@/lib/types"
import { Button } from "@/components/ui"
import { TableBillingModal } from "./TableBillingModal"
import { cafes } from "@/lib/db/queries"

interface TablesDashboardProps {
  cafeId: string
}

export function TablesDashboard({ cafeId }: TablesDashboardProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [sessions, setSessions] = useState<TableSession[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [billingTable, setBillingTable] = useState<Table | null>(null)
  const [cafeName, setCafeName] = useState<string>("")

  useEffect(() => {
    if (!cafeId) {
      setLoading(false)
      return
    }
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [cafeId])

  async function fetchData() {
    if (!cafeId) return
    try {
      const [tablesRes, ordersRes, sessionsRes, cafeRes] = await Promise.all([
        fetch(`/api/tables?cafeId=${cafeId}`),
        fetch(`/api/orders?cafeId=${cafeId}&status=pending,preparing,ready,served`),
        fetch(`/api/table-sessions?cafeId=${cafeId}`),
        fetch(`/api/cafes/${cafeId}`),
      ])

      if (tablesRes.ok) {
        const tablesData = await tablesRes.json()
        setTables(tablesData.sort((a: Table, b: Table) => a.number - b.number))
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        setSessions(sessionsData)
      }

      if (cafeRes.ok) {
        const cafeData = await cafeRes.json()
        setCafeName(cafeData.name || "")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateTableStatus(tableId: string, status: TableStatus) {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // If changing to cleaning or empty, end the table session
        if (status === "cleaning" || status === "empty") {
          await fetch(`/api/table-sessions?tableId=${tableId}`, {
            method: "DELETE",
          })
        }
        fetchData()
        setSelectedTable(null)
      } else {
        const errorData = await response.json()
        console.error("Error updating table status:", errorData)
        alert(errorData.error || "Failed to update table status")
      }
    } catch (error) {
      console.error("Error updating table status:", error)
      alert("Failed to update table status. Please try again.")
    }
  }

  function getTableStatus(table: Table): TableStatus {
    // Check if there's an active session - table should show as "cleaning" if customer is present
    const hasActiveSession = sessions.some(s => s.tableId === table.id && s.isActive)
    
    // Check if table has served order
    const hasServedOrder = orders.some(
      (o) => o.tableId === table.id && o.status === "served"
    )
    if (hasServedOrder) return "served"
    
    // Check if table has active order
    const hasActiveOrder = orders.some(
      (o) => o.tableId === table.id && o.status !== "completed" && o.status !== "cancelled" && o.status !== "served"
    )
    
    if (hasActiveOrder) return "occupied"
    
    // If there's an active session but no orders, show as cleaning (customer is at table)
    if (hasActiveSession) return "cleaning"
    
    return table.status || "empty"
  }

  function getTableCustomer(table: Table): TableSession | undefined {
    return sessions.find(s => s.tableId === table.id && s.isActive)
  }

  function getStatusColor(status: TableStatus) {
    switch (status) {
      case "occupied":
        return "bg-orange-500"
      case "served":
        return "bg-purple-500"
      case "cleaning":
        return "bg-yellow-500"
      case "reserved":
        return "bg-blue-500"
      case "empty":
      default:
        return "bg-gray-300 dark:bg-gray-600"
    }
  }

  function getStatusLabel(status: TableStatus) {
    switch (status) {
      case "occupied":
        return "Occupied"
      case "served":
        return "Served"
      case "cleaning":
        return "Cleaning"
      case "reserved":
        return "Reserved"
      case "empty":
      default:
        return "Ready to Use"
    }
  }

  function getNextStatusOptions(currentStatus: TableStatus): TableStatus[] {
    switch (currentStatus) {
      case "occupied":
        return ["served", "cleaning", "empty"]
      case "served":
        return ["cleaning", "empty", "occupied"]
      case "cleaning":
        return ["empty", "occupied", "reserved"]
      case "reserved":
        return ["empty", "occupied"]
      case "empty":
      default:
        return ["occupied", "reserved", "cleaning"]
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading tables...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Live Table Status (Visual)</h2>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-gray-700 dark:text-gray-300">Ready to Use</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-orange-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-yellow-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Cleaning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded bg-purple-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Served</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tables.map((table) => {
          const status = getTableStatus(table)
          const tableOrder = orders.find(
            (o) => o.tableId === table.id && o.status !== "completed" && o.status !== "cancelled"
          )
          const tableCustomer = getTableCustomer(table)
          const isSelected = selectedTable === table.id
          const nextOptions = getNextStatusOptions(status)

          return (
            <div key={table.id} className="relative">
              <button
                onClick={() => setSelectedTable(isSelected ? null : table.id)}
                className={`w-full rounded-lg border-2 p-6 transition-all ${
                  getStatusColor(status)
                } ${
                  isSelected
                    ? "ring-4 ring-blue-400 ring-offset-2 dark:ring-offset-gray-900"
                    : "hover:opacity-90 hover:scale-105"
                } ${status === "occupied" ? "border-orange-600" : status === "served" ? "border-purple-600" : status === "cleaning" ? "border-yellow-600" : status === "reserved" ? "border-blue-600" : "border-gray-400 dark:border-gray-500"}`}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white drop-shadow-lg">
                    {table.number}
                  </div>
                  {tableCustomer && (
                    <div className="mt-1 text-xs font-semibold text-white/95">
                      {tableCustomer.customerName}
                    </div>
                  )}
                  {tableOrder && (
                    <div className="mt-1 text-xs font-semibold text-white/90">
                      Order {tableOrder.status}
                    </div>
                  )}
                </div>
              </button>

              {isSelected && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border bg-background p-3 shadow-lg">
                  <div className="mb-2 text-center">
                    <p className="text-sm font-semibold">Table {table.number}</p>
                    {tableCustomer && (
                      <p className="text-xs font-medium text-foreground">
                        Customer: {tableCustomer.customerName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Current: {getStatusLabel(status)}
                    </p>
                    {table.capacity && (
                      <p className="text-xs text-muted-foreground">
                        Capacity: {table.capacity}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Change Status:</p>
                    {nextOptions.map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateTableStatus(table.id, nextStatus)
                        }}
                      >
                        Mark as {getStatusLabel(nextStatus)}
                      </Button>
                    ))}
                    {tableCustomer && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full text-xs mt-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            setBillingTable(table)
                            setShowBillingModal(true)
                          }}
                        >
                          💰 Bill Table
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="w-full text-xs mt-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTableStatus(table.id, "cleaning")
                          }}
                        >
                          End Session & Mark Cleaning
                        </Button>
                      </>
                    )}
                    {!tableCustomer && (status === "served" || status === "occupied") && (
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full text-xs mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBillingTable(table)
                          setShowBillingModal(true)
                        }}
                      >
                        💰 Bill Table
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs mt-1"
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (confirm(`Reset Table ${table.number} to empty? This will clear all sessions.`)) {
                          try {
                            await fetch("/api/tables/reset", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ tableId: table.id }),
                            })
                            fetchData()
                            setSelectedTable(null)
                          } catch (error) {
                            console.error("Error resetting table:", error)
                            alert("Failed to reset table")
                          }
                        }
                      }}
                    >
                      🔄 Reset Table
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showBillingModal && billingTable && (
        <TableBillingModal
          table={billingTable}
          cafeId={cafeId}
          cafeName={cafeName}
          onClose={() => {
            setShowBillingModal(false)
            setBillingTable(null)
          }}
          onBillingComplete={() => {
            fetchData()
            setShowBillingModal(false)
            setBillingTable(null)
          }}
        />
      )}
    </div>
  )
}



