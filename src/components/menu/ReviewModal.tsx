"use client"

import { useState } from "react"
import { Order } from "@/lib/types"
import { Button } from "@/components/ui"

interface ReviewModalProps {
  order: Order
  onClose: () => void
  onSubmit: (rating: number, comment?: string) => void
}

export function ReviewModal({ order, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Rate Your Experience</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          How was your order?
        </p>
        <div className="mb-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              onClick={() => setRating(r)}
              className={`text-3xl transition-transform hover:scale-110 ${
                r <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
        {rating > 0 && (
          <div className="mb-4">
            <textarea
              placeholder="Optional comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              rows={3}
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Skip
          </Button>
          {rating > 0 && (
            <Button
              className="flex-1"
              onClick={() => onSubmit(rating, comment || undefined)}
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}



