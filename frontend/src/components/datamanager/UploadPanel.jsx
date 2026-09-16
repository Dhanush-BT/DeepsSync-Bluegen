import { useState } from 'react'
import apiClient from '../../api/client'

export default function UploadPanel({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const supportedFormats = [
    { ext: '.nc', label: 'NetCDF-4 / CF' },
    { ext: '.csv', label: 'CSV Ocean Matrix' },
    { ext: '.ascii', label: 'Argo ASCII Profile' },
    { ext: '.txt', label: 'Telemetry Text' },
  ]

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return
    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase()
    const isSupported = supportedFormats.some((f) => f.ext === ext)
    if (!isSupported) {
      setError(`Unsupported file format "${ext}". Please upload NetCDF (.nc), CSV, ASCII, or TXT.`)
      setFile(null)
      return
    }
    setFile(selectedFile)
    setError(null)
  }

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select or drop an ocean data file to ingest.')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(25)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setProgress(50)
      const response = await apiClient.post('/admin/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setProgress(100)
      onUploadSuccess(response.data)
      setFile(null)
      setProgress(0)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200/80 shadow-xs p-6 sm:p-8 rounded-2xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-600">cloud_upload</span>
          <span>File Ingestion</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Auto-detected format parsing
        </p>
      </div>
      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
        Direct Pipeline Active
      </span>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer mt-6 ${
          dragOver
            ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
            : file
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30'
        }`}
      >
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="ocean-file-input"
          accept=".nc,.csv,.txt,.ascii,.asc"
        />
        <label htmlFor="ocean-file-input" className="cursor-pointer block w-full h-full">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-100/70 text-sky-700 flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-3xl">upload_file</span>
          </div>

          {file ? (
            <div className="space-y-1">
              <span className="text-base font-bold text-slate-900 block">{file.name}</span>
              <span className="text-xs text-slate-500 block">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Ready for ingestion
              </span>
              <span className="text-xs font-semibold text-sky-600 underline mt-2 inline-block">
                Click to choose different file
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-slate-800">
                Drop NetCDF, CSV, ASCII files here
              </p>
              <p className="text-xs text-slate-500">
                or <span className="text-sky-700 font-semibold">browse your computer</span>
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Supported Formats */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
        <span className="text-xs text-slate-400 font-medium mr-1">Supported Formats:</span>
        {supportedFormats.map((fmt) => (
          <span
            key={fmt.ext}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 rounded-lg"
          >
            {fmt.label} <code className="text-sky-600 font-mono text-[10px]">{fmt.ext}</code>
          </span>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-base shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Processing data...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              style={{ width: `${progress}%` }}
              className="bg-sky-600 h-2 rounded-full transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {file && (
          <button
            type="button"
            onClick={() => setFile(null)}
            disabled={uploading}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">play_arrow</span>
          <span>{uploading ? 'Processing File...' : 'Start Ingestion Pipeline'}</span>
        </button>
      </div>
    </div>
  )
}
