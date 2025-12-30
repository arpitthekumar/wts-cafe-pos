export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled"
export type UserRole = "super-admin" | "admin" | "employee"
export type HelpRequestStatus = "pending" | "responded" | "resolved"

export interface Cafe {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  adminId?: string // ID of the admin managing this café
}

export type TableStatus = "empty" | "occupied" | "cleaning" | "reserved"

export interface Table {
  id: string
  cafeId: string
  number: number
  qrCode: string // URL or identifier for QR code
  isActive: boolean
  capacity?: number
  status?: TableStatus // Current table status
  createdAt: string
}

export interface MenuItem {
  id: string
  cafeId: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  available: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  menuItemId: string
  menuItemName: string
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  cafeId: string
  tableId: string
  tableNumber: number
  items: OrderItem[]
  status: OrderStatus
  total: number
  createdAt: string
  updatedAt: string
  customerName?: string
  notes?: string
}

export interface Category {
  id: string
  cafeId: string
  name: string
  icon?: string
  order: number
}

export interface Employee {
  id: string
  cafeId: string
  name: string
  email: string
  role: "employee"
  salary?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  cafeId: string
  tableId: string
  orderId: string
  rating: number // 1-5
  comment?: string
  createdAt: string
}

export interface HelpRequest {
  id: string
  cafeId: string
  tableId: string
  tableNumber: number
  status: HelpRequestStatus
  message?: string
  createdAt: string
  respondedAt?: string
  respondedBy?: string
}

