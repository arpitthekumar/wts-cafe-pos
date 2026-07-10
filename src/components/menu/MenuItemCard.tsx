"use client"

import { MenuItem, Currency } from "@/lib/types"
import { formatCurrency } from "@/lib/utils/currency"
import { Star, Plus } from "lucide-react"

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: () => void
  currency?: Currency
}

function getFoodImage(item: MenuItem): string {
  const name = item.name.toLowerCase()
  const cat = item.category.toLowerCase()
  
  if (name.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80"
  }
  if (name.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80"
  }
  if (name.includes("cappuccino") || name.includes("coffee") || name.includes("espresso") || name.includes("latte") || cat === "cat-1") {
    return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=80"
  }
  if (name.includes("smoothie") || name.includes("lemonade") || name.includes("drink") || cat === "cat-2") {
    return "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=80"
  }
  if (name.includes("cheesecake") || name.includes("brownie") || name.includes("cake") || name.includes("ice cream") || cat === "cat-4") {
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80"
  }
  if (name.includes("salad") || name.includes("pasta") || name.includes("sandwich") || cat === "cat-3") {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"
  }
  return "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=80"
}

function getItemRating(name: string): string {
  const scores = ["4.8", "4.9", "4.7", "4.6", "4.9"]
  const index = name.length % scores.length
  return scores[index]
}

function isVegItem(name: string): boolean {
  const nonVegKeywords = [
    "chicken", "egg", "meat", "mutton", "fish", "pork", "beef", "burger", 
    "prawn", "crab", "bacon", "sausage", "salami", "ham", "pepperoni", 
    "kabab", "kebab", "wings", "tikka"
  ]
  const lowerName = name.toLowerCase()
  return !nonVegKeywords.some(keyword => lowerName.includes(keyword))
}

export function MenuItemCard({ item, onAddToCart, currency = "USD" }: MenuItemCardProps) {
  const imageUrl = item.image || getFoodImage(item)
  const rating = getItemRating(item.name)
  const veg = isVegItem(item.name)

  return (
    <div className="group bg-card border border-border/60 rounded-[20px] p-4 shadow-md hover:shadow-xl hover:scale-103 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Product Image Header */}
        <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted mb-4">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[1deg]"
          />
          {/* Rating Badge */}
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-foreground">{rating}</span>
          </div>
          
          {/* Veg / Non-Veg badge on image */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-lg flex items-center justify-center shadow-sm">
            <div className={`w-4.5 h-4.5 border rounded flex items-center justify-center ${veg ? 'border-green-600' : 'border-red-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${veg ? 'bg-green-600' : 'bg-red-600'}`} />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-4">
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className="font-headline text-base font-bold text-foreground group-hover:text-orange-500 transition-colors leading-snug line-clamp-1">
              {item.name}
            </h3>
            <span className="text-orange-500 dark:text-orange-400 font-headline text-base font-extrabold whitespace-nowrap">
              {formatCurrency(item.price, currency)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onAddToCart}
        disabled={!item.available}
        className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-chip transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>{item.available ? "Add to Basket" : "Unavailable"}</span>
      </button>
    </div>
  )
}
