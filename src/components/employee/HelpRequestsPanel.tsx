"use client"

import { useEffect, useRef } from "react"
import { HelpRequest } from "@/lib/types"
import { Button } from "@/components/ui"
import { sounds } from "@/lib/utils/sound"
import { SoundTestButton } from "./SoundTestButton"

interface HelpRequestsPanelProps {
  requests: HelpRequest[]
  onRespond: (requestId: string) => void
}

export function HelpRequestsPanel({
  requests,
  onRespond,
}: HelpRequestsPanelProps) {
  const previousCount = useRef(requests.length)
useEffect(() => {
  const unlock = () => {
    sounds.success()
    document.removeEventListener("click", unlock)
  }

  document.addEventListener("click", unlock)

  return () => document.removeEventListener("click", unlock)
}, [])

  useEffect(() => {
    if (requests.length > previousCount.current) {
      sounds.helpRequest()
    }
    previousCount.current = requests.length
  }, [requests.length])

  return (
    <div className="mb-6 rounded-lg border-2 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
      <h2 className="mb-2 text-lg font-semibold">
        ⚠️ Help Requests ({requests.length})
      </h2>

      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between rounded border bg-background p-3"
          >
            <div>
              <p className="font-medium">
                Table {request.tableNumber} needs assistance
              </p>
              {request.message && (
                <p className="text-sm text-muted-foreground">
                  {request.message}
                </p>
              )}
            </div>
      <SoundTestButton />

            <Button
              size="sm"
              onClick={() => {
                sounds.stopHelpRequest()
                onRespond(request.id)
              }}
            >
              Respond
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
