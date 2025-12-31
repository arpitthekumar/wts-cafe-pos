import { NextResponse } from "next/server"
import { tables, tableSessions } from "@/lib/db/queries"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tableId, cafeId } = body

    if (tableId) {
      // Reset specific table
      const table = tables.getById(tableId)
      if (!table) {
        return NextResponse.json(
          { error: "Table not found" },
          { status: 404 }
        )
      }

      // End any active session
      tableSessions.endSession(tableId)

      // Reset table status to empty
      tables.update(tableId, { status: "empty" })

      return NextResponse.json({ 
        success: true, 
        message: `Table ${table.number} has been reset` 
      })
    }

    if (cafeId) {
      // Reset all tables for a cafe
      const cafeTables = tables.getByCafeId(cafeId)
      let resetCount = 0

      for (const table of cafeTables) {
        tableSessions.endSession(table.id)
        tables.update(table.id, { status: "empty" })
        resetCount++
      }

      return NextResponse.json({ 
        success: true, 
        message: `Reset ${resetCount} tables`,
        resetCount
      })
    }

    return NextResponse.json(
      { error: "tableId or cafeId is required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error resetting tables:", error)
    return NextResponse.json(
      { error: "Failed to reset tables" },
      { status: 500 }
    )
  }
}

