import Link from "next/link"
import { NavigationMenuLink } from "@/components/ui/navigation-menu"

export function ListItem({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block rounded-md p-3 transition hover:bg-accent focus:bg-accent"
        >
          <div className="text-sm font-medium">{title}</div>
          <p className="text-sm text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
