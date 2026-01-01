import db from "../client"
import type { Employee } from "../../types"

const toBool = (val: number | null | undefined): boolean => val === 1

export const employees = {
  getByCafeId: (cafeId: string): Employee[] => {
    const results = db.prepare("SELECT * FROM employees WHERE cafeId = ? AND isActive = 1 ORDER BY createdAt DESC").all(cafeId) as any[]
    return results.map(r => ({ ...r, isActive: toBool(r.isActive) }))
  },

  getById: (id: string): Employee | undefined => {
    const result = db.prepare("SELECT * FROM employees WHERE id = ?").get(id) as any
    if (!result) return undefined
    return { ...result, isActive: toBool(result.isActive) }
  },

  create: (employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): Employee => {
    const id = `emp-${Date.now()}`
    const now = new Date().toISOString()
    db.prepare(`
      INSERT INTO employees (id, cafeId, name, email, role, salary, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      employee.cafeId,
      employee.name,
      employee.email,
      employee.role,
      employee.salary || null,
      employee.isActive ? 1 : 0,
      now,
      now
    )
    return employees.getById(id)!
  },

  update: (id: string, updates: Partial<Employee>): Employee | null => {
    const employee = employees.getById(id)
    if (!employee) return null

    const now = new Date().toISOString()
    db.prepare(`
      UPDATE employees 
      SET name = ?, email = ?, role = ?, salary = ?, isActive = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      updates.name ?? employee.name,
      updates.email ?? employee.email,
      updates.role ?? employee.role,
      updates.salary ?? employee.salary,
      updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : (employee.isActive ? 1 : 0),
      now,
      id
    )
    return employees.getById(id)!
  },

  delete: (id: string): boolean => {
    const result = db.prepare("DELETE FROM employees WHERE id = ?").run(id)
    return result.changes > 0
  },
}




