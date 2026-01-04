import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { fakeUsers } from "@/lib/fake-users"

// Check if Supabase is configured
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ""

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Use Supabase if configured, otherwise use fake users
    if (isSupabaseConfigured) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("email")
          .eq("email", email)
          .single()

        if (existingUser) {
          return NextResponse.json(
            { error: "User with this email already exists" },
            { status: 400 }
          )
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) {
          return NextResponse.json(
            { error: authError.message },
            { status: 400 }
          )
        }

        if (!authData.user) {
          return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
          )
        }

        // Create user profile in users table
        const { error: profileError } = await supabase
          .from("users")
          .insert({
            id: authData.user.id,
            name,
            email,
            role: "employee", // Default role
          } as any)

        if (profileError) {
          // If profile creation fails, try to delete the auth user
          await supabase.auth.admin.deleteUser(authData.user.id)
          return NextResponse.json(
            { error: "Failed to create user profile" },
            { status: 500 }
          )
        }

        return NextResponse.json(
          { message: "User created successfully" },
          { status: 201 }
        )
      } catch (error) {
        console.error("Supabase registration error:", error)
        return NextResponse.json(
          { error: "Registration failed. Please try again." },
          { status: 500 }
        )
      }
    } else {
      // Fallback to fake users (for development/testing)
      // Check if user already exists
      const existingUser = fakeUsers.find((u) => u.email === email)
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }

      // Fake registration - user data stored in memory only
      // In production, this would be stored in database
      return NextResponse.json(
        { 
          message: "User created successfully (using fake auth)",
          note: "This is a fake registration. Add Supabase credentials to enable real registration."
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

