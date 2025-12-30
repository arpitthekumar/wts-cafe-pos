import { NextResponse } from "next/server"
import { helpRequests, tables } from "@/lib/db/queries"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cafeId = searchParams.get("cafeId")
    const status = searchParams.get("status")

    if (cafeId) {
      if (status === "pending") {
        const requests = helpRequests.getPending(cafeId)
        return NextResponse.json(requests)
      }
      const requests = helpRequests.getByCafeId(cafeId)
      return NextResponse.json(requests)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Error fetching help requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch help requests" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cafeId, tableId } = body

    if (!cafeId || !tableId) {
      return NextResponse.json(
        { error: "Cafe ID and Table ID are required" },
        { status: 400 }
      )
    }

    // Get table info to get table number
    const table = tables.getById(tableId)
    if (!table) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      )
    }
    const newRequest = helpRequests.create({
      cafeId,
      tableId,
      tableNumber: table.number,
      status: "pending",
    })

    return NextResponse.json(newRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating help request:", error)
    return NextResponse.json(
      { error: "Failed to create help request" },
      { status: 500 }
    )
  }
}

