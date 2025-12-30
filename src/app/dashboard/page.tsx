"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    const role = (session.user as any)?.role

    if (role === "super-admin") {
      router.push("/super-admin")
    } else if (role === "admin") {
      router.push("/admin")
    } else if (role === "employee") {
      router.push("/employee")
    } else {
      router.push("/login")
    }
  }, [session, status, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  )
}

