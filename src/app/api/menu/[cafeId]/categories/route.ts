import { NextResponse } from "next/server"
import { categories } from "@/lib/db/queries"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ cafeId: string }> }
) {
  try {
    const { cafeId } = await params
    const cats = categories.getByCafeId(cafeId)
    return NextResponse.json(cats)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const { name, icon, order } = body

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      )
    }

    const newCategory = categories.create({
      cafeId,
      name,
      icon: icon || null,
      order: order || 0,
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}

