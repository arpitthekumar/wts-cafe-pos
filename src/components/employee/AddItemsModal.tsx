"use client"

import { useState, useEffect } from "react"
import { MenuItem, Category, OrderItem } from "@/lib/types"
import { Button, Input } from "@/components/ui"

interface AddItemsModalProps {
  orderId: string
  cafeId: string
  onClose: () => void
  onAddItems: (items: OrderItem[]) => void
}

export function AddItemsModal({ orderId, cafeId, onClose, onAddItems }: AddItemsModalProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedItems, setSelectedItems] = useState<Map<string, { item: MenuItem; quantity: number; notes: string }>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMenu()
  }, [cafeId])

  async function fetchMenu() {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch(`/api/menu/${cafeId}/items`),
        fetch(`/api/menu/${cafeId}/categories`),
      ])
      if (itemsRes.ok) {
        const items = await itemsRes.json()
        setMenuItems(items.filter((item: MenuItem) => item.available))
      }
      if (catsRes.ok) {
        const cats = await catsRes.json()
        setCategories(cats)
      }
    } catch (error) {
      console.error("Error fetching menu:", error)
    } finally {
      setLoading(false)
    }
  }

  function addToSelection(item: MenuItem) {
    const existing = selectedItems.get(item.id)
    if (existing) {
      setSelectedItems(new Map(selectedItems.set(item.id, {
        ...existing,
        quantity: existing.quantity + 1,
      })))
    } else {
      setSelectedItems(new Map(selectedItems.set(item.id, {
        item,
        quantity: 1,
        notes: "",
      })))
    }
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      const newMap = new Map(selectedItems)
      newMap.delete(itemId)
      setSelectedItems(newMap)
      return
    }
    const existing = selectedItems.get(itemId)
    if (existing) {
      setSelectedItems(new Map(selectedItems.set(itemId, {
        ...existing,
        quantity,
      })))
    }
  }

  function updateNotes(itemId: string, notes: string) {
    const existing = selectedItems.get(itemId)
    if (existing) {
      setSelectedItems(new Map(selectedItems.set(itemId, {
        ...existing,
        notes,
      })))
    }
  }

  function handleAddItems() {
    const items: OrderItem[] = Array.from(selectedItems.values()).map(({ item, quantity, notes }) => ({
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      menuItemName: item.name,
      quantity,
      price: item.price,
      notes: notes || undefined,
    }))
    onAddItems(items)
    onClose()
  }

  const filteredItems = selectedCategory === "all"
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory)

  const total = Array.from(selectedItems.values()).reduce(
    (sum, { item, quantity }) => sum + item.price * quantity,
    0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center hover:scale-105 bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-lg border bg-background shadow-lg flex flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Add Items to Order</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Menu Side */}
          <div className="flex-1 overflow-y-auto p-4 border-r">
            {/* Category Filter */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Menu Items */}
            {loading ? (
              <p className="text-center text-muted-foreground">Loading menu...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredItems.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-card p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="ml-2 text-right">
                        <p className="font-bold">${item.price.toFixed(2)}</p>
                        {selectedItems.has(item.id) && (
                          <p className="text-xs text-muted-foreground">
                            {selectedItems.get(item.id)!.quantity}x selected
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => addToSelection(item)}
                    >
                      + Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Items Side */}
          <div className="w-80 overflow-y-auto p-4 bg-muted/50">
            <h3 className="mb-4 font-semibold">Selected Items</h3>
            {selectedItems.size === 0 ? (
              <p className="text-sm text-muted-foreground">No items selected</p>
            ) : (
              <div className="space-y-3">
                {Array.from(selectedItems.values()).map(({ item, quantity, notes }) => (
                  <div key={item.id} className="rounded-lg border bg-background p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm font-bold">${(item.price * quantity).toFixed(2)}</span>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="flex-1 text-center font-medium">{quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Input
                      placeholder="Notes (optional)"
                      value={notes}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
                <div className="border-t pt-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleAddItems}
                  >
                    Add to Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



