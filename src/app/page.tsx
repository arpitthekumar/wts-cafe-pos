import { Button } from "@/components/ui"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold">WTS Café POS</h1>
        <p className="text-muted-foreground">Self-ordering café management system</p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/menu/wts-downtown-cafe/table-1">
          <Button size="lg" className="w-full sm:w-auto">
            View Menu & Order (Table 1)
          </Button>
        </Link>
      <Link href="/login">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Staff Login
          </Button>
      </Link>
      </div>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Test Accounts:</p>
        <p>Super Admin: superadmin@wts.com / super123</p>
        <p>Admin: admin@wts.com / admin123</p>
        <p>Employee: staff@wts.com / staff123</p>
      </div>
    </main>
  )
}
