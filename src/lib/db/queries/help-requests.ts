import db from "../client"
import type { HelpRequest } from "../../types"

export const helpRequests = {
  getByCafeId: (cafeId: string): HelpRequest[] => {
    return db.prepare("SELECT * FROM help_requests WHERE cafeId = ? ORDER BY createdAt DESC").all(cafeId) as HelpRequest[]
  },

  getPending: (cafeId: string): HelpRequest[] => {
    return db.prepare("SELECT * FROM help_requests WHERE cafeId = ? AND status = 'pending' ORDER BY createdAt DESC").all(cafeId) as HelpRequest[]
  },

  create: (request: Omit<HelpRequest, "id" | "createdAt">): HelpRequest => {
    const id = `help-${Date.now()}`
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO help_requests (id, cafeId, tableId, tableNumber, status, message, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      request.cafeId,
      request.tableId,
      request.tableNumber,
      request.status,
      request.message || null,
      now
    )
    return db.prepare("SELECT * FROM help_requests WHERE id = ?").get(id) as HelpRequest
  },

  update: (id: string, updates: Partial<HelpRequest>): HelpRequest | null => {
    const request = db.prepare("SELECT * FROM help_requests WHERE id = ?").get(id) as HelpRequest | undefined
    if (!request) return null

    const now = new Date().toISOString()
    db.prepare(`
      UPDATE help_requests 
      SET status = ?, message = ?, respondedAt = ?, respondedBy = ?
      WHERE id = ?
    `).run(
      updates.status ?? request.status,
      updates.message ?? request.message,
      updates.status === "responded" || updates.status === "resolved" ? now : request.respondedAt,
      updates.respondedBy ?? request.respondedBy,
      id
    )
    return db.prepare("SELECT * FROM help_requests WHERE id = ?").get(id) as HelpRequest
  },

  delete: (id: string): boolean => {
    const result = db.prepare("DELETE FROM help_requests WHERE id = ?").run(id)
    return result.changes > 0
  },
}




