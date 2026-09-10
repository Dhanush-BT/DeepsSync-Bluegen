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
        setError(err.message || 'Failed to load parsers')
      } finally {
        setLoading(false)
      }
    }
    fetchParsers()
  }, [])

  if (loading) {
    return <div className="text-center text-gray-500 py-4">Loading parsers...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Available Parsers</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {parsers.length === 0 ? (
        <p className="text-gray-500">No parsers available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parsers.map((parser, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-bold text-blue-900">{parser.name}</h3>
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Formats:</span> {parser.supportedExtensions.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
