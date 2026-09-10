import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

export default function IngestionStatusLog({ refreshTrigger }) {
  const [ingestions, setIngestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchIngestions = async () => {
    try {
      const response = await apiClient.get('/admin/ingestions')
      setIngestions(response.data || [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load ingestion log')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIngestions()
  }, [refreshTrigger])

  const getStatusBadge = (status) => {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium'
    switch (status) {
      case 'SUCCESS':
        return <span className={`${baseClass} bg-green-100 text-green-800`}>✓ Success</span>
      case 'FAILED':
        return <span className={`${baseClass} bg-red-100 text-red-800`}>✗ Failed</span>
      case 'PENDING':
        return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>⏳ Pending</span>
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>{status}</span>
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    return new Date(timestamp).toLocaleString()
  }

  if (loading) {
    return <div className="text-center text-gray-500 py-4">Loading ingestion history...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ingestion History</h2>
        <button
          onClick={fetchIngestions}
          className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {ingestions.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No ingestion records yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 bg-gray-50">
                <th className="px-4 py-2 text-left font-bold">File Name</th>
                <th className="px-4 py-2 text-left font-bold">Parser</th>
                <th className="px-4 py-2 text-center font-bold">Status</th>
                <th className="px-4 py-2 text-right font-bold">Grid Points</th>
                <th className="px-4 py-2 text-right font-bold">Floats</th>
                <th className="px-4 py-2 text-left font-bold">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {ingestions.map((ing) => (
                <tr key={ing.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {ing.fileName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ing.parserName}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(ing.status)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {ing.gridPointsIngested || 0}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {ing.floatsIngested || 0}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDate(ing.uploadedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ingestions.some((i) => i.status === 'FAILED') && (
        <div className="mt-4 pt-4 border-t">
          <details className="cursor-pointer">
            <summary className="font-medium text-red-600 hover:text-red-700">
              Show Error Messages
            </summary>
            <div className="mt-3 space-y-2">
              {ingestions
                .filter((i) => i.status === 'FAILED' && i.errorMessage)
                .map((i) => (
                  <div key={i.id} className="bg-red-50 p-3 rounded text-sm text-red-700">
                    <strong>{i.fileName}:</strong> {i.errorMessage}
                  </div>
                ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
