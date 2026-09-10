import FloatSelector from './FloatSelector'
import ProfileChart from './ProfileChart'
import TimeSeriesChart from './TimeSeriesChart'
import TSDiagramChart from './TSDiagramChart'
import HovmollerChart from './HovmollerChart'
import DistributionHistogramChart from './DistributionHistogramChart'
import AlongTrackSectionChart from './AlongTrackSectionChart'
import CurrentRoseChart from './CurrentRoseChart'
import CorrelationView from './CorrelationView'

export default function Dashboard2D() {
  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900 mb-4">Instrument Data Analysis</h1>
        <FloatSelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileChart />
        <TimeSeriesChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TSDiagramChart />
        <CorrelationView />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HovmollerChart />
        <DistributionHistogramChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlongTrackSectionChart />
        <CurrentRoseChart />
      </div>
    </div>
  )
}
