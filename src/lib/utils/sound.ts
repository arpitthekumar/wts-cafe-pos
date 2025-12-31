// Sound notification utility
// Uses Web Audio API to play notification sounds

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Generate a beep sound
function generateBeep(frequency: number, duration: number, volume: number = 0.3): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (error) {
    console.error("Error playing sound:", error)
  }
}

export const sounds = {
  // Help request notification (urgent, higher pitch)
  helpRequest: () => {
    generateBeep(800, 0.2, 0.4)
    setTimeout(() => generateBeep(1000, 0.2, 0.4), 200)
  },

  // Order ready notification (pleasant, medium pitch)
  orderReady: () => {
    generateBeep(600, 0.15, 0.3)
    setTimeout(() => generateBeep(700, 0.15, 0.3), 150)
    setTimeout(() => generateBeep(800, 0.2, 0.3), 300)
  },

  // Feedback notification (gentle, lower pitch)
  feedback: () => {
    generateBeep(500, 0.2, 0.25)
    setTimeout(() => generateBeep(600, 0.2, 0.25), 200)
  },

  // General notification
  notification: () => {
    generateBeep(600, 0.2, 0.3)
  },

  // Success sound
  success: () => {
    generateBeep(523, 0.1, 0.2) // C
    setTimeout(() => generateBeep(659, 0.1, 0.2), 100) // E
    setTimeout(() => generateBeep(784, 0.2, 0.2), 200) // G
  },
}

// Check if page is visible (for playing sounds only when not looking)
export function isPageVisible(): boolean {
  return !document.hidden
}

// Play sound only if page is not visible (user not looking)
export function playSoundIfNotVisible(soundFn: () => void) {
  if (!isPageVisible()) {
    soundFn()
  }
}

