import { useState, useEffect } from "react"
import { Currency } from "@/lib/types"

export function useCafeCurrency(cafeId?: string): Currency {
  const [currency, setCurrency] = useState<Currency>("USD")

  useEffect(() => {
    if (!cafeId) return

    async function fetchCurrency() {
      try {
        const response = await fetch(`/api/cafes/${cafeId}`)
        if (response.ok) {
          const cafe = await response.json()
          setCurrency(cafe.currency || "USD")
        }
      } catch (error) {
        console.error("Error fetching cafe currency:", error)
      }
    }

    fetchCurrency()
  }, [cafeId])

  return currency
}

