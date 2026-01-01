import db from "../client"
import type { Order, OrderItem } from "../../types"

export const orderItems = {
  getByOrderId: (orderId: string): OrderItem[] => {
    return db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(orderId) as OrderItem[]
  },

  getById: (id: string): OrderItem | undefined => {
    return db.prepare("SELECT * FROM order_items WHERE id = ?").get(id) as OrderItem | undefined
  },

  create: (orderId: string, item: Omit<OrderItem, "id">): OrderItem => {
    const id = `oi-${Date.now()}`
    db.prepare(`
      INSERT INTO order_items (id, orderId, menuItemId, menuItemName, quantity, price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      orderId,
      item.menuItemId,
      item.menuItemName,
      item.quantity,
      item.price,
      item.notes || null
    )
    return db.prepare("SELECT * FROM order_items WHERE id = ?").get(id) as OrderItem
  },

  delete: (id: string): boolean => {
    const result = db.prepare("DELETE FROM order_items WHERE id = ?").run(id)
    return result.changes > 0
  },
}

export const orders = {
  getAll: (): Order[] => {
    const ordersList = db.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all() as Order[]
    return ordersList.map(order => ({
      ...order,
      items: orderItems.getByOrderId(order.id),
    }))
  },

  getByCafeId: (cafeId: string): Order[] => {
    const ordersList = db.prepare("SELECT * FROM orders WHERE cafeId = ? ORDER BY createdAt DESC").all(cafeId) as Order[]
    return ordersList.map(order => ({
      ...order,
      items: orderItems.getByOrderId(order.id),
    }))
  },

  getByTableId: (tableId: string): Order[] => {
    const ordersList = db.prepare("SELECT * FROM orders WHERE tableId = ? ORDER BY createdAt DESC").all(tableId) as Order[]
    return ordersList.map(order => ({
      ...order,
      items: orderItems.getByOrderId(order.id),
    }))
  },

  getById: (id: string): Order | undefined => {
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order | undefined
    if (!order) return undefined
    return {
      ...order,
      items: orderItems.getByOrderId(id),
    }
  },

  create: (order: Omit<Order, "id" | "createdAt" | "updatedAt">): Order => {
    const id = `order-${Date.now()}`
    const now = new Date().toISOString()
    
    db.prepare(`
      INSERT INTO orders (id, cafeId, tableId, tableNumber, status, total, customerName, customerEmail, notes, paymentMethod, paidAt, billNumber, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      order.cafeId,
      order.tableId,
      order.tableNumber,
      order.status,
      order.total,
      order.customerName || null,
      order.customerEmail || null,
      order.notes || null,
      order.paymentMethod || null,
      order.paidAt || null,
      order.billNumber || null,
      now,
      now
    )

    // Insert order items
    order.items.forEach((item) => {
      orderItems.create(id, item)
    })

    return orders.getById(id)!
  },

  update: (id: string, updates: Partial<Order>): Order | null => {
    const order = orders.getById(id)
    if (!order) return null

    const now = new Date().toISOString()
    db.prepare(`
      UPDATE orders 
      SET status = ?, total = ?, customerName = ?, customerEmail = ?, notes = ?, paymentMethod = ?, paidAt = ?, billNumber = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      updates.status ?? order.status,
      updates.total ?? order.total,
      updates.customerName ?? order.customerName ?? null,
      updates.customerEmail ?? order.customerEmail ?? null,
      updates.notes ?? order.notes ?? null,
      updates.paymentMethod ?? order.paymentMethod ?? null,
      updates.paidAt ?? order.paidAt ?? null,
      updates.billNumber ?? order.billNumber ?? null,
      now,
      id
    )
    return orders.getById(id)!
  },

  delete: (id: string): boolean => {
    const result = db.prepare("DELETE FROM orders WHERE id = ?").run(id)
    return result.changes > 0
  },
}

