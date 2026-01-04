"use client"

import { useState } from "react"
import { Button } from "@/components/ui"

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
        setTimeout(() => setHelpRequested(false), 10000)
      }
    } catch (error) {
      console.error("Error calling employee:", error)
    }
  }

  return (
    <Button
      onClick={callEmployee}
      variant={helpRequested ? "default" : "outline"}
      size="sm"
      disabled={helpRequested}
      className="hover:scale-105"
    >

      {helpRequested ? "✓ Help Requested" : "Call Employee"}
    </Button>
  )
}




