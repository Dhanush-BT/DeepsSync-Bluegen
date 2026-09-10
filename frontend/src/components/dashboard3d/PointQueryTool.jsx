import { useAppStore } from '../../store/useAppStore'

export default function PointQueryTool() {
  const { selectedPoint, setSelectedPoint } = useAppStore()

  if (!selectedPoint) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-700">Point Inspector</label>
        <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-center">
          <p className="text-xs text-slate-600">Click on a point in the 3D view to inspect it</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-700">Point Inspector</label>
      <div className="p-3 bg-ocean-50 rounded-lg border border-ocean-200">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-600">Latitude:</span>
            <span className="ml-2 font-semibold text-slate-900">{selectedPoint.latitude?.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-slate-600">Longitude:</span>
            <span className="ml-2 font-semibold text-slate-900">{selectedPoint.longitude?.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-slate-600">Depth (m):</span>
            <span className="ml-2 font-semibold text-slate-900">{selectedPoint.depthMeters}</span>
          </div>
          <div>
            <span className="text-slate-600">Temperature (°C):</span>
            <span className="ml-2 font-semibold text-slate-900">{selectedPoint.temperatureC?.toFixed(2)}</span>
          </div>
          {selectedPoint.salinityPsu !== null && (
            <div>
              <span className="text-slate-600">Salinity (PSU):</span>
              <span className="ml-2 font-semibold text-slate-900">{selectedPoint.salinityPsu?.toFixed(2)}</span>
            </div>
          )}
          {selectedPoint.timestamp && (
            <div className="col-span-2">
              <span className="text-slate-600">Timestamp:</span>
              <span className="ml-2 font-semibold text-slate-900">{new Date(selectedPoint.timestamp).toLocaleString()}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setSelectedPoint(null)}
          className="w-full mt-3 px-2 py-1.5 text-xs rounded bg-sky-100 text-sky-900 hover:bg-sky-200 transition-all font-semibold"
        >
          Clear Selection
        </button>
      </div>
    </div>
  )
}
