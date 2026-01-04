import db from "../client"
import type { Cafe } from "../../types"
import { slugify } from "../../utils/slug"

// Helper to convert SQLite boolean (0/1) to boolean
const toBool = (val: number | null | undefined): boolean => val === 1

export const cafes = {
  getAll: (): Cafe[] => {
    const results = db.prepare("SELECT * FROM cafes ORDER BY createdAt DESC").all() as any[]
    return results.map(r => ({ ...r, isActive: toBool(r.isActive) }))
  },

  getById: (id: string): Cafe | undefined => {
    const result = db.prepare("SELECT * FROM cafes WHERE id = ?").get(id) as any
    if (!result) return undefined
    return { ...result, isActive: toBool(result.isActive) }
  },

  getByName: (name: string): Cafe | undefined => {
    const result = db.prepare("SELECT * FROM cafes WHERE name = ?").get(name) as any
    if (!result) return undefined
    return { ...result, isActive: toBool(result.isActive) }
  },

  getBySlug: (slug: string): Cafe | undefined => {
    // Get all cafes and find by matching slug
    const allCafes = cafes.getAll()
    const cafe = allCafes.find(c => slugify(c.name) === slug.toLowerCase())
    return cafe
  },

  create: (cafe: Omit<Cafe, "id" | "createdAt" | "updatedAt">): Cafe => {
    const id = `cafe-${Date.now()}`
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO cafes (id, name, address, phone, email, isActive, currency, createdAt, updatedAt, adminId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, cafe.name, cafe.address, cafe.phone || null, cafe.email || null, cafe.isActive ? 1 : 0, cafe.currency || "USD", now, now, cafe.adminId || null)
    return cafes.getById(id)!
  },

  update: (id: string, updates: Partial<Cafe>): Cafe | null => {
    const cafe = cafes.getById(id)
    if (!cafe) return null

    const now = new Date().toISOString()
    db.prepare(`
      UPDATE cafes 
      SET name = ?, address = ?, phone = ?, email = ?, isActive = ?, currency = ?, updatedAt = ?, adminId = ?
      WHERE id = ?
    `).run(
      updates.name ?? cafe.name,
      updates.address ?? cafe.address,
      updates.phone ?? cafe.phone,
      updates.email ?? cafe.email,
      updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : (cafe.isActive ? 1 : 0),
      updates.currency ?? cafe.currency ?? "USD",
      now,
      updates.adminId ?? cafe.adminId,
      id
    )
    return cafes.getById(id)!
  },

  delete: (id: string): boolean => {
    const result = db.prepare("DELETE FROM cafes WHERE id = ?").run(id)
    return result.changes > 0
  },
}

