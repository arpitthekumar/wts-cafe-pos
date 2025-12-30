import Link from "next/link"
import { Button } from "@/components/ui"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-7xl font-bold text-primary">404</h1>

      <p className="mt-4 text-xl font-semibold">
        Page not found
      </p>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>

      <div className="mt-6 flex gap-4">
        <Link href="/">
          <Button>Go Home</Button>
        </Link>

        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      </div>
    </main>
  )
}
