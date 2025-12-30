import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { fakeUsers } from "@/lib/fake-users"
import { supabase } from "@/lib/supabase/client"

// Check if Supabase is configured
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== ""

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null

        // Use Supabase if configured, otherwise use fake users
        if (isSupabaseConfigured) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })

            if (error || !data.user) {
              // If Supabase fails, fallback to fake users
              console.warn("Supabase auth failed, falling back to fake users:", error?.message)
              const user = fakeUsers.find(
                (u) =>
                  u.email === credentials.email &&
                  u.password === credentials.password
              )

              if (!user) return null

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            }

            // Get user profile from Supabase
            const { data: profile } = await supabase
              .from("users")
              .select("id, name, email, role")
              .eq("id", data.user.id)
              .single()

            if (!profile) {
              // If profile not found, fallback to fake users
              const user = fakeUsers.find(
                (u) =>
                  u.email === credentials.email &&
                  u.password === credentials.password
              )

              if (!user) return null

              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            }

            return {
              id: profile.id,
              name: profile.name || data.user.email || "",
              email: profile.email || data.user.email || "",
              role: profile.role || "employee",
            }
          } catch (error) {
            console.error("Supabase auth error, falling back to fake users:", error)
            // Fallback to fake users on error
            const user = fakeUsers.find(
              (u) =>
                u.email === credentials.email &&
                u.password === credentials.password
            )

            if (!user) return null

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          }
        } else {
          // Fallback to fake users
          const user = fakeUsers.find(
            (u) =>
              u.email === credentials.email &&
              u.password === credentials.password
          )

          if (!user) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            cafeId: user.cafeId,
          }
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.cafeId = (user as any).cafeId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).cafeId = token.cafeId
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})

export { handler as GET, handler as POST }
