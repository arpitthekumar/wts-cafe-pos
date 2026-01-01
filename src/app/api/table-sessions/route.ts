import { NextResponse } from "next/server"
import { tableSessions } from "@/lib/db/queries"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cafeId = searchParams.get("cafeId")
    const tableId = searchParams.get("tableId")
    const customerEmail = searchParams.get("customerEmail")

    if (tableId) {
      const session = tableSessions.getActiveByTableId(tableId)
      return NextResponse.json(session || null)
    }

    if (customerEmail && cafeId) {
      const sessions = tableSessions.getByCustomerEmail(customerEmail, cafeId)
      return NextResponse.json(sessions)
    }

    if (cafeId) {
      const sessions = tableSessions.getByCafeId(cafeId)
      return NextResponse.json(sessions.filter(s => s.isActive))
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching table sessions:", error)
    return NextResponse.json(
      { error: "Failed to fetch table sessions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cafeId, tableId, tableNumber, customerName, customerEmail } = body

    if (!cafeId || !tableId || !tableNumber || !customerName || !customerEmail) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const session = tableSessions.create({
      cafeId,
      tableId,
      tableNumber,
      customerName,
      customerEmail,
      isActive: true,
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error("Error creating table session:", error)
    return NextResponse.json(
      { error: "Failed to create table session" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get("tableId")
    const sessionId = searchParams.get("sessionId")

    if (tableId) {
      const ended = tableSessions.endSession(tableId)
      return NextResponse.json({ success: ended })
    }

    if (sessionId) {
      const ended = tableSessions.endSessionById(sessionId)
      return NextResponse.json({ success: ended })
    }

    return NextResponse.json(
      { error: "tableId or sessionId is required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error ending table session:", error)
    return NextResponse.json(
      { error: "Failed to end table session" },
      { status: 500 }
    )
  }
}

