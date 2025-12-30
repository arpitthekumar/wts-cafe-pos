import { NextResponse } from "next/server"
import { tables, cafes } from "@/lib/db/queries"
import { slugify } from "@/lib/utils/slug"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Always regenerate QR code with cafe name when updating
    const table = tables.getById(id)
    if (table) {
      const cafe = cafes.getById(table.cafeId)
      if (cafe) {
        const cafeSlug = slugify(cafe.name)
        body.qrCode = `/menu/${cafeSlug}/${id}`
      }
    }

    const updated = tables.update(id, body)
    if (!updated) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating table:", error)
    return NextResponse.json(
      { error: "Failed to update table" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const deleted = tables.delete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting table:", error)
    return NextResponse.json(
      { error: "Failed to delete table" },
      { status: 500 }
    )
  }
}

