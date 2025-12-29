import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Link href="/login">
        <Button size="lg">Login</Button>
      </Link>
    </main>
  )
}
