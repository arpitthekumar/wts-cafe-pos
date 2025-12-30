import { NextResponse } from "next/server"
import { cafes } from "@/lib/db/queries"
import { slugify } from "@/lib/utils/slug"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const decodedName = decodeURIComponent(name)
    
    // Try to get by slug first
    let cafe = cafes.getBySlug(decodedName)
    
    // If not found, try exact name match
    if (!cafe) {
      cafe = cafes.getByName(decodedName)
    }
    
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



