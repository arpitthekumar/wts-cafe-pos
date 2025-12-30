"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui"
import Link from "next/link"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  role?: "admin" | "employee" | "super-admin"
}

export function DashboardHeader({ title, subtitle, role }: DashboardHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="mb-6 flex items-center justify-between border-b pb-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Link href="/menu/wts-downtown-cafe/table-1">
          <Button variant="outline" size="sm">
            View Menu
          </Button>
        </Link>
        {role === "admin" && (
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
        )}
        {role === "employee" && (
          <Link href="/employee">
            <Button variant="outline" size="sm">
              Employee
            </Button>
          </Link>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}

