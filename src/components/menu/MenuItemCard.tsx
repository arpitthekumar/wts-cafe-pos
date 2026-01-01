"use client"

import { MenuItem, Currency } from "@/lib/types"
import { Button } from "@/components/ui"
import { formatCurrency } from "@/lib/utils/currency"

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: () => void
  currency?: Currency
}

export function MenuItemCard({ item, onAddToCart, currency = "USD" }: MenuItemCardProps) {
  return (
    <div className="group rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        </div>
        <span className="ml-4 text-lg font-bold">{formatCurrency(item.price, currency)}</span>
      </div>
      <Button
        onClick={onAddToCart}
        className="w-full"
        disabled={!item.available}
      >
        {item.available ? "Add to Cart" : "Unavailable"}
      </Button>
    </div>
  )
}




