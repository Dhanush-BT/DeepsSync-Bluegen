import { useAppStore } from '../../store/useAppStore'

export default function MeasurementSliders() {
  const {
    measurementLongitude: longitude,
    measurementLatitude: latitude,
    measurementDepth: depth,
    setMeasurementLongitude: setLongitude,
    setMeasurementLatitude: setLatitude,
    setMeasurementDepth: setDepth,
  } = useAppStore()

  // Longitude: 75-95
  // Latitude: 10 to -100
  // Depth: 0-1000

  return (
    <>
      {/* Longitude Slider (Top - Red) */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-96 z-20">
        <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-4 border-2 border-red-500">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-red-600">Longitude</label>
            <span className="text-lg font-bold text-red-600">{longitude.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min="75"
            max="95"
            step="0.1"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            className="w-full h-3 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>75°</span>
            <span>95°</span>
          </div>
        </div>
      </div>

      {/* Latitude Slider (Bottom - Green) */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-96 z-20">
        <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-4 border-2 border-green-500">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-green-600">Latitude</label>
            <span className="text-lg font-bold text-green-600">{latitude.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min="-100"
            max="10"
            step="0.1"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            className="w-full h-3 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>-100°</span>
            <span>10°</span>
          </div>
        </div>
      </div>

      {/* Depth Slider (Right - Blue) */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20">
        <div className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-4 border-2 border-blue-500 flex flex-col items-center">
          <div className="mb-2 text-center">
            <label className="text-sm font-bold text-blue-600 block">Depth</label>
            <span className="text-lg font-bold text-blue-600">{depth.toFixed(0)}m</span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="1"
            value={depth}
            onChange={(e) => setDepth(parseFloat(e.target.value))}
            className="h-64 w-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500 vertical-slider"
            style={{
              WebkitAppearance: 'slider-vertical',
              writingMode: 'bt-lr',
            }}
          />
          <div className="flex justify-between text-xs text-slate-600 mt-2 flex-col items-center gap-2">
            <span>1000m</span>
            <span>0m</span>
          </div>
        </div>
      </div>

      {/* Display current coordinates */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 border border-slate-300">
        <div className="text-sm font-semibold text-slate-900 mb-2">Current Position</div>
        <div className="text-xs text-slate-700 space-y-1">
          <div>
            <span className="font-semibold text-red-600">Lon:</span> {longitude.toFixed(2)}°
          </div>
          <div>
            <span className="font-semibold text-green-600">Lat:</span> {latitude.toFixed(2)}°
          </div>
          <div>
            <span className="font-semibold text-blue-600">Depth:</span> {depth.toFixed(0)}m
          </div>
        </div>
      </div>

      {/* CSS for vertical slider */}
      <style>{`
        input[type='range'].vertical-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        input[type='range'].vertical-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        input[type='range']::-webkit-slider-runnable-track {
          background: transparent;
          border: none;
        }

        input[type='range']::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
    </>
  )
}
