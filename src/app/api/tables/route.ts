import { NextResponse } from "next/server"
import { tables, cafes } from "@/lib/db/queries"
import { slugify } from "@/lib/utils/slug"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cafeId = searchParams.get("cafeId")

    if (!cafeId) {
      return NextResponse.json(
        { error: "Cafe ID is required" },
        { status: 400 }
      )
    }

    const tablesList = tables.getByCafeId(cafeId)
    return NextResponse.json(tablesList)
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cafeId, number, capacity, isActive } = body

    if (!cafeId || !number) {
      return NextResponse.json(
        { error: "Cafe ID and table number are required" },
        { status: 400 }
      )
    }

    // Get cafe to generate URL with cafe name
    const cafe = cafes.getById(cafeId)
    const cafeSlug = cafe ? slugify(cafe.name) : cafeId
    const tableId = `table-${Date.now()}`
    const qrCode = `/menu/${cafeSlug}/${tableId}`

    const newTable = tables.create({
      cafeId,
      number,
      capacity: capacity || 4,
      isActive: isActive !== undefined ? isActive : true,
      qrCode,
      status: "empty",
    })

    return NextResponse.json(newTable, { status: 201 })
  } catch (error) {
    console.error("Error creating table:", error)
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    )
  }
}

