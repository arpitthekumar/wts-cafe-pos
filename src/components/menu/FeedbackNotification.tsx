"use client"

import { useState, useEffect } from "react"
import { Order } from "@/lib/types"
import { Button } from "@/components/ui"
import { ReviewModal } from "./ReviewModal"
import { sounds } from "@/lib/utils/sound"

interface FeedbackNotificationProps {
  order: Order
  onClose: () => void
  onSubmitReview: (rating: number, comment?: string) => void
}

export function FeedbackNotification({ order, onClose, onSubmitReview }: FeedbackNotificationProps) {
  const [showReview, setShowReview] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [hasPlayedSound, setHasPlayedSound] = useState(false)

  // Play sound when notification appears
  useEffect(() => {
    if (!hasPlayedSound) {
      sounds.feedback()
      setHasPlayedSound(true)
    }
  }, [hasPlayedSound])

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showReview) {
        setDismissed(true)
        onClose()
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [showReview, onClose])

  if (dismissed) return null

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4">
        <div className="rounded-lg border-2 border-green-500 bg-background p-4 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-green-700 dark:text-green-400">
                Thank you! Your order has been served! 🍽️
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                How was your experience? We'd love to hear your feedback!
              </p>
            </div>
            <button
              onClick={() => {
                setDismissed(true)
                onClose()
              }}
              className="ml-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => setShowReview(true)}
              className="flex-1"
            >
              Leave Feedback
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDismissed(true)
                onClose()
              }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>

      {showReview && (
        <ReviewModal
          order={order}
          onClose={() => {
            setShowReview(false)
            setDismissed(true)
            onClose()
          }}
          onSubmit={(rating, comment) => {
            onSubmitReview(rating, comment)
            setShowReview(false)
            setDismissed(true)
            onClose()
          }}
        />
      )}
    </>
  )
}

