import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-in-production"
  })
  const role = token?.role as string | undefined

  // Public routes - no authentication required
  const publicRoutes = ["/", "/login", "/register"]
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next()
  }

  // Menu routes are public (customer access)
  if (pathname.startsWith("/menu/")) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (pathname.startsWith("/super-admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), req.url))
    }
    if (role !== "super-admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), req.url))
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (pathname.startsWith("/employee")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), req.url))
    }
    if (role !== "employee") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(pathname), req.url))
    }
    // Dashboard redirects based on role - handled in the page component
  }

  return NextResponse.next()
}

// Configure which routes should be checked
export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/employee/:path*",
    "/dashboard/:path*",
  ],
}
