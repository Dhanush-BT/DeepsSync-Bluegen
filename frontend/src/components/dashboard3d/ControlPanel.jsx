import TimeSlider from './TimeSlider'
import DepthSlider from './DepthSlider'
import RegionSelector from './RegionSelector'
import PointQueryTool from './PointQueryTool'
import VariableSelector from './VariableSelector'
import ColorbarControl from './ColorbarControl'
import VerticalExaggerationSlider from './VerticalExaggerationSlider'
import VolumeOpacitySlider from './VolumeOpacitySlider'
import ExportControls from './ExportControls'

export default function ControlPanel() {
  return (
    <div className="w-80 bg-white border-r border-slate-200 shadow-sm overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">CONTROL PANEL</h2>
          <span className="text-xs text-slate-500 font-medium">CLIENT-ONLY</span>
        </div>

        {/* Variable Selector */}
        <div className="border-t border-slate-200 pt-4">
          <VariableSelector />
        </div>

        {/* Colorbar Control */}
        <div className="border-t border-slate-200 pt-4">
          <ColorbarControl />
        </div>

        {/* Depth Slice */}
        <div className="border-t border-slate-200 pt-4">
          <DepthSlider />
        </div>

        {/* Region Selector (Surface) */}
        <div className="border-t border-slate-200 pt-4">
          <RegionSelector />
        </div>

        {/* Vertical Exaggeration */}
        <div className="border-t border-slate-200 pt-4">
          <VerticalExaggerationSlider />
        </div>

        {/* Volume Opacity */}
        <div className="border-t border-slate-200 pt-4">
          <VolumeOpacitySlider />
        </div>

        {/* Export Controls */}
        <div className="border-t border-slate-200 pt-4">
          <ExportControls />
        </div>

        {/* Advanced Controls */}
        <div className="border-t border-slate-200 pt-4">
          <details className="cursor-pointer">
            <summary className="text-xs font-semibold text-slate-700 hover:text-slate-900">
              Advanced Filters
            </summary>
            <div className="mt-3 space-y-4">
              <div>
                <TimeSlider />
              </div>
              <div className="border-t border-slate-200 pt-3">
                <PointQueryTool />
              </div>
            </div>
          </details>
        </div>

        {/* Help */}
        <div className="border-t border-slate-200 pt-4">
          <details className="cursor-pointer">
            <summary className="text-xs font-semibold text-slate-700 hover:text-slate-900">
              Help & Controls
            </summary>
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
                <strong>Select Point:</strong> Click point to inspect
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
