"use client"

import { useEffect, useRef } from "react"
import { HelpRequest } from "@/lib/types"
import { sounds } from "@/lib/utils/sound"
import { SoundTestButton } from "./SoundTestButton"
import { BellRing, Check } from "lucide-react"

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
    <div className="mb-8 rounded-[20px] border border-red-200/60 bg-red-50/40 dark:border-red-900/30 dark:bg-red-950/10 p-5 shadow-md shadow-red-500/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-headline font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 dark:bg-red-500" />
          </span>
          🚨 Active Help Requests ({requests.length})
        </h2>
        <SoundTestButton />
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-100 dark:border-red-950 bg-card p-4 shadow-xs transition-all hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100/60 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="font-headline font-bold text-foreground text-sm">
                  Table {request.tableNumber} needs assistance
                </p>
                {request.message && (
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">
                    "{request.message}"
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                sounds.stopHelpRequest()
                onRespond(request.id)
              }}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-chip bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-all hover:scale-103 active:scale-97 cursor-pointer shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acknowledge</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
