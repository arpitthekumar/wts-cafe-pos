"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { formatCurrency } from "@/lib/utils/currency"
import Link from "next/link"
import { 
  BookOpen, 
  Grid, 
  Users, 
  ShoppingBag, 
  Star, 
  BarChart3, 
  Wallet, 
  Settings, 
  Coins, 
  TrendingUp, 
  Layers, 
  ChevronRight 
} from "lucide-react"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId

  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    activeTables: 0,
    staffCount: 0,
  })
  const [alerts, setAlerts] = useState({
    helpRequests: 0,
    pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const effectiveCafeId = cafeId || "cafe-1"
    
    async function fetchAdminData() {
      try {
        const [ordersRes, tablesRes, employeesRes, helpRes] = await Promise.all([
          fetch(`/api/orders?cafeId=${effectiveCafeId}`),
          fetch(`/api/tables?cafeId=${effectiveCafeId}`),
          fetch(`/api/employees?cafeId=${effectiveCafeId}`),
          fetch(`/api/help-requests?cafeId=${effectiveCafeId}&status=pending`),
        ])

        let revenue = 0
        let totalOrders = 0
        let pendingOrders = 0
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          totalOrders = ordersData.length
          revenue = ordersData
            .filter((o: any) => o.status === "completed" || o.status === "served")
            .reduce((sum: number, o: any) => sum + o.total, 0)
          pendingOrders = ordersData.filter((o: any) => o.status === "pending").length
        }

        let activeTables = 0
        if (tablesRes.ok) {
          const tablesData = await tablesRes.json()
          activeTables = tablesData.filter((t: any) => t.status !== "empty").length
        }

        let staffCount = 0
        if (employeesRes.ok) {
          const staffData = await employeesRes.json()
          staffCount = staffData.length
        }

        let helpRequests = 0
        if (helpRes.ok) {
          const helpData = await helpRes.json()
          helpRequests = helpData.length
        }

        setStats({
          revenue,
          totalOrders,
          activeTables,
          staffCount,
        })

        setAlerts({
          helpRequests,
          pendingOrders,
        })
      } catch (error) {
        console.error("Error fetching admin metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
    const interval = setInterval(fetchAdminData, 5000)
    return () => clearInterval(interval)
  }, [cafeId])

  const navItems = [
    {
      title: "Menu Management",
      desc: "Add, edit, and manage menu items and categories",
      href: "/admin/menu",
      color: "bg-orange-50 dark:bg-orange-950/10 border-orange-100 dark:border-orange-900/20 text-orange-600 dark:text-orange-400",
      icon: BookOpen,
    },
    {
      title: "Table Management",
      desc: "Manage tables and generate QR codes",
      href: "/admin/tables",
      color: "bg-blue-50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20 text-blue-600 dark:text-blue-400",
      icon: Grid,
    },
    {
      title: "Employee Management",
      desc: "Manage staff, roles, and salaries",
      href: "/admin/employees",
      color: "bg-purple-50 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900/20 text-purple-600 dark:text-purple-400",
      icon: Users,
    },
    {
      title: "Orders & Sales",
      desc: "View orders history and sales reports",
      href: "/admin/orders",
      color: "bg-green-50 dark:bg-green-950/10 border-green-100 dark:border-green-900/20 text-green-600 dark:text-green-400",
      icon: ShoppingBag,
    },
    {
      title: "Customer Reviews",
      desc: "View and respond to customer feedback",
      href: "/admin/reviews",
      color: "bg-yellow-50 dark:bg-yellow-950/10 border-yellow-100 dark:border-yellow-900/20 text-yellow-600 dark:text-yellow-400",
      icon: Star,
    },
    {
      title: "Sales & Reports",
      desc: "View sales analytics and insights",
      href: "/admin/reports",
      color: "bg-pink-50 dark:bg-pink-950/10 border-pink-100 dark:border-pink-900/20 text-pink-600 dark:text-pink-400",
      icon: BarChart3,
    },
    {
      title: "Employee Salary",
      desc: "Track and manage employee salaries",
      href: "/admin/salary",
      color: "bg-teal-50 dark:bg-teal-950/10 border-teal-100 dark:border-teal-900/20 text-teal-600 dark:text-teal-400",
      icon: Wallet,
    },
    {
      title: "Café Settings",
      desc: "Manage café information and preferences",
      href: "/admin/settings",
      color: "bg-slate-50 dark:bg-slate-950/10 border-slate-100 dark:border-slate-900/20 text-slate-600 dark:text-slate-400",
      icon: Settings,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm font-bold text-muted-foreground">Loading admin center...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Manage your café operations and analytics"
          role="admin"
        />

        {/* Live Active Operations Alerts Center */}
        {(alerts.helpRequests > 0 || alerts.pendingOrders > 0) && (
          <div className="mb-8 space-y-3">
            {alerts.helpRequests > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10 p-4 shadow-sm flex items-center justify-between animate-pulse-slow">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-400">
                    🚨 Table Assistance Needed! {alerts.helpRequests} tables are currently calling for service.
                  </p>
                </div>
                <Link href="/employee" className="text-xs font-extrabold text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 shrink-0">
                  <span>Open Panel</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
            
            {alerts.pendingOrders > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/10 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400">
                    📦 New Incoming Orders! {alerts.pendingOrders} order tickets are waiting to be accepted.
                  </p>
                </div>
                <Link href="/employee" className="text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 shrink-0">
                  <span>Open Panel</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Live Metrics Summary Section */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Revenue */}
          <div className="bg-card border border-border/60 rounded-[20px] p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Revenue</span>
              <h3 className="text-lg sm:text-2xl font-headline font-extrabold text-foreground mt-1">
                {formatCurrency(stats.revenue * 1.18, "INR")}
              </h3>
              <p className="text-[9px] text-green-600 dark:text-green-400 font-bold mt-1">18% GST Included</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 ml-2">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Orders */}
          <div className="bg-card border border-border/60 rounded-[20px] p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
              <h3 className="text-lg sm:text-2xl font-headline font-extrabold text-foreground mt-1">
                {stats.totalOrders}
              </h3>
              <p className="text-[9px] text-muted-foreground font-bold mt-1">Placed sessions</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Tables */}
          <div className="bg-card border border-border/60 rounded-[20px] p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Tables</span>
              <h3 className="text-lg sm:text-2xl font-headline font-extrabold text-foreground mt-1">
                {stats.activeTables}
              </h3>
              <p className="text-[9px] text-muted-foreground font-bold mt-1">Occupied / cleaning</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 ml-2">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          {/* Staff */}
          <div className="bg-card border border-border/60 rounded-[20px] p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Staff Count</span>
              <h3 className="text-lg sm:text-2xl font-headline font-extrabold text-foreground mt-1">
                {stats.staffCount}
              </h3>
              <p className="text-[9px] text-muted-foreground font-bold mt-1">Active team list</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 ml-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Grid Section */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {navItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <Link key={idx} href={item.href}>
                <div className="bg-card border border-border/60 rounded-[20px] p-5 shadow-xs hover:shadow-md hover:scale-103 transition-all duration-300 flex items-start gap-4 h-full cursor-pointer group">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-headline font-extrabold text-base text-foreground group-hover:text-orange-500 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
