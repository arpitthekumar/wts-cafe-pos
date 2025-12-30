import { NextResponse } from "next/server"
import { orders, tables } from "@/lib/db/queries"
import { Order } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cafeId = searchParams.get("cafeId")
    const tableId = searchParams.get("tableId")
    const status = searchParams.get("status")


    let ordersList: Order[] = []
    
    if (cafeId) {
      ordersList = orders.getByCafeId(cafeId)
    } else if (tableId) {
      ordersList = orders.getByTableId(tableId)
    } else {
      ordersList = orders.getAll()
    }
    
    if (status) {
      const statuses = status.split(",")
      ordersList = ordersList.filter((o) => statuses.includes(o.status))
    }

    return NextResponse.json(ordersList)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cafeId, tableId, items, customerName, customerEmail } = body

    if (!cafeId || !tableId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cafe ID, Table ID, and items are required" },
        { status: 400 }
      )
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { error: "Customer name and email are required" },
        { status: 400 }
      )
    }

    // Get table info
    const table = tables.getById(tableId)
    if (!table || table.cafeId !== cafeId) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      )
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const newOrder = orders.create({
      cafeId,
      tableId,
      tableNumber: table.number,
      items,
      status: "pending",
      total,
      customerName,
      customerEmail,
    })

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

