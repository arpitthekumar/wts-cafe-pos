"use client"

import { Category } from "@/lib/types"

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-2.5 pb-2">
      <button
        onClick={() => onSelectCategory("all")}
        className={`rounded-chip px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
          selectedCategory === "all"
            ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]"
            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 border border-zinc-200/30 dark:border-zinc-800/30 hover:scale-103 active:scale-95"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`rounded-chip px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === category.id
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.02]"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 border border-zinc-200/30 dark:border-zinc-800/30 hover:scale-103 active:scale-95"
          }`}
        >
          {category.icon && <span className="text-base">{category.icon}</span>}
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  )
}
