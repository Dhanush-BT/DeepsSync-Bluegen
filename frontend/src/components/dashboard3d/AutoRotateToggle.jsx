import { useState } from 'react'

export default function AutoRotateToggle({ onToggle }) {
  const [isAutoRotate, setIsAutoRotate] = useState(true)

  const handleToggle = () => {
    const newState = !isAutoRotate
    setIsAutoRotate(newState)
    onToggle(newState)
  }

  return (
    <button
      onClick={handleToggle}
      className={`absolute top-4 right-4 z-20 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        isAutoRotate
          ? 'bg-sky-500 text-white hover:bg-sky-600'
          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
      }`}
      title={isAutoRotate ? 'Click to stop rotation' : 'Click to start rotation'}
    >
      {isAutoRotate ? '🔄 Rotating' : '⏸ Paused'}
    </button>
  )
}
