import { useState, useEffect } from 'react'
import apiClient from '../../api/client'

export default function ParserRegistryList() {
  const [parsers, setParsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchParsers = async () => {
      try {
        const response = await apiClient.get('/admin/parsers')
        setParsers(response.data || [])
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load parser registry')
      } finally {
        setLoading(false)
      }
    }
    fetchParsers()
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">extension</span>
            <span>Registered Parsers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Plug-and-play parser registry</p>
        </div>
        <span className="px-2 py-0.5 text-[11px] font-bold bg-sky-100 text-sky-800 rounded-full">
          {parsers.length} Active
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-500">
          Loading active parser plugins...
        </div>
      ) : parsers.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No parsers discovered
        </div>
      ) : (
        <div className="space-y-3">
          {parsers.map((parser, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-sky-300 transition-all flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-sky-700">code</span>
                  <span className="text-xs font-bold text-slate-900">{parser.name}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {parser.supportedExtensions?.map((ext, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-200 text-slate-700 rounded-md shadow-2xs"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-[11px] text-slate-600 leading-relaxed">
        <span className="font-semibold text-sky-950 block mb-0.5">Extensibility Rule:</span>
        Implement <code className="font-mono text-sky-700">OceanDataParser</code> and annotate with <code className="font-mono text-sky-700">@Component</code> to automatically register new format handlers.
      </div>
    </div>
  )
}
