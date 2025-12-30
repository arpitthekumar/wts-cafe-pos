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

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [cafeId])

  async function fetchData() {
    try {
      const [tablesRes, ordersRes] = await Promise.all([
        fetch(`/api/tables?cafeId=${cafeId}`),
        fetch(`/api/orders?cafeId=${cafeId}&status=pending,preparing,ready`),
      ])

      if (tablesRes.ok) {
        const tablesData = await tablesRes.json()
        setTables(tablesData)
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
        return "bg-red-500 hover:bg-red-600"
      case "cleaning":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "reserved":
        return "bg-blue-500 hover:bg-blue-600"
      case "empty":
      default:
        return "bg-green-500 hover:bg-green-600"
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
        return "Empty"
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
        <h2 className="text-xl font-semibold">Table Status</h2>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500"></div>
            <span>Empty</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-500"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-yellow-500"></div>
            <span>Cleaning</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tables.map((table) => {
          const status = getTableStatus(table)
          const tableOrder = orders.find(
            (o) => o.tableId === table.id && o.status !== "completed" && o.status !== "cancelled"
          )

          return (
            <div
              key={table.id}
              className={`relative rounded-lg border-2 p-4 transition-all ${
                status === "occupied"
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : status === "cleaning"
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                  : "border-green-500 bg-green-50 dark:bg-green-950"
              }`}
            >
              <div className="mb-2 text-center">
                <h3 className="text-lg font-bold">Table {table.number}</h3>
                {table.capacity && (
                  <p className="text-xs text-muted-foreground">
                    Capacity: {table.capacity}
                  </p>
                )}
              </div>

              <div className="mb-2 text-center">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium text-white ${getStatusColor(status)}`}
                >
                  {getStatusLabel(status)}
                </span>
              </div>

              {tableOrder && (
                <div className="mb-2 rounded bg-white/50 p-2 text-xs dark:bg-black/20">
                  <p className="font-medium">Order #{tableOrder.id.slice(-6)}</p>
                  <p className="text-muted-foreground">
                    ${tableOrder.total.toFixed(2)} • {tableOrder.status}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                {status === "occupied" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => updateTableStatus(table.id, "cleaning")}
                  >
                    Mark Cleaning
                  </Button>
                )}
                {status === "cleaning" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => updateTableStatus(table.id, "empty")}
                  >
                    Mark Empty
                  </Button>
                )}
                {status === "empty" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => updateTableStatus(table.id, "reserved")}
                  >
                    Mark Reserved
                  </Button>
                )}
                {status === "reserved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => updateTableStatus(table.id, "empty")}
                  >
                    Mark Empty
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}



