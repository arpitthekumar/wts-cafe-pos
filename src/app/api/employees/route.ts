import { NextResponse } from "next/server"
import { employees } from "@/lib/db/queries"

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

    const employeesList = employees.getByCafeId(cafeId)
    return NextResponse.json(employeesList)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cafeId, name, email, salary, isActive } = body

    if (!cafeId || !name || !email) {
      return NextResponse.json(
        { error: "Cafe ID, name, and email are required" },
        { status: 400 }
      )
    }

    const newEmployee = employees.create({
      cafeId,
      name,
      email,
      role: "employee",
      salary: salary || null,
      isActive: isActive !== undefined ? isActive : true,
    })

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    )
  }
}



