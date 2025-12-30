"use client"

import { useState, useEffect } from "react"
import { Table, TableStatus, Order } from "@/lib/types"
import { Button } from "@/components/ui"

interface TablesDashboardProps {
  cafeId: string
}

export function TablesDashboard({ cafeId }: TablesDashboardProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

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
      const [tablesRes, ordersRes] = await Promise.all([
        fetch(`/api/tables?cafeId=${cafeId}`),
        fetch(`/api/orders?cafeId=${cafeId}&status=pending,preparing,ready`),
      ])

      if (tablesRes.ok) {
        const tablesData = await tablesRes.json()
        setTables(tablesData.sort((a: Table, b: Table) => a.number - b.number))
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
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
        fetchData()
        setSelectedTable(null)
      }
    } catch (error) {
      console.error("Error updating table status:", error)
    }
  }

  function getTableStatus(table: Table): TableStatus {
    // Check if table has active order
    const hasActiveOrder = orders.some(
      (o) => o.tableId === table.id && o.status !== "completed" && o.status !== "cancelled"
    )
    
    if (hasActiveOrder) return "occupied"
    return table.status || "empty"
  }

  function getStatusColor(status: TableStatus) {
    switch (status) {
      case "occupied":
        return "bg-orange-500"
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
        return ["cleaning", "empty"]
      case "cleaning":
        return ["empty", "occupied"]
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tables.map((table) => {
          const status = getTableStatus(table)
          const tableOrder = orders.find(
            (o) => o.tableId === table.id && o.status !== "completed" && o.status !== "cancelled"
          )
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
                } ${status === "occupied" ? "border-orange-600" : status === "cleaning" ? "border-yellow-600" : status === "reserved" ? "border-blue-600" : "border-gray-400 dark:border-gray-500"}`}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white drop-shadow-lg">
                    {table.number}
                  </div>
                  {tableOrder && (
                    <div className="mt-2 text-xs font-semibold text-white/90">
                      Order Active
                    </div>
                  )}
                </div>
              </button>

              {isSelected && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border bg-background p-3 shadow-lg">
                  <div className="mb-2 text-center">
                    <p className="text-sm font-semibold">Table {table.number}</p>
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
                        onClick={() => updateTableStatus(table.id, nextStatus)}
                      >
                        Mark as {getStatusLabel(nextStatus)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}



