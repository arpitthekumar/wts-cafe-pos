"use client"

export function SoundTestButton() {
  const testSound = () => {
    const audio = new Audio("/sounds/help-alarm.mp3")
    audio.volume = 1

    audio
      .play()
      .then(() => {
        console.log("🔊 Sound played")
      })
      .catch((err) => {
        console.error("❌ Sound failed:", err)
      })
  }

  return (
    <button
      onClick={testSound}
      className="px-4 py-2 rounded bg-red-600 text-white"
    >
      🔔 Test Sound
    </button>
  )
}
