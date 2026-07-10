"use client"

import { useState } from "react"
import { Bell, BellOff, Check } from "lucide-react"

interface CallEmployeeButtonProps {
  cafeId: string
  tableId: string
}

export function CallEmployeeButton({ cafeId, tableId }: CallEmployeeButtonProps) {
  const [helpRequested, setHelpRequested] = useState(false)

  async function callEmployee() {
    if (helpRequested) return
    
    try {
      const response = await fetch("/api/help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeId,
          tableId,
        }),
      })

      if (response.ok) {
        setHelpRequested(true)
        setTimeout(() => setHelpRequested(false), 15000) // Reset after 15s
      }
    } catch (error) {
      console.error("Error calling employee:", error)
    }
  }

  return (
    <button
      onClick={callEmployee}
      disabled={helpRequested}
      className={`relative inline-flex items-center justify-center gap-2 h-10 px-4 rounded-chip font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none cursor-pointer border ${
        helpRequested
          ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20"
          : "bg-red-50 border-red-200/60 hover:bg-red-100/60 dark:bg-red-950/15 dark:border-red-900/30 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
      }`}
    >
      {/* Pulse ring animation */}
      {!helpRequested && (
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      )}

      {helpRequested ? (
        <>
          <Check className="w-4 h-4" />
          <span>Help Sent</span>
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          <span>Call Waiter</span>
        </>
      )}
    </button>
  )
}
