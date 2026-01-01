// Utility functions for Supabase operations

import { supabase } from "./client"
import type { Database } from "./types"

type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
type Inserts<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
type Updates<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: any): never {
  console.error("Supabase error:", error)
  throw new Error(error?.message || "Database operation failed")
}

/**
 * Type-safe table accessor
 */
export function getTable<T extends keyof Database["public"]["Tables"]>(tableName: T) {
  return supabase.from(tableName)
}

/**
 * Convert Supabase boolean (stored as boolean) to boolean
 * (Supabase handles booleans natively, but this is for consistency)
 */
export function toBool(val: boolean | null | undefined): boolean {
  return val === true
}

/**
 * Convert boolean to Supabase boolean
 */
export function fromBool(val: boolean | null | undefined): boolean {
  return val === true
}

// Export types for convenience
export type { Tables, Inserts, Updates }

