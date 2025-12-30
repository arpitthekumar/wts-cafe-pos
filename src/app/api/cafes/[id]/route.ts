import { NextResponse } from "next/server"
import { cafes } from "@/lib/db/queries"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cafe = cafes.getById(id)
    
    if (!cafe) {
      return NextResponse.json(
        { error: "Café not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(cafe)
  } catch (error) {
    console.error("Error fetching café:", error)
    return NextResponse.json(
      { error: "Failed to fetch café" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updated = cafes.update(id, body)
    if (!updated) {
      return NextResponse.json(
        { error: "Café not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating café:", error)
    return NextResponse.json(
      { error: "Failed to update café" },
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
    
    const deleted = cafes.delete(id)
    if (!deleted) {
      return NextResponse.json(
        { error: "Café not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting café:", error)
    return NextResponse.json(
      { error: "Failed to delete café" },
      { status: 500 }
    )
  }
}



