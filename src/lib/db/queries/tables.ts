import db from "../client"
import type { Table } from "../../types"

const toBool = (val: number | null | undefined): boolean => val === 1

export const tables = {
  getByCafeId: (cafeId: string): Table[] => {
    const results = db.prepare("SELECT * FROM tables WHERE cafeId = ? AND isActive = 1 ORDER BY number").all(cafeId) as any[]
    return results.map(r => ({ 
      ...r, 
      isActive: toBool(r.isActive),
      status: r.status || "empty"
    }))
  },

  getById: (id: string): Table | undefined => {
    const result = db.prepare("SELECT * FROM tables WHERE id = ?").get(id) as any
    if (!result) return undefined
    return { 
      ...result, 
      isActive: toBool(result.isActive),
      status: result.status || "empty"
    }
  },

  create: (table: Omit<Table, "id" | "createdAt">): Table => {
    const id = `table-${Date.now()}`
    const now = new Date().toISOString()
    // QR code should be provided by the caller (API route) with cafe name
    const qrCode = table.qrCode || `/menu/${table.cafeId}/${id}`
    
    db.prepare(`
      INSERT INTO tables (id, cafeId, number, qrCode, isActive, capacity, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      table.cafeId,
      table.number,
      qrCode,
      table.isActive ? 1 : 0,
      table.capacity || null,
      table.status || "empty",
      now
    )
    return tables.getById(id)!
  },

  update: (id: string, updates: Partial<Table>): Table | null => {
    const table = tables.getById(id)
    if (!table) return null

    db.prepare(`
      UPDATE tables 
      SET number = ?, qrCode = ?, isActive = ?, capacity = ?, status = ?
      WHERE id = ?
    `).run(
      updates.number ?? table.number,
      updates.qrCode ?? table.qrCode,
      updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : (table.isActive ? 1 : 0),
      updates.capacity ?? table.capacity,
      updates.status ?? table.status ?? "empty",
      id
    )
    return tables.getById(id)!
  },

  delete: (id: string): boolean => {
    const result = db.prepare("DELETE FROM tables WHERE id = ?").run(id)
    return result.changes > 0
  },
}

