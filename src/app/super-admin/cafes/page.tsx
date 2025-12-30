"use client"

import { useState, useEffect } from "react"
import { Cafe } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import Link from "next/link"

export default function CafesManagementPage() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCafes()
  }, [])

  async function fetchCafes() {
    try {
      const response = await fetch("/api/cafes")
      if (response.ok) {
        const data = await response.json()
        setCafes(data)
      }
    } catch (error) {
      console.error("Error fetching cafes:", error)
    } finally {
      setLoading(false)
    }
  }

  async function saveCafe(cafe: Partial<Cafe>) {
    try {
      const url = editingCafe ? `/api/cafes/${editingCafe.id}` : "/api/cafes"
      const method = editingCafe ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cafe),
      })

      if (response.ok) {
        fetchCafes()
        setShowAddForm(false)
        setEditingCafe(null)
      }
    } catch (error) {
      console.error("Error saving cafe:", error)
    }
  }

  async function deleteCafe(id: string) {
    if (!confirm("Are you sure you want to delete this café?")) return

    try {
      const response = await fetch(`/api/cafes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCafes()
      }
    } catch (error) {
      console.error("Error deleting cafe:", error)
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
          title="Café Management"
          subtitle="Create and manage cafés"
        />

        <div className="mb-6 flex justify-between">
          <Link href="/super-admin">
            <Button variant="outline">← Back</Button>
          </Link>
          <Button onClick={() => setShowAddForm(true)}>Add New Café</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cafes.map((cafe) => (
            <div key={cafe.id} className="rounded-lg border bg-card p-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xl font-semibold">{cafe.name}</h3>
                <span className={`text-xs ${cafe.isActive ? "text-green-600" : "text-red-600"}`}>
                  {cafe.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">{cafe.address}</p>
              {cafe.phone && (
                <p className="mb-2 text-sm text-muted-foreground">{cafe.phone}</p>
              )}
              {cafe.email && (
                <p className="mb-4 text-sm text-muted-foreground">{cafe.email}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingCafe(cafe)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteCafe(cafe.id)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {(showAddForm || editingCafe) && (
          <CafeForm
            cafe={editingCafe}
            onSave={saveCafe}
            onClose={() => {
              setShowAddForm(false)
              setEditingCafe(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

function CafeForm({
  cafe,
  onSave,
  onClose,
}: {
  cafe: Cafe | null
  onSave: (cafe: Partial<Cafe>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: cafe?.name || "",
    address: cafe?.address || "",
    phone: cafe?.phone || "",
    email: cafe?.email || "",
    isActive: cafe?.isActive ?? true,
    adminId: cafe?.adminId || "",
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          {cafe ? "Edit Café" : "Add New Café"}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Café Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="adminId">Admin User ID</Label>
            <Input
              id="adminId"
              value={formData.adminId}
              onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
              placeholder="User ID of the admin (optional)"
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



