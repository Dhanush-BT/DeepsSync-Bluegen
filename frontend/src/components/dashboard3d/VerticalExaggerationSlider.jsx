import { useAppStore } from '../../store/useAppStore'

export default function VerticalExaggerationSlider() {
  const { verticalExaggeration, setVerticalExaggeration } = useAppStore()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">Vertical exaggeration</label>
        <span className="text-sm font-semibold text-slate-900">{verticalExaggeration.toFixed(1)}x</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="0.1"
        value={verticalExaggeration}
        onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>1x</span>
        <span>5x</span>
      </div>
    </div>
  )
}
