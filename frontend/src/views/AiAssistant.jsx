import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import AssistantChartCard from '../components/assistant/AssistantChartCard'

// AI Assistant with integrated dynamic graph visualization
export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      time: '10:40 AM',
      text: 'Welcome to DeepSync Oceanographic Query Intelligence. I can analyze 3D numerical model grids, compute Mixed Layer Depth (MLD), evaluate temperature-salinity water masses, and render interactive diagnostic charts directly in our conversation.',
      metrics: [
        { label: 'Ingested Grid Points', value: '34,800' },
        { label: 'Active Floats', value: '5 Platforms' },
        { label: 'Active Advisories', value: '3 Synced' },
      ],
      chartConfig: {
        type: 'profile',
        title: 'Representative Indian Ocean Thermocline Profile — Float #2900226',
        subtitle: 'Depth vs Temperature (°C) & Practical Salinity (PSU)',
        platformId: '2900226',
      },
    },
    {
      id: 2,
      role: 'user',
      time: '10:41 AM',
      text: 'Show temperature-salinity water mass distribution in the Arabian Sea.',
    },
    {
      id: 3,
      role: 'assistant',
      time: '10:41 AM',
      text: 'Identified Arabian Sea High Salinity Water (ASHSW) and Red Sea Outflow water masses. Practical Salinity peaks at 36.2 PSU within the upper 120m before tapering off toward deep Antarctic Intermediate Water (AAIW) layers.',
      metrics: [
        { label: 'Water Mass', value: 'ASHSW Core' },
        { label: 'Peak Salinity', value: '36.25 PSU' },
        { label: 'Core Temp', value: '25.4 °C' },
      ],
      chartConfig: {
        type: 'tsdiagram',
        title: 'T-S Diagram: Water Mass Identification (Arabian Sea)',
        subtitle: 'Assimilated in-situ CTD Soundings vs Density Contours',
        platformId: '2900226',
      },
    },
    {
      id: 4,
      role: 'user',
      time: '10:42 AM',
      text: 'Analyze the sea surface temperature temporal trend across the Bay of Bengal.',
    },
    {
      id: 5,
      role: 'assistant',
      time: '10:42 AM',
      text: 'Chronological time-series analysis reveals sea surface warming between 28.6°C and 29.8°C with periodic wind-driven mixing anomalies during monsoon transition weeks.',
      metrics: [
        { label: 'Mean SST', value: '29.2 °C' },
        { label: 'Temporal Anomaly', value: '+0.8 °C' },
        { label: 'Observation Span', value: '10-day cycle' },
      ],
      chartConfig: {
        type: 'timeseries',
        title: 'SST Temporal Trend & Anomaly Series — Bay of Bengal',
        subtitle: 'Continuous Telemetry Evolution & Thermocline Drift',
        platformId: '2900226',
      },
    },
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('Indian Ocean EEZ')
  const [selectedVariable, setSelectedVariable] = useState('Sea Surface Temp (SST)')
  const [selectedDepth, setSelectedDepth] = useState('Surface (0m)')
  const [floatsList, setFloatsList] = useState([])
  const [selectedFloatId, setSelectedFloatId] = useState('')
  const chatEndRef = useRef(null)

  const suggestedQueries = [
    'Plot depth profile of temperature and salinity for float 2900226',
    'Show SST time-series trend across Bay of Bengal',
    'Display T-S diagram for active Arabian Sea water masses',
    'Show temperature frequency distribution histogram',
    'Calculate Mixed Layer Depth (MLD) at 10°N, 85°E',
    'Retrieve latest Tsunami & High Wave hazard advisory coordinates',
  ]

  useEffect(() => {
    apiClient
      .get('/floats')
      .then((res) => {
        const list = res.data || []
        setFloatsList(list)
        if (list.length > 0) {
          setSelectedFloatId(list[0].platformId)
        }
      })
      .catch((err) => console.warn('Floats endpoint unreachable:', err))
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery
    if (!textToSend.trim()) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputQuery('')
    setLoading(true)

    try {
      // Fetch live stats from backend to ground response in real data
      const statsRes = await apiClient.get('/stats/summary').catch(() => null)
      const stats = statsRes?.data || {}

      setTimeout(() => {
        const lower = textToSend.toLowerCase()
        let reply = ''
        let details = null
        let chart = null

        // Determine if user explicitly requested a chart, or query inherently involves scientific visualization
        const isTimeQuery = lower.includes('time') || lower.includes('series') || lower.includes('trend') || lower.includes('temporal') || lower.includes('drift')
        const isTSQuery = lower.includes('t-s') || lower.includes('ts diagram') || lower.includes('water mass') || lower.includes('salinity vs temp')
        const isDistQuery = lower.includes('distribution') || lower.includes('histogram') || lower.includes('frequency') || lower.includes('spread')
        const isProfileQuery = lower.includes('profile') || lower.includes('depth') || lower.includes('thermocline') || lower.includes('mld') || lower.includes('vertical') || lower.includes('sst') || lower.includes('temperature') || lower.includes('salinity') || lower.includes('graph') || lower.includes('chart') || lower.includes('plot')

        const isMLDQuery = lower.includes('mld') || lower.includes('mixed layer')
        const isCurrentQuery = lower.includes('current') || lower.includes('velocity') || lower.includes('circulation') || lower.includes('vector')

        // Target platform for profile-based graphs
        const targetId = selectedFloatId || (floatsList.length > 0 ? floatsList[0].platformId : '2900226')

        if (isMLDQuery) {
          reply = `Calculated Mixed Layer Depth (MLD) using finite temperature criterion ($\Delta T = 0.2^\circ\text{C}$ from 10m reference level): MLD evaluated at **48.5 meters**. Upper layer shows strong uniform thermal stratification with wind-driven convective mixing down to 50m.`
          details = [
            { label: 'Calculated MLD', value: '48.5 m' },
            { label: 'Criterion', value: 'ΔT = 0.2°C' },
            { label: 'Thermocline Base', value: '115.0 m' },
          ]
          chart = {
            type: 'profile',
            title: `Mixed Layer Depth & Thermocline Gradient — Float #${targetId}`,
            subtitle: `Assimilated CTD sounding identifying active MLD boundary at 48.5m`,
            platformId: targetId,
          }
        } else if (isCurrentQuery) {
          reply = `Evaluated geostrophic & wind-driven surface circulation vectors. East India Coastal Current (EICC) velocities average 0.42 m/s with northward transport anomalies along the western Bay of Bengal margin.`
          details = [
            { label: 'Mean Velocity', value: '0.42 m/s' },
            { label: 'Peak Vector', value: '0.86 m/s (EICC)' },
            { label: 'Direction', value: '028° (NNE)' },
          ]
          chart = {
            type: 'timeseries',
            title: `Current Velocity Vector Evolution — Float #${targetId}`,
            subtitle: `Acoustic Doppler & trajectory drift analysis across ${selectedRegion}`,
            platformId: targetId,
          }
        } else if (isTSQuery) {
          reply = `Synthesized Temperature-Salinity (T-S) water mass distribution for platform #${targetId} across ${selectedRegion}. The scatter diagram demonstrates distinct mixing between Arabian Sea High Salinity Water (ASHSW) and Bay of Bengal Low Salinity Water.`
          details = [
            { label: 'Diagram', value: 'T-S Scatter' },
            { label: 'Float ID', value: targetId },
            { label: 'Region', value: selectedRegion },
          ]
          chart = {
            type: 'tsdiagram',
            title: `T-S Diagram (Salinity vs Temperature) — Float #${targetId}`,
            subtitle: `Assimilated in-situ water mass identification across ${selectedRegion}`,
            platformId: targetId,
          }
        } else if (isTimeQuery) {
          reply = `Generated chronological time-series telemetry analysis across ${selectedRegion}. Temporal trends capture mixed layer warming and periodic salinity fluctuations over the recent observation period.`
          details = [
            { label: 'Diagram', value: 'Time-Series Trend' },
            { label: 'Float ID', value: targetId },
            { label: 'Parameter', value: selectedVariable },
          ]
          chart = {
            type: 'timeseries',
            title: `Temporal Trend & Anomaly Series — Float #${targetId}`,
            subtitle: `Continuous telemetry evolution across ${selectedRegion}`,
            platformId: targetId,
          }
        } else if (isDistQuery) {
          reply = `Constructed frequency distribution histogram for observed water parameters in ${selectedRegion}. The bimodal distribution reflects upper-layer mixed temperatures and sub-surface cooling.`
          details = [
            { label: 'Diagram', value: 'Distribution Histogram' },
            { label: 'Variable', value: selectedVariable },
            { label: 'Bins', value: '5 Discrete Bands' },
          ]
          chart = {
            type: 'distribution',
            title: `Thermal / Saline Frequency Distribution — ${selectedRegion}`,
            subtitle: `Statistical density across observed telemetry samples`,
            platformId: targetId,
          }
        } else if (lower.includes('sst') || lower.includes('temperature')) {
          reply = `Telemetry analysis across ${selectedRegion} indicates a mean Sea Surface Temperature of 28.4°C at depth level ${selectedDepth}. Thermocline gradient sharpens between 60m and 120m with localized thermal stratification.`
          details = [
            { label: 'Mean Temp', value: '28.4 °C' },
            { label: 'Depth Sampled', value: selectedDepth },
            { label: 'Data Source', value: 'NetCDF CF-1.8' },
          ]
          chart = {
            type: 'profile',
            title: `Vertical Temperature & Salinity Profile — Float #${targetId}`,
            subtitle: `Depth stratification in ${selectedRegion} down to 1000m`,
            platformId: targetId,
          }
        } else if (lower.includes('argo') || lower.includes('float') || lower.includes('glider')) {
          reply = `Queried live observation network: ${stats.floatCountByInstrumentType?.ARGO_FLOAT || 5} active Argo profiling floats and ${stats.floatCountByInstrumentType?.GLIDER || 2} underwater gliders are currently synchronized. Platform fixes report continuous salinity profiles up to 1000m depth.`
          details = [
            { label: 'Argo Floats', value: String(stats.floatCountByInstrumentType?.ARGO_FLOAT || 5) },
            { label: 'Gliders', value: String(stats.floatCountByInstrumentType?.GLIDER || 2) },
            { label: 'Sampling Interval', value: '24h drift' },
          ]
          chart = {
            type: 'profile',
            title: `Telemetry Profile: Active Platform #${targetId}`,
            subtitle: `CTD sensor soundings for ${selectedRegion}`,
            platformId: targetId,
          }
        } else if (lower.includes('hazard') || lower.includes('tsunami') || lower.includes('alert')) {
          reply = `INCOIS Early Warning Systems report ${stats.activeHazardCount || 3} active advisories across Indian EEZ waters: High Wave Warning in the Bay of Bengal, Potential Fishing Zone (PFZ) mapping in the Arabian Sea, and a seismic Tsunami Watch in the Lakshadweep Sea.`
          details = [
            { label: 'Active Alerts', value: String(stats.activeHazardCount || 3) },
            { label: 'Watch Level', value: 'Moderate - Severe' },
            { label: 'Coordination', value: 'INCOIS EWS' },
          ]
          // Distribution or time-series of hazard anomalies
          chart = {
            type: 'distribution',
            title: `Hazard Anomaly & Wave Height Bins — ${selectedRegion}`,
            subtitle: `Advisory magnitude distribution across active coastal zones`,
            platformId: targetId,
          }
        } else if (isProfileQuery) {
          reply = `Vertical profiling query processed for ${selectedRegion}. Thermocline core detected near 100m depth with progressive halocline boundary layer.`
          details = [
            { label: 'Profile Type', value: 'CTD Sounding' },
            { label: 'Float ID', value: targetId },
            { label: 'Max Depth', value: '1000m' },
          ]
          chart = {
            type: 'profile',
            title: `CTD Depth Sounding Profile — Float #${targetId}`,
            subtitle: `Assimilated observation from ${selectedRegion}`,
            platformId: targetId,
          }
        } else {
          reply = `Processed query: "${textToSend}" against ${selectedRegion} (${selectedVariable} at ${selectedDepth}). The volumetric model grid contains ${(stats.gridPointCount || 34800).toLocaleString()} cells with full hydrodynamic components (Current U/V, Salinity, and Chlorophyll).`
          details = [
            { label: 'Region Filter', value: selectedRegion },
            { label: 'Variable', value: selectedVariable },
            { label: 'Resolution', value: '5° Grid' },
          ]
          chart = {
            type: 'profile',
            title: `Hydrodynamic Profile for ${selectedVariable}`,
            subtitle: `Simulated and in-situ records at ${selectedDepth} in ${selectedRegion}`,
            platformId: targetId,
          }
        }

        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: reply,
          metrics: details,
          chartConfig: chart,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setLoading(false)
      }, 700)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-transparent overflow-hidden font-sans">
      {/* Subheader Bar */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs tracking-wider text-slate-400 font-bold">DEEPSYNC</span>
            <span className="text-slate-300">/</span>
            <h1 className="text-sm font-bold text-slate-900">AI Oceanographic Query Intelligence</h1>
          </div>
          <span className="hidden md:inline-block h-3.5 w-px bg-slate-200"></span>
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
            <span className="material-symbols-outlined text-sm text-sky-600">psychology</span>
            <span>OceanLLM Grounded Engine</span>
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setMessages([messages[0]])}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            <span>Clear Chat</span>
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">view_in_ar</span>
            <span>View in 3D Scene</span>
          </Link>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Filter & Scope Sidebar */}
        <aside className="w-80 border-r border-slate-200/80 bg-white flex flex-col shrink-0 hidden lg:flex overflow-y-auto">
          <div className="p-5 border-b border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sky-600 text-base">tune</span>
                <span>Oceanographic Scope</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                Telemetry Filter
              </span>
            </div>

            {/* Region select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Target Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-sky-600 outline-none cursor-pointer"
              >
                <option value="Indian Ocean EEZ">Indian Ocean EEZ (All)</option>
                <option value="Bay of Bengal">Bay of Bengal (0°N–25°N)</option>
                <option value="Arabian Sea">Arabian Sea (10°N–25°N)</option>
                <option value="Lakshadweep Sea">Lakshadweep Sea Basin</option>
              </select>
            </div>

            {/* Variable select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Hydrodynamic Variable</label>
              <select
                value={selectedVariable}
                onChange={(e) => setSelectedVariable(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-sky-600 outline-none cursor-pointer"
              >
                <option value="Sea Surface Temp (SST)">Sea Surface Temp (SST, °C)</option>
                <option value="Practical Salinity">Practical Salinity (PSU)</option>
                <option value="Current Vectors U/V">Current Vectors (u, v m/s)</option>
                <option value="Chlorophyll Concentration">Chlorophyll-a (mg/m³)</option>
                <option value="Mixed Layer Depth">Mixed Layer Depth (MLD, m)</option>
              </select>
            </div>

            {/* Depth select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Vertical Slice Depth</label>
              <select
                value={selectedDepth}
                onChange={(e) => setSelectedDepth(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-sky-600 outline-none cursor-pointer"
              >
                <option value="Surface (0m)">Surface (0m Layer)</option>
                <option value="Subsurface (50m)">Subsurface (50m)</option>
                <option value="Thermocline (100m)">Thermocline Core (100m)</option>
                <option value="Intermediate (200m)">Intermediate (200m)</option>
                <option value="Deep Ocean (500m)">Deep Ocean (500m)</option>
                <option value="Abyssal (1000m)">Abyssal (1000m)</option>
              </select>
            </div>

            {/* Target Instrument select */}
            {floatsList.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>Target Float / Glider</span>
                  <span className="text-[10px] text-blue-600 font-normal">Graph Source</span>
                </label>
                <select
                  value={selectedFloatId}
                  onChange={(e) => setSelectedFloatId(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:border-sky-600 outline-none cursor-pointer"
                >
                  {floatsList.map((f) => (
                    <option key={f.platformId} value={f.platformId}>
                      {f.instrumentType || 'ARGO'} #{f.platformId} ({f.latitude?.toFixed(1)}°N, {f.longitude?.toFixed(1)}°E)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Real-time Feeds Status */}
          <div className="p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Grounded Telemetry Feeds
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-800">NetCDF INCOIS Grid</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">CF-1.8</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-800">Argo Trajectories</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Live 140+</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span className="font-semibold text-slate-800">SARAT Hazard Feeds</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Chat Conversation Canvas */}
        <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-white ring-1 ring-slate-800'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <span className="material-symbols-outlined text-base">person</span>
                  ) : (
                    <span className="material-symbols-outlined text-base text-sky-400">smart_toy</span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/80 text-slate-900 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[11px]">
                    <span className={msg.role === 'user' ? 'text-blue-100 font-semibold' : 'text-slate-500 font-semibold'}>
                      {msg.role === 'user' ? 'Analyst Query' : 'DeepSync Agent'}
                    </span>
                    <span className={msg.role === 'user' ? 'text-blue-200 text-[10px]' : 'text-slate-400 text-[10px]'}>
                      {msg.time}
                    </span>
                  </div>

                  <p className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                    {msg.text}
                  </p>

                  {/* Telemetry Metrics Pill Box */}
                  {msg.metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      {msg.metrics.map((m, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">
                            {m.label}
                          </span>
                          <span className="text-xs font-bold text-slate-900 block mt-0.5">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Respective Graph View Card */}
                  {msg.chartConfig && (
                    <div className="pt-2 border-t border-slate-100">
                      <AssistantChartCard
                        chartConfig={msg.chartConfig}
                        floatInfo={floatsList.find((f) => f.platformId === (msg.chartConfig.platformId || selectedFloatId))}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 max-w-3xl">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 shrink-0 flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-base animate-pulse">smart_toy</span>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-4 shadow-xs flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                  <span>Synthesizing numerical ocean model variables &amp; in-situ Argo observations...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input & Suggested Queries Box */}
          <div className="bg-white border-t border-slate-200/80 p-4 sm:p-5 shrink-0 space-y-3">
            {/* Suggested Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Suggested:
              </span>
              {suggestedQueries.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-800 transition-colors shrink-0 text-xs font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask a scientific query (e.g. 'Analyze Bay of Bengal thermocline anomaly at 100m depth')..."
                  disabled={loading}
                  className="w-full h-12 pl-4 pr-11 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 outline-none transition-all"
                />
                <div className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                  <span className="material-symbols-outlined text-xl">mic</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Query</span>
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
