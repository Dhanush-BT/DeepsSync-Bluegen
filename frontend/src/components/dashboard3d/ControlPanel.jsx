import TimeSlider from './TimeSlider'
import DepthSlider from './DepthSlider'
import RegionSelector from './RegionSelector'
import PointQueryTool from './PointQueryTool'

export default function ControlPanel() {
  return (
    <div className="w-80 bg-white border-r border-slate-200 shadow-sm overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4">3D Ocean Data</h2>
          <p className="text-xs text-slate-600 mb-4">Filter and inspect ocean grid points</p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <TimeSlider />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <DepthSlider />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <RegionSelector />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <PointQueryTool />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <details className="cursor-pointer">
            <summary className="text-xs font-semibold text-slate-700 hover:text-slate-900">Help & Controls</summary>
            <div className="mt-3 text-xs text-slate-600 space-y-2">
              <p>
                <strong>Rotate:</strong> Click + drag
              </p>
              <p>
                <strong>Pan:</strong> Right-click + drag
              </p>
              <p>
                <strong>Zoom:</strong> Scroll wheel
              </p>
              <p>
                <strong>Select Point:</strong> Click on a point to inspect its properties
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
