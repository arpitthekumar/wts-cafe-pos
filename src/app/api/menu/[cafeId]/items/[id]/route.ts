import { NextResponse } from "next/server"
import { menuItems } from "@/lib/db/queries"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ cafeId: string; id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = menuItems.update(id, body)
    if (!updated) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cafeId: string; id: string }> }
) {
  try {
    const { id } = await params

    const deleted = menuItems.delete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    )
  }
}

