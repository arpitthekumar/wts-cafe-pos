import Database from "better-sqlite3"
import { createTables } from "./schema"
import { slugify } from "../utils/slug"
import path from "path"
import fs from "fs"

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, "cafe-pos.db")
const db = new Database(dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

// Create tables
createTables(db)

// Run migrations
function runMigrations(db: any) {
  try {
    // Check if status column exists in tables table
    const tablesInfo = db.prepare("PRAGMA table_info(tables)").all() as Array<{ name: string }>
    const hasStatusColumn = tablesInfo.some((col: { name: string }) => col.name === "status")
    
    if (!hasStatusColumn) {
      console.log("Adding status column to tables table...")
      db.prepare("ALTER TABLE tables ADD COLUMN status TEXT DEFAULT 'empty'").run()
      // Update existing rows to have 'empty' status
      db.prepare("UPDATE tables SET status = 'empty' WHERE status IS NULL").run()
    }

    // Check if customerEmail and payment columns exist in orders table
    const ordersInfo = db.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>
    const hasCustomerEmailColumn = ordersInfo.some((col: { name: string }) => col.name === "customerEmail")
    const hasPaymentMethod = ordersInfo.some((col: { name: string }) => col.name === "paymentMethod")
    const hasPaidAt = ordersInfo.some((col: { name: string }) => col.name === "paidAt")
    const hasBillNumber = ordersInfo.some((col: { name: string }) => col.name === "billNumber")
    
    if (!hasCustomerEmailColumn) {
      console.log("Adding customerEmail column to orders table...")
      db.prepare("ALTER TABLE orders ADD COLUMN customerEmail TEXT").run()
    }

    // Check if table_sessions table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='table_sessions'
    `).get()
    
    if (!tableExists) {
      console.log("Creating table_sessions table...")
      db.exec(`
        CREATE TABLE IF NOT EXISTS table_sessions (
          id TEXT PRIMARY KEY,
          cafeId TEXT NOT NULL,
          tableId TEXT NOT NULL,
          tableNumber INTEGER NOT NULL,
          customerName TEXT NOT NULL,
          customerEmail TEXT NOT NULL,
          startedAt TEXT NOT NULL,
          endedAt TEXT,
          isActive INTEGER DEFAULT 1,
          FOREIGN KEY (cafeId) REFERENCES cafes(id),
          FOREIGN KEY (tableId) REFERENCES tables(id)
        )
      `)
    }

    // Check if currency column exists in cafes table
    const cafesInfo = db.prepare("PRAGMA table_info(cafes)").all() as Array<{ name: string }>
    const hasCurrencyColumn = cafesInfo.some((col: { name: string }) => col.name === "currency")
    
    if (!hasCurrencyColumn) {
      console.log("Adding currency column to cafes table...")
      db.prepare("ALTER TABLE cafes ADD COLUMN currency TEXT DEFAULT 'USD'").run()
      db.prepare("UPDATE cafes SET currency = 'USD' WHERE currency IS NULL").run()
    }

    // Add payment columns to orders table if they don't exist
    
    if (!hasPaymentMethod) {
      console.log("Adding paymentMethod column to orders table...")
      db.prepare("ALTER TABLE orders ADD COLUMN paymentMethod TEXT").run()
    }
    if (!hasPaidAt) {
      console.log("Adding paidAt column to orders table...")
      db.prepare("ALTER TABLE orders ADD COLUMN paidAt TEXT").run()
    }
    if (!hasBillNumber) {
      console.log("Adding billNumber column to orders table...")
      db.prepare("ALTER TABLE orders ADD COLUMN billNumber TEXT").run()
    }
  } catch (error: any) {
    // Migration failed, but continue
    console.error("Migration error:", error?.message)
  }
}

runMigrations(db)

// Seed initial data if tables are empty
try {
  const cafeCount = db.prepare("SELECT COUNT(*) as count FROM cafes").get() as { count: number }
  if (cafeCount.count === 0) {
    seedDatabase(db)
  }
} catch (error: any) {
  // If tables don't exist yet, seed will create them
  if (error?.message?.includes("no such table")) {
    seedDatabase(db)
  }
}

function seedDatabase(db: any) {
  const now = new Date().toISOString()

  // Insert default café
  db.prepare(`
    INSERT INTO cafes (id, name, address, phone, email, isActive, createdAt, updatedAt, adminId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "cafe-1",
    "WTS Downtown Café",
    "123 Main Street, Downtown",
    "+1 234-567-8900",
    "downtown@wtscafe.com",
    1,
    now,
    now,
    "2"
  )

  // Insert tables
  const tables = [
    { id: "table-1", number: 1, capacity: 4 },
    { id: "table-2", number: 2, capacity: 2 },
    { id: "table-3", number: 3, capacity: 6 },
    { id: "table-4", number: 4, capacity: 4 },
    { id: "table-5", number: 5, capacity: 2 },
  ]

  const cafeSlug = slugify("WTS Downtown Café")
  tables.forEach((table) => {
    db.prepare(`
      INSERT INTO tables (id, cafeId, number, qrCode, isActive, capacity, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      table.id,
      "cafe-1",
      table.number,
      `/menu/${cafeSlug}/${table.id}`,
      1,
      table.capacity,
      "empty",
      now
    )
  })

  // Insert categories
  const categories = [
    { id: "cat-1", name: "Hot Drinks", icon: "☕", order: 1 },
    { id: "cat-2", name: "Cold Drinks", icon: "🧊", order: 2 },
    { id: "cat-3", name: "Food", icon: "🍽️", order: 3 },
    { id: "cat-4", name: "Desserts", icon: "🍰", order: 4 },
    { id: "cat-5", name: "Snacks", icon: "🍿", order: 5 },
  ]

  categories.forEach((cat) => {
    db.prepare(`
      INSERT INTO categories (id, cafeId, name, icon, "order")
      VALUES (?, ?, ?, ?, ?)
    `).run(cat.id, "cafe-1", cat.name, cat.icon, cat.order)
  })

  // Insert menu items
  const menuItems = [
    { id: "item-1", name: "Espresso", description: "Strong Italian coffee", price: 3.50, category: "cat-1" },
    { id: "item-2", name: "Cappuccino", description: "Espresso with steamed milk foam", price: 4.50, category: "cat-1" },
    { id: "item-3", name: "Latte", description: "Espresso with steamed milk", price: 4.75, category: "cat-1" },
    { id: "item-4", name: "Americano", description: "Espresso with hot water", price: 3.75, category: "cat-1" },
    { id: "item-5", name: "Mocha", description: "Chocolate espresso drink", price: 5.00, category: "cat-1" },
    { id: "item-6", name: "Iced Coffee", description: "Cold brewed coffee", price: 4.00, category: "cat-2" },
    { id: "item-7", name: "Iced Latte", description: "Espresso with cold milk", price: 4.75, category: "cat-2" },
    { id: "item-8", name: "Smoothie", description: "Fresh fruit smoothie", price: 5.50, category: "cat-2" },
    { id: "item-9", name: "Lemonade", description: "Fresh lemonade", price: 3.50, category: "cat-2" },
    { id: "item-10", name: "Sandwich", description: "Fresh deli sandwich", price: 7.50, category: "cat-3" },
    { id: "item-11", name: "Burger", description: "Classic beef burger", price: 9.00, category: "cat-3" },
    { id: "item-12", name: "Pasta", description: "Italian pasta dish", price: 10.50, category: "cat-3" },
    { id: "item-13", name: "Salad", description: "Fresh garden salad", price: 8.00, category: "cat-3" },
    { id: "item-14", name: "Cheesecake", description: "New York style cheesecake", price: 6.50, category: "cat-4" },
    { id: "item-15", name: "Brownie", description: "Chocolate brownie", price: 4.50, category: "cat-4" },
    { id: "item-16", name: "Ice Cream", description: "Vanilla ice cream", price: 4.00, category: "cat-4" },
    { id: "item-17", name: "Chips", description: "Potato chips", price: 2.50, category: "cat-5" },
    { id: "item-18", name: "Cookies", description: "Fresh baked cookies", price: 3.00, category: "cat-5" },
  ]

  menuItems.forEach((item) => {
    db.prepare(`
      INSERT INTO menu_items (id, cafeId, name, description, price, category, available, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id,
      "cafe-1",
      item.name,
      item.description,
      item.price,
      item.category,
      1,
      now,
      now
    )
  })

  // Insert sample employee
  db.prepare(`
    INSERT INTO employees (id, cafeId, name, email, role, salary, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "emp-1",
    "cafe-1",
    "John Doe",
    "john@wtscafe.com",
    "employee",
    2500,
    1,
    now,
    now
  )
}

export default db

