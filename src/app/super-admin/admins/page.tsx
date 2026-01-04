"use client"

import { useState, useEffect } from "react"
import { Button, Input, Label } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import Link from "next/link"
import { fakeUsers } from "@/lib/fake-users"

interface AdminUser {
  id: string
  name: string
  email: string
  cafeId?: string
  cafeName?: string
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [cafes, setCafes] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [cafesRes] = await Promise.all([
        fetch("/api/cafes"),
      ])

      if (cafesRes.ok) {
        const cafesData = await cafesRes.json()
        setCafes(cafesData)
      }

      // Get admin users (from fake users for now)
      const adminUsers = fakeUsers
        .filter(u => u.role === "admin")
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          cafeId: u.cafeId,
          cafeName: cafes.find(c => c.id === u.cafeId)?.name || "Unassigned",
        }))
      
      setAdmins(adminUsers)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function createAdmin(admin: { name: string; email: string; password: string; cafeId?: string }) {
    // In a real app, this would create a user via API
    // For now, we'll just show a message
    alert(`Admin creation would be handled via API. This is a demo.`)
    setShowAddForm(false)
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
          title="Admin Management"
          subtitle="Create and manage café admins"
        />

        <div className="mb-6 flex justify-between">
          <Link href="/super-admin">
            <Button variant="outline">← Back</Button>
          </Link>
          <Button onClick={() => setShowAddForm(true)}>Add New Admin</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => (
            <div key={admin.id} className="rounded-lg border bg-card p-6">
              <h3 className="mb-2 text-xl font-semibold">{admin.name}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{admin.email}</p>
              <p className="mb-4 text-sm">
                <span className="font-medium">Café: </span>
                <span className={admin.cafeId ? "text-green-600" : "text-red-600"}>
                  {admin.cafeName}
                </span>
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Reset Password
                </Button>
              </div>
            </div>
          ))}
        </div>

        {showAddForm && (
          <AdminForm
            cafes={cafes}
            onSave={createAdmin}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  )
}

function AdminForm({
  cafes,
  onSave,
  onClose,
}: {
  cafes: any[]
  onSave: (admin: { name: string; email: string; password: string; cafeId?: string }) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cafeId: "",
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Add New Admin</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="cafeId">Assign to Café</Label>
            <select
              id="cafeId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.cafeId}
              onChange={(e) => setFormData({ ...formData, cafeId: e.target.value })}
            >
              <option value="">Select a café (optional)</option>
              {cafes.map((cafe) => (
                <option key={cafe.id} value={cafe.id}>
                  {cafe.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex-1">
              Create Admin
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




