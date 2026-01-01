"use client"

// ================================
// MP3 Sound Manager for POS
// ================================

let alarmAudio: HTMLAudioElement | null = null
let unlocked = false

// 🔓 Unlock audio once (MANDATORY)
export function unlockAudio() {
  if (unlocked) return

  try {
    const audio = new Audio()
    audio.muted = true
    audio.play().catch(() => {})
    unlocked = true
  } catch (e) {
    console.error("Audio unlock failed", e)
  }
}

// 🔔 Play looping help alarm
function playHelpAlarm() {
  stopHelpAlarm() // avoid overlap

  alarmAudio = new Audio("/sounds/help-alarm.mp3")
  alarmAudio.loop = true
  alarmAudio.volume = 1

  alarmAudio.play().catch((err) => {
    console.log("Help alarm blocked:", err)
  })
}

// ⛔ Stop help alarm
function stopHelpAlarm() {
  if (alarmAudio) {
    alarmAudio.pause()
    alarmAudio.currentTime = 0
    alarmAudio = null
  }
}

// 🔊 Play one-time sound
function playOneShot(src: string, volume = 0.7) {
  const audio = new Audio(src)
  audio.volume = volume
  audio.play().catch(() => {})
}

export const sounds = {
  // 🚨 Customer pressed "Call Waiter"
  helpRequest: () => {
    playHelpAlarm()

    // Auto stop after 12 sec (safety)
    setTimeout(() => {
      stopHelpAlarm()
    }, 12000)
  },

  stopHelpRequest: () => {
    stopHelpAlarm()
  },

  // 🍽️ Order is ready
  orderReady: () => {
    playOneShot("/sounds/order-ready.mp3", 0.8)
  },

  // ✅ Payment / success
  success: () => {
    playOneShot("/sounds/success.mp3", 0.6)
  },
}
