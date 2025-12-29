"use client"

import Link from "next/link"
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { ListItem } from "@/components/ui/ListItem"
import { ThemeToggle } from "./theme-toggle"

export default function Navbar() {
    return (
        <nav className="w-full border-b bg-background">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="text-lg font-bold">
                    WTS
                </Link>

                {/* Menu */}
                <NavigationMenu>
                    <NavigationMenuList>
                        {/* Simple Link */}
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="/about"
                                    className="px-4 py-2 text-sm font-medium"
                                >
                                    About
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        {/* Dropdown */}
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                Services
                            </NavigationMenuTrigger>

                            <NavigationMenuContent>
                                <ul className="grid w-100 gap-2 p-3 md:grid-cols-2">
                                    <ListItem
                                        title="Web Development"
                                        href="/services/web"
                                    >
                                        Next.js, Tailwind, scalable apps
                                    </ListItem>

                                    <ListItem
                                        title="SEO"
                                        href="/services/seo"
                                    >
                                        On-page, technical & growth SEO
                                    </ListItem>

                                    <ListItem
                                        title="CRM Systems"
                                        href="/services/crm"
                                    >
                                        Custom dashboards & workflows
                                    </ListItem>

                                    <ListItem
                                        title="POS Systems"
                                        href="/services/pos"
                                    >
                                        Cafe & retail billing software
                                    </ListItem>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {/* Another link */}
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link
                                    href="/contact"
                                    className="px-4 py-2 text-sm font-medium"
                                >
                                    Contact
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <ThemeToggle />
            </div>
        </nav>
    )
}
