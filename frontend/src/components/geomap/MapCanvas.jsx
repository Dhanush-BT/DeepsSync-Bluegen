import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

export default function MapCanvas({ floats = [], focusedFloat = null, onFloatClick = () => {} }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const trajectoriesRef = useRef({})

  useEffect(() => {
    if (!mapContainerRef.current) return

    try {
      // Initialize map
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          preferCanvas: true,
        }).setView([12.4, 79.1], 6)

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current)
      }

      const map = mapRef.current

      // Clear existing markers and trajectories
      Object.values(markersRef.current).forEach((marker) => {
        try {
          map.removeLayer(marker)
        } catch (e) {
          console.warn('Error removing marker:', e)
        }
      })
      Object.values(trajectoriesRef.current).forEach((line) => {
        try {
          map.removeLayer(line)
        } catch (e) {
          console.warn('Error removing trajectory:', e)
        }
      })
      markersRef.current = {}
      trajectoriesRef.current = {}

      const getInstrumentColor = (type) => {
        if (!type) return '#0284c7'
        const u = String(type).toUpperCase()
        if (u.includes('ARGO')) return '#0284c7' // Ocean Blue
        if (u.includes('GLIDER')) return '#f59e0b' // Amber
        if (u.includes('CTD')) return '#10b981' // Emerald Green
        if (u.includes('BUOY') || u.includes('MOOR')) return '#8b5cf6' // Violet
        if (u.includes('DRIFT')) return '#ec4899' // Pink
        return '#06b6d4'
      }

      // Add floats to map
      floats.forEach((float) => {
        const lat = float.latitude || float.lastLatitude
        const lon = float.longitude || float.lastLongitude

        if (lat == null || lon == null) {
          console.warn('Float missing coordinates:', float.platformId)
          return
        }

        const color = getInstrumentColor(float.normalizedType || float.instrumentType)

        // Add trajectory polyline
        if (float.positions && float.positions.length > 1) {
          const latLngs = float.positions
            .filter((p) => p.latitude != null && p.longitude != null)
            .map((p) => [p.latitude, p.longitude])

          if (latLngs.length > 1) {
            const trajectory = L.polyline(latLngs, {
              color: color,
              weight: 2,
              opacity: 0.6,
              dashArray: '4, 4',
              lineCap: 'round',
            }).addTo(map)
            trajectoriesRef.current[float.platformId] = trajectory

            // Add direction arrow to last position
            const lastPos = latLngs[latLngs.length - 1]
            const prevPos = latLngs[latLngs.length - 2]

            const bearing = calculateBearing(prevPos, lastPos)
            const arrowIcon = L.divIcon({
              html: `<div style="transform: rotate(${bearing}deg); color: ${color}; font-size: 20px; font-weight: bold;">→</div>`,
              iconSize: [20, 20],
              className: 'leaflet-custom-icon',
            })

            L.marker(lastPos, { icon: arrowIcon }).addTo(map)
          }
        }

        // Add current position marker
        const isFocused = focusedFloat === float.platformId

        const markerIcon = L.divIcon({
          html: `
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background-color: ${color};
              border: 3px solid white;
              box-shadow: 0 0 12px ${color};
              cursor: pointer;
              transform: ${isFocused ? 'scale(1.3)' : 'scale(1)'};
              transition: transform 0.2s;
            "></div>
          `,
          iconSize: [18, 18],
          className: 'leaflet-custom-icon',
        })

        const displayId = String(float.platformId || '').split(',')[0].trim()

        const marker = L.marker([lat, lon], {
          icon: markerIcon,
          title: displayId,
        })
          .on('click', () => onFloatClick(float))
          .addTo(map)

        markersRef.current[float.platformId] = marker

        // Add popup
        const popupContent = `
          <div class="p-2 text-sm">
            <div class="font-bold text-sky-700">${displayId}</div>
            <div class="text-xs text-gray-600 mt-1">
              <div>${lat?.toFixed(2) || '?'}°N, ${lon?.toFixed(2) || '?'}°E</div>
              <div class="mt-0.5 font-semibold" style="color: ${color};">${float.instrumentType || 'UNKNOWN'}</div>
              ${float.profileCount ? `<div class="text-[11px] text-gray-500 mt-1">${float.profileCount} profiles</div>` : ''}
            </div>
          </div>
        `
        marker.bindPopup(popupContent)
      })

      // Fit bounds if floats exist
      if (floats.length > 0) {
        const validFloats = floats.filter((f) => (f.latitude || f.lastLatitude) && (f.longitude || f.lastLongitude))
        if (validFloats.length > 0) {
          const bounds = L.latLngBounds(
            validFloats.map((f) => [f.latitude || f.lastLatitude, f.longitude || f.lastLongitude])
          )
          try {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 })
          } catch (e) {
            console.warn('Error fitting bounds:', e)
          }
        }
      }
    } catch (error) {
      console.error('MapCanvas error:', error)
    }
  }, [floats, focusedFloat, onFloatClick])

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
      style={{
        minHeight: '400px',
        height: '100%',
        width: '100%',
        position: 'relative',
      }}
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
