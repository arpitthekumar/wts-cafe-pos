"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import Link from "next/link"

interface SalesData {
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  topItems: { name: string; quantity: number; revenue: number }[]
  hourlyData: { hour: number; orders: number; revenue: number }[]
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId || "cafe-1"
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    fetchReports()
  }, [cafeId, dateFilter])

  async function fetchReports() {
    try {
      const response = await fetch(`/api/orders?cafeId=${cafeId}`)
      if (!response.ok) return

      const orders = await response.json()
      
      // Filter by date
      let filteredOrders = orders
      if (dateFilter !== "all") {
        const now = new Date()
        const filterDate = new Date()
        
        if (dateFilter === "today") {
          filterDate.setHours(0, 0, 0, 0)
        } else if (dateFilter === "week") {
          filterDate.setDate(now.getDate() - 7)
        } else if (dateFilter === "month") {
          filterDate.setMonth(now.getMonth() - 1)
        }

        filteredOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.createdAt)
          return orderDate >= filterDate
        })
      }

      const completedOrders = filteredOrders.filter((o: any) => o.status === "completed")
      const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      // Today's revenue
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= today && o.status === "completed"
      })
      const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      // Week's revenue
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 7)
      const weekOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= weekAgo && o.status === "completed"
      })
      const weekRevenue = weekOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      // Month's revenue
      const monthAgo = new Date()
      monthAgo.setMonth(today.getMonth() - 1)
      const monthOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= monthAgo && o.status === "completed"
      })
      const monthRevenue = monthOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      // Top items
      const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>()
      completedOrders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          const existing = itemMap.get(item.menuItemId) || { name: item.menuItemName, quantity: 0, revenue: 0 }
          existing.quantity += item.quantity
          existing.revenue += item.price * item.quantity
          itemMap.set(item.menuItemId, existing)
        })
      })
      const topItems = Array.from(itemMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

      // Hourly data
      const hourlyMap = new Map<number, { orders: number; revenue: number }>()
      completedOrders.forEach((order: any) => {
        const hour = new Date(order.createdAt).getHours()
        const existing = hourlyMap.get(hour) || { orders: 0, revenue: 0 }
        existing.orders += 1
        existing.revenue += order.total || 0
        hourlyMap.set(hour, existing)
      })
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        orders: hourlyMap.get(i)?.orders || 0,
        revenue: hourlyMap.get(i)?.revenue || 0,
      }))

      setSalesData({
        totalOrders: filteredOrders.length,
        completedOrders: completedOrders.length,
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        topItems,
        hourlyData,
      })
    } catch (error) {
      console.error("Error fetching reports:", error)
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
          title="Sales & Reports"
          subtitle="View sales analytics and insights"
          role="admin"
        />

        <div className="mb-6 flex justify-between">
          <Link href="/admin">
            <Button variant="outline">← Back</Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant={dateFilter === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("today")}
            >
              Today
            </Button>
            <Button
              variant={dateFilter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("week")}
            >
              This Week
            </Button>
            <Button
              variant={dateFilter === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("month")}
            >
              This Month
            </Button>
            <Button
              variant={dateFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("all")}
            >
              All Time
            </Button>
          </div>
        </div>

        {salesData && (
          <>
            {/* Revenue Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">${salesData.todayRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">${salesData.weekRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">${salesData.monthRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${salesData.totalRevenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Orders Summary */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{salesData.totalOrders}</p>
                <p className="text-xs text-muted-foreground">
                  {salesData.completedOrders} completed
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <p className="text-2xl font-bold">
                  ${salesData.completedOrders > 0
                    ? (salesData.totalRevenue / salesData.completedOrders).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>

            {/* Top Items */}
            <div className="mb-6 rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Top Selling Items</h3>
              <div className="space-y-2">
                {salesData.topItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sales data</p>
                ) : (
                  salesData.topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} sold
                        </p>
                      </div>
                      <p className="font-bold">${item.revenue.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Peak Hours */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Peak Hours</h3>
              <div className="grid grid-cols-6 gap-2 md:grid-cols-12">
                {salesData.hourlyData.map((data) => (
                  <div key={data.hour} className="text-center">
                    <p className="text-xs text-muted-foreground">{data.hour}:00</p>
                    <p className="text-sm font-medium">{data.orders}</p>
                    <p className="text-xs text-muted-foreground">
                      ${data.revenue.toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}



