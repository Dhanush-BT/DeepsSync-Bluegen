import { useState } from 'react'
import apiClient from '../../api/client'

export default function UploadPanel({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const supportedFormats = ['.csv', '.txt', '.nc', '.asc', '.ascii']

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase()
    if (!supportedFormats.includes(ext)) {
      setError(`Unsupported file format: ${ext}. Supported: ${supportedFormats.join(', ')}`)
      setFile(null)
      return
    }

    setFile(selectedFile)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient.post('/admin/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProgress(100)
      setFile(null)
      onUploadSuccess(response.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Upload Data File</h2>

      <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="file-input"
          accept={supportedFormats.join(',')}
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-4xl mb-2">📁</div>
          <p className="text-gray-700 font-medium">
            {file ? file.name : 'Click to select or drag file here'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Supported: CSV, NetCDF (.nc), ASCII, Text
          </p>
        </label>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Uploading...</span>
            <span className="text-sm">{progress}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {uploading ? 'Uploading...' : 'Upload & Ingest'}
      </button>
    </div>
  )
}
