import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapCanvas({ floats = [], focusedFloat = null, onFloatClick = () => {} }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const trajectoriesRef = useRef({})

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([12.4, 79.1], 6)

      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Add bathymetry-style overlay
      const oceanOverlay = L.canvas()
      mapRef.current.on('moveend', () => {
        oceanOverlay.redraw()
      })
    }

    const map = mapRef.current

    // Clear existing markers and trajectories
    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker))
    Object.values(trajectoriesRef.current).forEach((line) => map.removeLayer(line))
    markersRef.current = {}
    trajectoriesRef.current = {}

    // Add floats to map
    floats.forEach((float) => {
      // Add trajectory polyline
      if (float.positions && float.positions.length > 0) {
        const latLngs = float.positions.map((p) => [p.latitude, p.longitude])
        const color = float.instrumentType === 'ARGO' ? '#0284c7' : '#f59e0b'

        const trajectory = L.polyline(latLngs, {
          color: color,
          weight: 2,
          opacity: 0.6,
          dashArray: '4, 4',
          lineCap: 'round',
        }).addTo(map)
        trajectoriesRef.current[float.platformId] = trajectory

        // Add direction arrow to last position
        if (latLngs.length > 1) {
          const lastPos = latLngs[latLngs.length - 1]
          const prevPos = latLngs[latLngs.length - 2]

          const bearing = calculateBearing(prevPos, lastPos)
          const arrowIcon = L.divIcon({
            html: `<div style="transform: rotate(${bearing}deg); color: ${color}; font-size: 20px;">→</div>`,
            iconSize: [20, 20],
            className: '',
          })

          L.marker(lastPos, { icon: arrowIcon }).addTo(map)
        }
      }

      // Add current position marker
      const color = float.instrumentType === 'ARGO' ? '#0284c7' : '#f59e0b'
      const isFocused = focusedFloat === float.platformId

      const markerIcon = L.divIcon({
        html: `
          <div style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: ${color};
            border: 3px solid white;
            box-shadow: 0 0 12px rgba(2, 132, 199, 0.6);
            cursor: pointer;
            transform: ${isFocused ? 'scale(1.3)' : 'scale(1)'};
            transition: transform 0.2s;
          "></div>
        `,
        iconSize: [16, 16],
        className: '',
      })

      const marker = L.marker([float.lastLatitude, float.lastLongitude], {
        icon: markerIcon,
        title: float.platformId,
      })
        .on('click', () => onFloatClick(float))
        .addTo(map)

      markersRef.current[float.platformId] = marker

      // Add popup
      marker.bindPopup(`
        <div class="p-2 text-sm">
          <div class="font-bold">${float.platformId}</div>
          <div class="text-xs text-gray-600 mt-1">
            <div>${float.lastLatitude}°N, ${float.lastLongitude}°E</div>
            <div>${float.instrumentType}</div>
          </div>
        </div>
      `)
    })

    // Fit bounds if floats exist
    if (floats.length > 0) {
      const bounds = L.latLngBounds(
        floats.map((f) => [f.lastLatitude, f.lastLongitude])
      )
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [floats, focusedFloat, onFloatClick])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
      style={{ minHeight: '400px' }}
    />
  )
}

function calculateBearing(from, to) {
  const lat1 = (from[0] * Math.PI) / 180
  const lat2 = (to[0] * Math.PI) / 180
  const dLon = ((to[1] - from[1]) * Math.PI) / 180

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  const bearing = (Math.atan2(y, x) * 180) / Math.PI

  return (bearing + 360) % 360
}
