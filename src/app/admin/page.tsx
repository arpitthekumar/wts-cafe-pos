"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { Button } from "@/components/ui"
import Link from "next/link"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Manage your café operations"
          role="admin"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/menu">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Menu Management</h3>
              <p className="text-sm text-muted-foreground">
                Add, edit, and manage menu items and categories
              </p>
            </div>
          </Link>

          <Link href="/admin/tables">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Table Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage tables and generate QR codes
              </p>
            </div>
          </Link>

          <Link href="/admin/employees">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Employee Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage staff, roles, and salaries
              </p>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Orders & Sales</h3>
              <p className="text-sm text-muted-foreground">
                View orders history and sales reports
              </p>
            </div>
          </Link>

          <Link href="/admin/reviews">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Customer Reviews</h3>
              <p className="text-sm text-muted-foreground">
                View and respond to customer feedback
              </p>
            </div>
          </Link>

          <Link href="/admin/reports">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Sales & Reports</h3>
              <p className="text-sm text-muted-foreground">
                View sales analytics and insights
              </p>
            </div>
          </Link>

          <Link href="/admin/salary">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Employee Salary</h3>
              <p className="text-sm text-muted-foreground">
                Track and manage employee salaries
              </p>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">Café Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage café information and preferences
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

