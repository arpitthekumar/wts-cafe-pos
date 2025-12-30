"use client"

import { useState, useEffect } from "react"
import { Cafe } from "@/lib/types"
import { Button } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import Link from "next/link"

export default function SuperAdminDashboard() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCafes: 0,
    activeCafes: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [cafesRes, ordersRes] = await Promise.all([
        fetch("/api/cafes"),
        fetch("/api/orders"),
      ])
      
      if (cafesRes.ok) {
        const cafesData = await cafesRes.json()
        setCafes(cafesData)
        setStats(prev => ({
          ...prev,
          totalCafes: cafesData.length,
          activeCafes: cafesData.filter((c: Cafe) => c.isActive).length,
        }))
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        const totalRevenue = ordersData
          .filter((o: any) => o.status === "completed")
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0)
        
        setStats(prev => ({
          ...prev,
          totalOrders: ordersData.length,
          totalRevenue,
        }))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
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
          title="Super Admin Dashboard"
          subtitle="Manage all cafés and platform operations"
        />

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Cafés</p>
            <p className="text-2xl font-bold">{stats.totalCafes}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Active Cafés</p>
            <p className="text-2xl font-bold">{stats.activeCafes}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-4">
          <Link href="/super-admin/cafes">
            <Button>Manage Cafés</Button>
          </Link>
          <Link href="/super-admin/admins">
            <Button variant="outline">Manage Admins</Button>
          </Link>
          <Link href="/super-admin/reports">
            <Button variant="outline">Platform Reports</Button>
          </Link>
        </div>

        {/* Cafés List */}
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
              <div className="mt-4 flex gap-2">
                <Link href={`/super-admin/cafes/${cafe.id}`}>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
