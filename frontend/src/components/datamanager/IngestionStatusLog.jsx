import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

export default function IngestionStatusLog({ refreshTrigger }) {
  const [ingestions, setIngestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchIngestions = async () => {
    try {
      setLoading(true)
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
    const baseClass = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold'
    switch (status) {
      case 'SUCCESS':
        return (
          <span className={`${baseClass} bg-emerald-50 text-emerald-700 border border-emerald-200`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Success</span>
          </span>
        )
      case 'FAILED':
        return (
          <span className={`${baseClass} bg-red-50 text-red-700 border border-red-200`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Failed</span>
          </span>
        )
      case 'PENDING':
        return (
          <span className={`${baseClass} bg-amber-50 text-amber-700 border border-amber-200 animate-pulse`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Processing</span>
          </span>
        )
      default:
        return <span className={`${baseClass} bg-slate-100 text-slate-700`}>{status}</span>
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '—'
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">table_chart</span>
            <span>Data Ingestion Telemetry Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of ingested NetCDF, CSV, and ASCII files with point counts.
          </p>
        </div>

        <button
          onClick={fetchIngestions}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <span className={`material-symbols-outlined text-base text-slate-600 ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span>Refresh History</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl mb-4">
          {error}
        </div>
      )}

      {loading && ingestions.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading ingestion audit log...
        </div>
      ) : ingestions.length === 0 ? (
        <div className="py-12 text-center rounded-xl bg-slate-50/50 border border-dashed border-slate-200 space-y-2">
          <span className="material-symbols-outlined text-3xl text-slate-400">hourglass_empty</span>
          <p className="text-sm font-semibold text-slate-700">No Ingestion Records Found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload your first NetCDF or CSV ocean file above to populate the grid points and float tables.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="px-4 py-3 rounded-l-xl">File Name</th>
                <th className="px-4 py-3">Parser Engine</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Grid Points</th>
                <th className="px-4 py-3 text-right">Floats Tracked</th>
                <th className="px-4 py-3 rounded-r-xl">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ingestions.map((ing) => (
                <tr key={ing.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-slate-900 max-w-xs truncate flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-slate-400">description</span>
                    <span>{ing.fileName}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">{ing.parserName}</td>
                  <td className="px-4 py-3.5 text-center">{getStatusBadge(ing.status)}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                    {(ing.gridPointsIngested || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                    {(ing.floatsIngested || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{formatDate(ing.uploadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ingestions.some((i) => i.status === 'FAILED') && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <details className="cursor-pointer group">
            <summary className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">warning</span>
              <span>Review Ingestion Failure Exceptions</span>
            </summary>
            <div className="mt-3 space-y-2 pl-4 border-l-2 border-red-200">
              {ingestions
                .filter((i) => i.status === 'FAILED' && i.errorMessage)
                .map((i) => (
                  <div key={i.id} className="p-3 bg-red-50 rounded-xl text-xs text-red-700">
                    <span className="font-bold text-red-900">{i.fileName}:</span> {i.errorMessage}
                  </div>
                ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
