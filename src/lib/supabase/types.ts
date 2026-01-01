// Supabase Database Types
// This file will be auto-generated once you run Supabase CLI: supabase gen types typescript
// For now, we'll define basic types that match our SQLite schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cafes: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          isActive: boolean
          createdAt: string
          updatedAt: string
          adminId: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
          adminId?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
          adminId?: string | null
        }
      }
      tables: {
        Row: {
          id: string
          cafeId: string
          number: number
          qrCode: string
          isActive: boolean
          capacity: number | null
          status: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          cafeId: string
          number: number
          qrCode: string
          isActive?: boolean
          capacity?: number | null
          status?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          cafeId?: string
          number?: number
          qrCode?: string
          isActive?: boolean
          capacity?: number | null
          status?: string | null
          createdAt?: string
        }
      }
      orders: {
        Row: {
          id: string
          cafeId: string
          tableId: string
          tableNumber: number
          status: string
          total: number
          customerName: string | null
          customerEmail: string | null
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          cafeId: string
          tableId: string
          tableNumber: number
          status?: string
          total: number
          customerName?: string | null
          customerEmail?: string | null
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          cafeId?: string
          tableId?: string
          tableNumber?: number
          status?: string
          total?: number
          customerName?: string | null
          customerEmail?: string | null
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      order_items: {
        Row: {
          id: string
          orderId: string
          menuItemId: string
          quantity: number
          price: number
          notes: string | null
        }
        Insert: {
          id?: string
          orderId: string
          menuItemId: string
          quantity: number
          price: number
          notes?: string | null
        }
        Update: {
          id?: string
          orderId?: string
          menuItemId?: string
          quantity?: number
          price?: number
          notes?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          cafeId: string
          name: string
          icon: string | null
          order: number
          isActive: boolean
          createdAt: string
        }
        Insert: {
          id?: string
          cafeId: string
          name: string
          icon?: string | null
          order?: number
          isActive?: boolean
          createdAt?: string
        }
        Update: {
          id?: string
          cafeId?: string
          name?: string
          icon?: string | null
          order?: number
          isActive?: boolean
          createdAt?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          cafeId: string
          categoryId: string
          name: string
          description: string | null
          price: number
          image: string | null
          isAvailable: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          cafeId: string
          categoryId: string
          name: string
          description?: string | null
          price: number
          image?: string | null
          isAvailable?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          cafeId?: string
          categoryId?: string
          name?: string
          description?: string | null
          price?: number
          image?: string | null
          isAvailable?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      employees: {
        Row: {
          id: string
          cafeId: string | null
          userId: string
          role: string
          salary: number | null
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          cafeId?: string | null
          userId: string
          role?: string
          salary?: number | null
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          cafeId?: string | null
          userId?: string
          role?: string
          salary?: number | null
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
      reviews: {
        Row: {
          id: string
          orderId: string
          cafeId: string
          rating: number
          comment: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          orderId: string
          cafeId: string
          rating: number
          comment?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          orderId?: string
          cafeId?: string
          rating?: number
          comment?: string | null
          createdAt?: string
        }
      }
      help_requests: {
        Row: {
          id: string
          cafeId: string
          tableId: string
          tableNumber: number
          requestType: string
          status: string
          notes: string | null
          createdAt: string
          resolvedAt: string | null
        }
        Insert: {
          id?: string
          cafeId: string
          tableId: string
          tableNumber: number
          requestType: string
          status?: string
          notes?: string | null
          createdAt?: string
          resolvedAt?: string | null
        }
        Update: {
          id?: string
          cafeId?: string
          tableId?: string
          tableNumber?: number
          requestType?: string
          status?: string
          notes?: string | null
          createdAt?: string
          resolvedAt?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

