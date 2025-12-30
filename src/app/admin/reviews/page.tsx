"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Review } from "@/lib/types"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

export default function ReviewsPage() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId || "cafe-1"
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [cafeId])

  async function fetchReviews() {
    try {
      const response = await fetch(`/api/reviews?cafeId=${cafeId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
        
        // Calculate average rating
        if (data.length > 0) {
          const avg = data.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.length
          setAverageRating(avg)
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Customer Reviews"
          subtitle="View and respond to customer feedback"
          role="admin"
        />

        <div className="mb-6 rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <p className="text-3xl font-bold">
                {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-3xl font-bold">{reviews.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              No reviews yet
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= review.rating ? "text-yellow-400" : "text-gray-300"}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="font-semibold">{review.rating}/5</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Table {review.tableId} • Order {review.orderId}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}



