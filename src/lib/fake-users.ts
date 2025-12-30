import { UserRole } from "./types"

export interface FakeUser {
  id: string
  email: string
  password: string
  role: UserRole
  name: string
  cafeId?: string // For admin and employee roles
}

export const fakeUsers: FakeUser[] = [
  {
    id: "1",
    email: "superadmin@wts.com",
    password: "super123",
    role: "super-admin",
    name: "Super Admin",
  },
  {
    id: "2",
    email: "admin@wts.com",
    password: "admin123",
    role: "admin",
    name: "Café Admin",
    cafeId: "cafe-1",
  },
  {
    id: "3",
    email: "staff@wts.com",
    password: "staff123",
    role: "employee",
    name: "Staff User",
    cafeId: "cafe-1",
  },
]
