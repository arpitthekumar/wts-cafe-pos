import db from "../client"
import type { TableSession } from "../../types"

const toBool = (val: number | null | undefined): boolean => val === 1

export const tableSessions = {
  getAll: (): TableSession[] => {
    const results = db.prepare("SELECT * FROM table_sessions ORDER BY startedAt DESC").all() as any[]
    return results.map(r => ({
      ...r,
      isActive: toBool(r.isActive),
    }))
  },

  getByCafeId: (cafeId: string): TableSession[] => {
    const results = db.prepare("SELECT * FROM table_sessions WHERE cafeId = ? ORDER BY startedAt DESC").all(cafeId) as any[]
    return results.map(r => ({
      ...r,
      isActive: toBool(r.isActive),
    }))
  },

  getByTableId: (tableId: string): TableSession | undefined => {
    const result = db.prepare(
      "SELECT * FROM table_sessions WHERE tableId = ? AND isActive = 1 ORDER BY startedAt DESC LIMIT 1"
    ).get(tableId) as any
    if (!result) return undefined
    return {
      ...result,
      isActive: toBool(result.isActive),
    }
  },

  getActiveByTableId: (tableId: string): TableSession | undefined => {
    return tableSessions.getByTableId(tableId)
  },

  getByCustomerEmail: (email: string, cafeId?: string): TableSession[] => {
    let query = "SELECT * FROM table_sessions WHERE customerEmail = ?"
    const params: any[] = [email]
    
    if (cafeId) {
      query += " AND cafeId = ?"
      params.push(cafeId)
    }
    
    query += " ORDER BY startedAt DESC"
    const results = db.prepare(query).all(...params) as any[]
    return results.map(r => ({
      ...r,
      isActive: toBool(r.isActive),
    }))
  },

  create: (session: Omit<TableSession, "id" | "startedAt">): TableSession => {
    const id = `session-${Date.now()}`
    const now = new Date().toISOString()
    
    // End any existing active session for this table
    db.prepare("UPDATE table_sessions SET isActive = 0, endedAt = ? WHERE tableId = ? AND isActive = 1").run(now, session.tableId)
    
    db.prepare(`
      INSERT INTO table_sessions (id, cafeId, tableId, tableNumber, customerName, customerEmail, startedAt, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      session.cafeId,
      session.tableId,
      session.tableNumber,
      session.customerName,
      session.customerEmail,
      now,
      1
    )
    
    return tableSessions.getByTableId(session.tableId)!
  },

  endSession: (tableId: string): boolean => {
    const now = new Date().toISOString()
    const result = db.prepare(
      "UPDATE table_sessions SET isActive = 0, endedAt = ? WHERE tableId = ? AND isActive = 1"
    ).run(now, tableId)
    return result.changes > 0
  },

  endSessionById: (sessionId: string): boolean => {
    const now = new Date().toISOString()
    const result = db.prepare(
      "UPDATE table_sessions SET isActive = 0, endedAt = ? WHERE id = ?"
    ).run(now, sessionId)
    return result.changes > 0
  },
}

