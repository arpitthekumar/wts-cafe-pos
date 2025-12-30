import db from "../client"
import type { Review } from "../../types"

export const reviews = {
  getByCafeId: (cafeId: string): Review[] => {
    return db.prepare("SELECT * FROM reviews WHERE cafeId = ? ORDER BY createdAt DESC").all(cafeId) as Review[]
  },

  getByOrderId: (orderId: string): Review | undefined => {
    return db.prepare("SELECT * FROM reviews WHERE orderId = ?").get(orderId) as Review | undefined
  },

  create: (review: Omit<Review, "id" | "createdAt">): Review => {
    const id = `review-${Date.now()}`
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO reviews (id, cafeId, tableId, orderId, rating, comment, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      review.cafeId,
      review.tableId,
      review.orderId,
      review.rating,
      review.comment || null,
      now
    )
    return reviews.getByOrderId(review.orderId)!
  },

  getAverageRating: (cafeId: string): number => {
    const result = db.prepare("SELECT AVG(rating) as avg FROM reviews WHERE cafeId = ?").get(cafeId) as { avg: number | null }
    return result.avg || 0
  },
}



