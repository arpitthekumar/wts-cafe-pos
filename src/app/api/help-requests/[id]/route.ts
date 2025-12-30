import { NextResponse } from "next/server"
import { helpRequests } from "@/lib/db/queries"
import { HelpRequestStatus } from "@/lib/types"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, respondedBy } = body

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    const validStatuses: HelpRequestStatus[] = ["pending", "responded", "resolved"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const updated = helpRequests.update(id, { status, respondedBy })
    if (!updated) {
      return NextResponse.json(
        { error: "Help request not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating help request:", error)
    return NextResponse.json(
      { error: "Failed to update help request" },
      { status: 500 }
    )
  }
}

