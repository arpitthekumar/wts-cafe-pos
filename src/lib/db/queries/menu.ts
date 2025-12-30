import db from "../client"
import type { MenuItem, Category } from "../../types"

const toBool = (val: number | null | undefined): boolean => val === 1

export const categories = {
  getByCafeId: (cafeId: string): Category[] => {
    return db.prepare('SELECT * FROM categories WHERE cafeId = ? ORDER BY "order"').all(cafeId) as Category[]
  },

  getById: (id: string): Category | undefined => {
    return db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined
  },
}

export const menuItems = {
  getByCafeId: (cafeId: string): MenuItem[] => {
    const results = db.prepare("SELECT * FROM menu_items WHERE cafeId = ? ORDER BY category, name").all(cafeId) as any[]
    return results.map(r => ({ ...r, available: toBool(r.available) }))
  },

  getById: (id: string): MenuItem | undefined => {
    const result = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(id) as any
    if (!result) return undefined
    return { ...result, available: toBool(result.available) }
  },

  create: (item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">): MenuItem => {
    const id = `item-${Date.now()}`
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO menu_items (id, cafeId, name, description, price, category, image, available, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      item.cafeId,
      item.name,
      item.description,
      item.price,
      item.category,
      item.image || null,
      item.available ? 1 : 0,
      now,
      now
    )
    return menuItems.getById(id)!
  },

  update: (id: string, updates: Partial<MenuItem>): MenuItem | null => {
    const item = menuItems.getById(id)
    if (!item) return null

    const now = new Date().toISOString()
    db.prepare(`
      UPDATE menu_items 
      SET name = ?, description = ?, price = ?, category = ?, image = ?, available = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      updates.name ?? item.name,
      updates.description ?? item.description,
      updates.price ?? item.price,
      updates.category ?? item.category,
      updates.image ?? item.image,
      updates.available !== undefined ? (updates.available ? 1 : 0) : (item.available ? 1 : 0),
      now,
      id
    )
    return menuItems.getById(id)!
  },

  delete: (id: string): boolean => {
    const result = db.prepare("DELETE FROM menu_items WHERE id = ?").run(id)
    return result.changes > 0
  },
}



