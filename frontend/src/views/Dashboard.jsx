import OceanScene from '../components/dashboard3d/OceanScene'
import ControlPanel from '../components/dashboard3d/ControlPanel'

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-slate-50">
      <ControlPanel />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-gradient-to-br from-sky-50 via-white to-sky-50">
          <OceanScene />
        </div>
      </div>
    </div>
  )
}
