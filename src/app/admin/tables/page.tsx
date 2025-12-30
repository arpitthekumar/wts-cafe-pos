"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Table } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { QRCodeModal } from "./QRCodeModal"

export default function TablesPage() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId || "cafe-1"
  const [tables, setTables] = useState<Table[]>([])
  const [showAddTable, setShowAddTable] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTables()
    // Update QR codes on mount to ensure they use cafe names
    updateAllQRCodes()
  }, [cafeId])

  async function updateAllQRCodes() {
    try {
      await fetch("/api/tables/update-qr-codes", { method: "POST" })
    } catch (error) {
      // Silently fail - QR codes will be updated on next table operation
    }
  }

  async function fetchTables() {
    try {
      const response = await fetch(`/api/tables?cafeId=${cafeId}`)
      if (response.ok) {
        const data = await response.json()
        setTables(data)
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
    } finally {
      setLoading(false)
    }
  }

  async function saveTable(table: Partial<Table>) {
    try {
      const url = editingTable
        ? `/api/tables/${editingTable.id}`
        : `/api/tables`
      const method = editingTable ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...table, cafeId }),
      })

      if (response.ok) {
        fetchTables()
        setShowAddTable(false)
        setEditingTable(null)
      }
    } catch (error) {
      console.error("Error saving table:", error)
    }
  }

  async function deleteTable(id: string) {
    if (!confirm("Are you sure you want to delete this table?")) return

    try {
      const response = await fetch(`/api/tables/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTables()
      }
    } catch (error) {
      console.error("Error deleting table:", error)
    }
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
          title="Table Management"
          subtitle="Manage tables and generate QR codes"
          role="admin"
        />

        <div className="mb-6 flex justify-end">
          <Button onClick={() => setShowAddTable(true)}>Add Table</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <div key={table.id} className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Table {table.number}</h3>
                  <p className="text-sm text-muted-foreground">
                    Capacity: {table.capacity || "N/A"}
                  </p>
                </div>
                <span className={`text-xs ${table.isActive ? "text-green-600" : "text-red-600"}`}>
                  {table.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTable(table)}
                >
                  Generate QR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingTable(table)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteTable(table.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {(showAddTable || editingTable) && (
          <TableForm
            table={editingTable}
            onSave={saveTable}
            onClose={() => {
              setShowAddTable(false)
              setEditingTable(null)
            }}
          />
        )}

        {selectedTable && (
          <QRCodeModal
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
          />
        )}
      </div>
    </div>
  )
}

function TableForm({
  table,
  onSave,
  onClose,
}: {
  table: Table | null
  onSave: (table: Partial<Table>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    number: table?.number || 1,
    capacity: table?.capacity || 4,
    isActive: table?.isActive ?? true,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          {table ? "Edit Table" : "Add Table"}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="number">Table Number</Label>
            <Input
              id="number"
              type="number"
              min="1"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div>
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex-1">
              Save
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


