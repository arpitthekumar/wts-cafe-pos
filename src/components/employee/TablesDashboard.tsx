"use client"

import { useState, useEffect } from "react"
import { Table, TableStatus, Order, TableSession } from "@/lib/types"
import { Button } from "@/components/ui"
import { TableBillingModal } from "./TableBillingModal"
import { User, Coins, RefreshCw, Layers, CheckCircle2 } from "lucide-react"

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
    const hasActiveSession = sessions.some(s => s.tableId === table.id && s.isActive)
    const hasServedOrder = orders.some(
      (o) => o.tableId === table.id && o.status === "served"
    )
    if (hasServedOrder) return "served"
    
    const hasActiveOrder = orders.some(
      (o) => o.tableId === table.id && o.status !== "completed" && o.status !== "cancelled" && o.status !== "served"
    )
    
    if (hasActiveOrder) return "occupied"
    if (hasActiveSession) return "cleaning"
    
    return table.status || "empty"
  }

  function getTableCustomer(table: Table): TableSession | undefined {
    return sessions.find(s => s.tableId === table.id && s.isActive)
  }

  const borderStyles: Record<TableStatus, string> = {
    empty: "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300",
    occupied: "border-orange-500 bg-orange-500/5 dark:bg-orange-500/10",
    served: "border-purple-500 bg-purple-500/5 dark:bg-purple-500/10",
    cleaning: "border-yellow-500 bg-yellow-500/5 dark:bg-yellow-500/10",
    reserved: "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10",
  }

  const dotColors: Record<TableStatus, string> = {
    empty: "bg-zinc-300 dark:bg-zinc-600",
    occupied: "bg-orange-500",
    served: "bg-purple-500",
    cleaning: "bg-yellow-500",
    reserved: "bg-blue-500",
  }

  function getStatusLabel(status: TableStatus) {
    switch (status) {
      case "occupied": return "Occupied"
      case "served": return "Served"
      case "cleaning": return "Cleaning"
      case "reserved": return "Reserved"
      default: return "Ready to Use"
    }
  }

  function getNextStatusOptions(currentStatus: TableStatus): TableStatus[] {
    switch (currentStatus) {
      case "occupied": return ["served", "cleaning", "empty"]
      case "served": return ["cleaning", "empty", "occupied"]
      case "cleaning": return ["empty", "occupied", "reserved"]
      case "reserved": return ["empty", "occupied"]
      default: return ["occupied", "reserved", "cleaning"]
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground font-medium">Loading tables...</span>
      </div>
    )
  }

  return (
    <div className="space-y-5 bg-card border border-border/60 rounded-[20px] p-5 shadow-xs">
      {/* Header and Legend */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/80 pb-4">
        <h2 className="font-headline text-base font-extrabold text-foreground">Live Tables Dashboard</h2>
        
        {/* Status Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Cleaning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Served</span>
          </div>
        </div>
      </div>

      {/* Grid of tables */}
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
                className={`w-full rounded-[20px] p-5 border-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[115px] relative cursor-pointer ${
                  borderStyles[status]
                } ${
                  isSelected
                    ? "ring-4 ring-orange-500/20 scale-[1.03]"
                    : "hover:scale-[1.03]"
                }`}
              >
                {/* Floating Status Dot */}
                <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                  {(status === "occupied" || status === "cleaning") && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[status]}`} />
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColors[status]}`} />
                </span>

                <div className="text-center">
                  <div className="text-3xl font-headline font-extrabold text-foreground">
                    {table.number}
                  </div>
                  {tableCustomer && (
                    <div className="mt-1.5 text-[10px] font-bold text-foreground/80 flex items-center justify-center gap-1">
                      <User className="w-3 h-3 text-orange-500" />
                      <span className="truncate max-w-[80px]">{tableCustomer.customerName}</span>
                    </div>
                  )}
                  {tableOrder && (
                    <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      Order: {tableOrder.status}
                    </div>
                  )}
                  {!tableCustomer && !tableOrder && (
                    <div className="mt-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      {status === "empty" ? "Available" : status}
                    </div>
                  )}
                </div>
              </button>

              {/* Action Dropdown Card */}
              {isSelected && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-[20px] border border-border bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 w-52 sm:w-56">
                  <div className="mb-3 text-center border-b border-border pb-2">
                    <p className="font-headline font-extrabold text-sm text-foreground">Table {table.number}</p>
                    {tableCustomer && (
                      <p className="text-[10px] font-semibold text-muted-foreground truncate mt-0.5">
                        {tableCustomer.customerName} ({tableCustomer.customerEmail.slice(0, 10)}...)
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Set Status</p>
                    <div className="grid grid-cols-1 gap-1">
                      {nextOptions.map((nextStatus) => (
                        <button
                          key={nextStatus}
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTableStatus(table.id, nextStatus)
                          }}
                          className="h-8 text-[11px] font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-foreground cursor-pointer transition-colors"
                        >
                          Mark as {getStatusLabel(nextStatus)}
                        </button>
                      ))}
                    </div>

                    {tableCustomer && (
                      <div className="pt-2 border-t border-border mt-2 space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setBillingTable(table)
                            setShowBillingModal(true)
                          }}
                          className="w-full h-8.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/10"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Bill Table</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateTableStatus(table.id, "cleaning")
                          }}
                          className="w-full h-8 rounded-lg border border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/10 text-red-600 dark:text-red-400 font-bold text-xs transition-colors cursor-pointer"
                        >
                          End Session & Clean
                        </button>
                      </div>
                    )}

                    {!tableCustomer && (status === "served" || status === "occupied") && (
                      <div className="pt-2 border-t border-border mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setBillingTable(table)
                            setShowBillingModal(true)
                          }}
                          className="w-full h-8.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Bill Table</span>
                        </button>
                      </div>
                    )}

                    <button
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
                      className="w-full h-8.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-muted-foreground hover:text-foreground font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer mt-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Table</span>
                    </button>
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
