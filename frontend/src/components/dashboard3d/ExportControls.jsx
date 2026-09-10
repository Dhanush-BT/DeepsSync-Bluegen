import { useState } from 'react'

export default function ExportControls() {
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCSVExport = () => {
    const shareUrl = window.location.href
    const csvContent = `data:text/csv;charset=utf-8,Share Link\n${shareUrl}`
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', 'ocean-visualization-export.csv')
    link.click()
  }

  const handleCopyLink = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  return (
    <div className="flex gap-2 w-full">
      <button
        onClick={handleCSVExport}
        className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors border border-slate-300"
      >
        ↓ CSV Export
      </button>
      <button
        onClick={handleCopyLink}
        className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors border border-slate-300"
        title={copySuccess ? 'Copied!' : 'Copy share link'}
      >
        {copySuccess ? '✓ Copied' : '⊗ Copy link'}
      </button>
    </div>
  )
}
