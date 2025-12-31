import { Currency } from "@/lib/types"

export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  if (currency === "INR") {
    return `₹${amount.toFixed(2)}`
  }
  return `$${amount.toFixed(2)}`
}

export function getCurrencySymbol(currency: Currency = "USD"): string {
  return currency === "INR" ? "₹" : "$"
}

