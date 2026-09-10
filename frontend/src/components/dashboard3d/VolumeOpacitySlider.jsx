import { useAppStore } from '../../store/useAppStore'

export default function VolumeOpacitySlider() {
  const { volumeOpacity, setVolumeOpacity } = useAppStore()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">Volume opacity</label>
        <span className="text-sm font-semibold text-slate-900">{Math.round(volumeOpacity * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volumeOpacity}
        onChange={(e) => setVolumeOpacity(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  )
}
