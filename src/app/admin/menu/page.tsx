"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MenuItem, Category } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

export default function MenuManagementPage() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId || "cafe-1"
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

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
        setMenuItems(items)
      }
      if (catsRes.ok) {
        const cats = await catsRes.json()
        setCategories(cats)
      }
    } catch (error) {
      console.error("Error fetching menu:", error)
    }
  }

  async function saveMenuItem(item: Partial<MenuItem>) {
    try {
      const url = editingItem
        ? `/api/menu/${cafeId}/items/${editingItem.id}`
        : `/api/menu/${cafeId}/items`
      const method = editingItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, cafeId }),
      })

      if (response.ok) {
        fetchMenu()
        setShowAddItem(false)
        setEditingItem(null)
      }
    } catch (error) {
      console.error("Error saving menu item:", error)
    }
  }

  async function deleteMenuItem(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/menu/${cafeId}/items/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMenu()
      }
    } catch (error) {
      console.error("Error deleting menu item:", error)
    }
  }

  async function saveCategory(category: Partial<Category>) {
    try {
      const url = editingCategory
        ? `/api/menu/${cafeId}/categories/${editingCategory.id}`
        : `/api/menu/${cafeId}/categories`
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...category, cafeId }),
      })

      if (response.ok) {
        fetchMenu()
        setShowAddCategory(false)
        setEditingCategory(null)
      }
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Are you sure you want to delete this category? Items in this category will not be deleted.")) return

    try {
      const response = await fetch(`/api/menu/${cafeId}/categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMenu()
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Menu Management"
          subtitle="Manage your café menu items"
          role="admin"
        />

        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <Button onClick={() => setShowAddCategory(true)}>Add Category</Button>
          </div>
          <Button onClick={() => setShowAddItem(true)}>Add Menu Item</Button>
        </div>

        {/* Categories Section */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <h3 className="mb-4 text-lg font-semibold">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{category.icon || "📁"}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategory(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteCategory(category.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-medium">{category.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <div key={item.id} className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <span className="font-bold">${item.price.toFixed(2)}</span>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className={`text-xs ${item.available ? "text-green-600" : "text-red-600"}`}>
                  {item.available ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingItem(item)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMenuItem(item.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Item Modal */}
        {(showAddItem || editingItem) && (
          <MenuItemForm
            item={editingItem}
            categories={categories}
            onSave={saveMenuItem}
            onClose={() => {
              setShowAddItem(false)
              setEditingItem(null)
            }}
          />
        )}

        {/* Add/Edit Category Modal */}
        {(showAddCategory || editingCategory) && (
          <CategoryForm
            category={editingCategory}
            onSave={saveCategory}
            onClose={() => {
              setShowAddCategory(false)
              setEditingCategory(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

function CategoryForm({
  category,
  onSave,
  onClose,
}: {
  category: Category | null
  onSave: (category: Partial<Category>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    icon: category?.icon || "",
    order: category?.order || 0,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          {category ? "Edit Category" : "Add Category"}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="icon">Icon (Emoji)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="e.g., ☕"
            />
          </div>

          <div>
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex-1">
              Save
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MenuItemForm({
  item,
  categories,
  onSave,
  onClose,
}: {
  item: MenuItem | null
  categories: Category[]
  onSave: (item: Partial<MenuItem>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price || 0,
    category: item?.category || categories[0]?.id || "",
    available: item?.available ?? true,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          {item ? "Edit Menu Item" : "Add Menu Item"}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
            />
            <Label htmlFor="available">Available</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex-1">
              Save
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

