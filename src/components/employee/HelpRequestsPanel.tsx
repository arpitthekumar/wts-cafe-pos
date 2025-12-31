"use client"

import { useEffect, useRef } from "react"
import { HelpRequest } from "@/lib/types"
import { Button } from "@/components/ui"
import { sounds } from "@/lib/utils/sound"

interface HelpRequestsPanelProps {
  requests: HelpRequest[]
  onRespond: (requestId: string) => void
}

export function HelpRequestsPanel({ requests, onRespond }: HelpRequestsPanelProps) {
  const previousCount = useRef(requests.length)

  useEffect(() => {
    // Play sound when new help request arrives (always play, even if page is visible)
    if (requests.length > previousCount.current) {
      sounds.helpRequest()
      // Also play again after 2 seconds to grab attention
      setTimeout(() => {
        sounds.helpRequest()
      }, 2000)
    }
    previousCount.current = requests.length
  }, [requests.length])

  return (
    <div className="mb-6 rounded-lg border-2 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">⚠️ Help Requests ({requests.length})</h2>
      </div>
      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between rounded border bg-background p-3"
          >
            <div>
              <p className="font-medium">Table {request.tableNumber} needs assistance</p>
              {request.message && (
                <p className="text-sm text-muted-foreground">{request.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(request.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => onRespond(request.id)}
            >
              Respond
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}




