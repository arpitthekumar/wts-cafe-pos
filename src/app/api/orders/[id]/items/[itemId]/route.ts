import { NextResponse } from "next/server"
import { orders, orderItems } from "@/lib/db/queries"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params

    const order = orders.getById(id)
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Get the item to remove - check if it belongs to this order
    const item = orderItems.getById(itemId)
    if (!item) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      )
    }
    
    // Verify the item belongs to this order by checking order's items
    const orderItemsList = order.items || []
    if (!orderItemsList.find(oi => oi.id === itemId)) {
      return NextResponse.json(
        { error: "Order item does not belong to this order" },
        { status: 404 }
      )
    }

    // Calculate the amount to subtract
    const itemTotal = item.price * item.quantity

    // Delete the item
    orderItems.delete(itemId)

    // Update order total
    const updatedOrder = orders.update(id, {
      total: Math.max(0, order.total - itemTotal),
    })

    return NextResponse.json({
      order: updatedOrder,
      removed: true,
    })
  } catch (error) {
    console.error("Error removing item from order:", error)
    return NextResponse.json(
      { error: "Failed to remove item from order" },
      { status: 500 }
    )
  }
}

