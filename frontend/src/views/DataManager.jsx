import { useState } from 'react'
import UploadPanel from '../components/datamanager/UploadPanel'
import ParserRegistryList from '../components/datamanager/ParserRegistryList'
import IngestionStatusLog from '../components/datamanager/IngestionStatusLog'

export default function DataManager() {
  const [refreshLog, setRefreshLog] = useState(0)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleUploadSuccess = (data) => {
    setSuccessMessage(
      `✓ Successfully ingested ${data.gridPointsIngested || 0} grid points and ${data.floatsIngested || 0} floats!`
    )
    setRefreshLog((prev) => prev + 1)
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Data Manager</h1>
      <p className="text-gray-600 mb-6">Upload and manage oceanographic data in multiple formats</p>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <UploadPanel onUploadSuccess={handleUploadSuccess} />
        </div>
        <div>
          <ParserRegistryList />
        </div>
      </div>

      <IngestionStatusLog refreshTrigger={refreshLog} />
    </div>
  )
}
