import { NextResponse } from "next/server"
import { tables, tableSessions } from "@/lib/db/queries"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cafeId } = body

    if (!cafeId) {
      return NextResponse.json(
        { error: "cafeId is required" },
        { status: 400 }
      )
    }

    // Get all tables for the cafe
    const cafeTables = tables.getByCafeId(cafeId)
    let resetCount = 0

    for (const table of cafeTables) {
      // End any active session
      tableSessions.endSession(table.id)
      
      // Reset table status to empty
      tables.update(table.id, { status: "empty" })
      resetCount++
    }

    return NextResponse.json({ 
      success: true, 
      message: `Reset ${resetCount} tables to ready to use`,
      resetCount
    })
  } catch (error) {
    console.error("Error resetting all tables:", error)
    return NextResponse.json(
      { error: "Failed to reset tables" },
      { status: 500 }
    )
  }
}

