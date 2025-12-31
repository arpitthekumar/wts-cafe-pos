import { NextResponse } from "next/server"
import { tables, cafes } from "@/lib/db/queries"
import { slugify } from "@/lib/utils/slug"

export async function POST() {
  try {
    // Get all cafes
    const allCafes = cafes.getAll()
    let updatedCount = 0

    for (const cafe of allCafes) {
      const cafeTables = tables.getByCafeId(cafe.id)
      const cafeSlug = slugify(cafe.name)

      for (const table of cafeTables) {
        // Always update QR code to use cafe name slug
        const newQrCode = `/menu/${cafeSlug}/${table.id}`
        // Update regardless of current format to ensure consistency
        tables.update(table.id, { qrCode: newQrCode })
        updatedCount++
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} table QR codes`,
      updatedCount
    })
  } catch (error) {
    console.error("Error updating QR codes:", error)
    return NextResponse.json(
      { error: "Failed to update QR codes" },
      { status: 500 }
    )
  }
}



