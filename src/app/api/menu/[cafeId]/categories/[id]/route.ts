import { NextResponse } from "next/server"
import { categories } from "@/lib/db/queries"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ cafeId: string; id: string }> }
) {
  try {
    const { cafeId, id } = await params
    const body = await request.json()

    const updated = categories.update(id, { ...body, cafeId })
    if (!updated) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
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

    const deleted = categories.delete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}

