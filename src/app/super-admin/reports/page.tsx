"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import Link from "next/link"

interface ReportData {
  totalCafes: number
  activeCafes: number
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  cafeWiseRevenue: { cafeId: string; cafeName: string; revenue: number; orders: number }[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("all")

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  async function fetchReports() {
    try {
      const [cafesRes, ordersRes] = await Promise.all([
        fetch("/api/cafes"),
        fetch("/api/orders"),
      ])

      const cafes = cafesRes.ok ? await cafesRes.json() : []
      const orders = ordersRes.ok ? await ordersRes.json() : []

      // Filter orders by date range
      let filteredOrders = orders
      if (dateRange !== "all") {
        const now = new Date()
        const filterDate = new Date()
        
        if (dateRange === "today") {
          filterDate.setHours(0, 0, 0, 0)
        } else if (dateRange === "week") {
          filterDate.setDate(now.getDate() - 7)
        } else if (dateRange === "month") {
          filterDate.setMonth(now.getMonth() - 1)
        }

        filteredOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.createdAt)
          return orderDate >= filterDate
        })
      }

      const completedOrders = filteredOrders.filter((o: any) => o.status === "completed")
      const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      // Calculate café-wise revenue
      const cafeWiseRevenue = cafes.map((cafe: any) => {
        const cafeOrders = completedOrders.filter((o: any) => o.cafeId === cafe.id)
        const revenue = cafeOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
        return {
          cafeId: cafe.id,
          cafeName: cafe.name,
          revenue,
          orders: cafeOrders.length,
        }
      })

      setReportData({
        totalCafes: cafes.length,
        activeCafes: cafes.filter((c: any) => c.isActive).length,
        totalOrders: filteredOrders.length,
        completedOrders: completedOrders.length,
        totalRevenue,
        cafeWiseRevenue,
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
          title="Platform Reports"
          subtitle="Analytics and insights across all cafés"
        />

        <div className="mb-6 flex justify-between">
          <Link href="/super-admin">
            <Button variant="outline">← Back</Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant={dateRange === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("today")}
            >
              Today
            </Button>
            <Button
              variant={dateRange === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("week")}
            >
              This Week
            </Button>
            <Button
              variant={dateRange === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("month")}
            >
              This Month
            </Button>
            <Button
              variant={dateRange === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("all")}
            >
              All Time
            </Button>
          </div>
        </div>

        {reportData && (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Cafés</p>
                <p className="text-2xl font-bold">{reportData.totalCafes}</p>
                <p className="text-xs text-muted-foreground">
                  {reportData.activeCafes} active
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{reportData.totalOrders}</p>
                <p className="text-xs text-muted-foreground">
                  {reportData.completedOrders} completed
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${reportData.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  ${reportData.completedOrders > 0 
                    ? (reportData.totalRevenue / reportData.completedOrders).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>

            {/* Café-wise Breakdown */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="mb-4 text-lg font-semibold">Revenue by Café</h3>
              <div className="space-y-3">
                {reportData.cafeWiseRevenue.map((cafe) => (
                  <div key={cafe.cafeId} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{cafe.cafeName}</p>
                      <p className="text-sm text-muted-foreground">
                        {cafe.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${cafe.revenue.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {reportData.totalRevenue > 0
                          ? ((cafe.revenue / reportData.totalRevenue) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
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



