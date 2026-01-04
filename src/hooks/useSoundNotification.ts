import { useEffect, useRef } from "react"
import { sounds, isPageVisible } from "@/lib/utils/sound"

interface UseSoundNotificationOptions {
  condition: boolean
  soundType: "helpRequest" | "orderReady" | "feedback" | "notification" | "success"
  playWhenVisible?: boolean // If true, plays even when page is visible
}

export function useSoundNotification({
  condition,
  soundType,
  playWhenVisible = false,
}: UseSoundNotificationOptions) {
  const previousCondition = useRef(condition)
  const hasPlayed = useRef(false)

  useEffect(() => {
    // Only play if condition changed from false to true
    if (condition && !previousCondition.current && !hasPlayed.current) {
      if (playWhenVisible || !isPageVisible()) {
        sounds[soundType]()
        hasPlayed.current = true
      }
    }

    // Reset if condition becomes false
    if (!condition) {
      hasPlayed.current = false
    }

    previousCondition.current = condition
  }, [condition, soundType, playWhenVisible])
}

