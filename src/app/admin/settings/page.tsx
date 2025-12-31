"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Cafe, Currency } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import Link from "next/link"

export default function SettingsPage() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId || "cafe-1"
  const [cafe, setCafe] = useState<Cafe | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCafe()
  }, [cafeId])

  async function fetchCafe() {
    try {
      const response = await fetch(`/api/cafes/${cafeId}`)
      if (response.ok) {
        const data = await response.json()
        setCafe(data)
      }
    } catch (error) {
      console.error("Error fetching café:", error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings(updates: Partial<Cafe>) {
    setSaving(true)
    try {
      const response = await fetch(`/api/cafes/${cafeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updated = await response.json()
        setCafe(updated)
        alert("Settings saved successfully!")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !cafe) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <DashboardHeader
          title="Café Settings"
          subtitle="Manage your café information and preferences"
          role="admin"
        />

        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>

        <SettingsForm cafe={cafe} onSave={saveSettings} saving={saving} />
      </div>
    </div>
  )
}

function SettingsForm({
  cafe,
  onSave,
  saving,
}: {
  cafe: Cafe
  onSave: (updates: Partial<Cafe>) => void
  saving: boolean
}) {
  const [formData, setFormData] = useState({
    name: cafe.name,
    address: cafe.address,
    phone: cafe.phone || "",
    email: cafe.email || "",
    isActive: cafe.isActive,
    currency: (cafe.currency || "USD") as Currency,
  })

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Café Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <Label htmlFor="isActive">Café is Active</Label>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={() => onSave(formData)}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}




