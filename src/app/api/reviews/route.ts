import { NextResponse } from "next/server"
import { reviews } from "@/lib/db/queries"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cafeId = searchParams.get("cafeId")
    const orderId = searchParams.get("orderId")

    if (orderId) {
      const review = reviews.getByOrderId(orderId)
      return NextResponse.json(review || null)
    }

    if (cafeId) {
      const reviewsList = reviews.getByCafeId(cafeId)
      return NextResponse.json(reviewsList)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cafeId, tableId, orderId, rating, comment } = body

    if (!cafeId || !tableId || !orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Cafe ID, Table ID, Order ID, and valid rating (1-5) are required" },
        { status: 400 }
      )
    }

    const newReview = reviews.create({
      cafeId,
      tableId,
      orderId,
      rating,
      comment,
    })

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

