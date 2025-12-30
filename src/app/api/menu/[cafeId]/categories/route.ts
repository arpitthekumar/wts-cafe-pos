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

