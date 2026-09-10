import { useState } from 'react'
import OceanScene from '../components/dashboard3d/OceanScene'
import ControlPanel from '../components/dashboard3d/ControlPanel'
import Dashboard2D from '../components/dashboard2d/Dashboard2D'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('3d')

  return (
    <div className="flex h-screen bg-slate-50 flex-col">
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-4 py-2 text-sm font-semibold rounded-t transition-all ${
              activeTab === '3d'
                ? 'bg-sky-100 text-sky-900 border-b-2 border-sky-500'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            3D Visualization
          </button>
          <button
            onClick={() => setActiveTab('2d')}
            className={`px-4 py-2 text-sm font-semibold rounded-t transition-all ${
              activeTab === '2d'
                ? 'bg-sky-100 text-sky-900 border-b-2 border-sky-500'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            2D Analysis
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === '3d' && (
          <div className="flex h-full bg-slate-50">
            <ControlPanel />
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-sky-50 via-white to-sky-50">
                <OceanScene />
              </div>
            </div>
          </div>
        )}

        {activeTab === '2d' && (
          <div className="h-full bg-white">
            <Dashboard2D />
          </div>
        )}
      </div>
    </div>
  )
}
