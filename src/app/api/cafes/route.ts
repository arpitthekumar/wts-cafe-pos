import { NextResponse } from "next/server"
import { cafes } from "@/lib/db/queries"

export async function GET() {
  try {
    const cafesList = cafes.getAll()
    return NextResponse.json(cafesList)
  } catch (error) {
    console.error("Error fetching cafes:", error)
    return NextResponse.json(
      { error: "Failed to fetch cafes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address, phone, email, isActive, adminId } = body

    if (!name || !address) {
      return NextResponse.json(
        { error: "Name and address are required" },
        { status: 400 }
      )
    }

    const newCafe = cafes.create({
      name,
      address,
      phone: phone || null,
      email: email || null,
      isActive: isActive !== undefined ? isActive : true,
      adminId: adminId || null,
    })

    return NextResponse.json(newCafe, { status: 201 })
  } catch (error) {
    console.error("Error creating café:", error)
    return NextResponse.json(
      { error: "Failed to create café" },
      { status: 500 }
    )
  }
}

