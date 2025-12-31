// Database schema definitions
export const createTables = (db: any) => {
  // Cafés
  db.exec(`
    CREATE TABLE IF NOT EXISTS cafes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      adminId TEXT
    )
  `)

  // Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      cafeId TEXT NOT NULL,
      number INTEGER NOT NULL,
      qrCode TEXT NOT NULL,
      isActive INTEGER DEFAULT 1,
      capacity INTEGER,
      status TEXT DEFAULT 'empty',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (cafeId) REFERENCES cafes(id)
    )
  `)

  // Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      cafeId TEXT NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      "order" INTEGER DEFAULT 0,
      FOREIGN KEY (cafeId) REFERENCES cafes(id)
    )
  `)

  // Menu Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      cafeId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      available INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (cafeId) REFERENCES cafes(id),
      FOREIGN KEY (category) REFERENCES categories(id)
    )
  `)

  // Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      cafeId TEXT NOT NULL,
      tableId TEXT NOT NULL,
      tableNumber INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total REAL NOT NULL,
      customerName TEXT,
      customerEmail TEXT,
      notes TEXT,
      paymentMethod TEXT,
      paidAt TEXT,
      billNumber TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (cafeId) REFERENCES cafes(id),
      FOREIGN KEY (tableId) REFERENCES tables(id)
    )
  `)

  // Order Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      menuItemId TEXT NOT NULL,
      menuItemName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    )
  `)

  // Employees
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      cafeId TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      salary REAL,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (cafeId) REFERENCES cafes(id)
    )
  `)

  // Reviews
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      cafeId TEXT NOT NULL,
      tableId TEXT NOT NULL,
      orderId TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (cafeId) REFERENCES cafes(id),
      FOREIGN KEY (orderId) REFERENCES orders(id)
    )
  `)

  // Help Requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS help_requests (
      id TEXT PRIMARY KEY,
      cafeId TEXT NOT NULL,
      tableId TEXT NOT NULL,
      tableNumber INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT,
      createdAt TEXT NOT NULL,
      respondedAt TEXT,
      respondedBy TEXT,
      FOREIGN KEY (cafeId) REFERENCES cafes(id),
      FOREIGN KEY (tableId) REFERENCES tables(id)
    )
  `)

  // Table Sessions (tracks active customers at tables)
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

