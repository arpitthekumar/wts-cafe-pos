import { NextResponse } from "next/server"
import { menuItems } from "@/lib/db/queries"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  try {
    const { cafeId } = await params
    const items = menuItems.getByCafeId(cafeId)
    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  try {
    const { cafeId } = await params
    const body = await request.json()

    const newItem = menuItems.create({
      ...body,
      cafeId,
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    )
  }
}
