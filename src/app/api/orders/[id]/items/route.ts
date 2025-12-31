import { NextResponse } from "next/server"
import { orders, orderItems } from "@/lib/db/queries"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { items } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      )
    }

    const order = orders.getById(id)
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Add new items to the order
    const newItems = items.map((item: any) => orderItems.create(id, item))
    
    // Calculate additional total
    const additionalTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    
    // Update order total
    const updatedOrder = orders.update(id, {
      total: order.total + additionalTotal,
    })

    return NextResponse.json({
      order: updatedOrder,
      addedItems: newItems,
    })
  } catch (error) {
    console.error("Error adding items to order:", error)
    return NextResponse.json(
      { error: "Failed to add items to order" },
      { status: 500 }
    )
  }
}




