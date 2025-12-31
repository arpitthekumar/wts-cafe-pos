import { NextResponse } from "next/server"
import { tables, cafes } from "@/lib/db/queries"
import { slugify } from "@/lib/utils/slug"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cafeName = searchParams.get("cafeName")
    const tableId = searchParams.get("tableId")

    if (!cafeName || !tableId) {
      return NextResponse.json(
        { error: "Cafe name and table ID are required" },
        { status: 400 }
      )
    }

    // Get cafe by slug
    const cafe = cafes.getBySlug(cafeName)
    if (!cafe) {
      return NextResponse.json(
        { error: "Café not found", valid: false },
        { status: 404 }
      )
    }

    // Get table and verify it belongs to this cafe
    const table = tables.getById(tableId)
    if (!table) {
      return NextResponse.json(
        { error: "Table not found", valid: false },
        { status: 404 }
      )
    }

    // Verify table belongs to the cafe
    if (table.cafeId !== cafe.id) {
      return NextResponse.json(
        { error: "Table does not belong to this café", valid: false },
        { status: 403 }
      )
    }

    // Verify table is active
    if (!table.isActive) {
      return NextResponse.json(
        { error: "Table is not active", valid: false },
        { status: 403 }
      )
    }

    return NextResponse.json({
      valid: true,
      cafe: {
        id: cafe.id,
        name: cafe.name,
      },
      table: {
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        status: table.status,
      },
    })
  } catch (error) {
    console.error("Error validating table:", error)
    return NextResponse.json(
      { error: "Failed to validate table", valid: false },
      { status: 500 }
    )
  }
}



