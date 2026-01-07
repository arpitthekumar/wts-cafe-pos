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
   <div className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
      
      {/* TOP ROW */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex gap-4">
          {/* ICON / IMAGE PLACEHOLDER */}
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">
            🍽️
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 leading-snug">
              {item.description}
            </p>
          </div>
        </div>

        {/* PRICE */}
        <span className="text-orange-500 text-lg font-bold whitespace-nowrap">
          {formatCurrency(item.price, currency)}
        </span>
      </div>

      {/* ADD TO CART BUTTON */}
      <Button
        onClick={onAddToCart}
        disabled={!item.available}
        className="
          w-full rounded-xl py-3 font-bold text-sm
          transition-all duration-200
          hover:scale-[1.02]
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {item.available ? "Add to Cart" : "Unavailable"}
      </Button>
    </div>
  )
}




