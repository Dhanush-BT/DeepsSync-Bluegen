import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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

      // Add floats to map
      floats.forEach((float) => {
        if (!float.lastLatitude || !float.lastLongitude) return

        const color = float.instrumentType === 'ARGO' ? '#0284c7' : '#f59e0b'

        // Add trajectory polyline
        if (float.positions && float.positions.length > 1) {
          const latLngs = float.positions
            .filter((p) => p.latitude && p.longitude)
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

        const marker = L.marker([float.lastLatitude, float.lastLongitude], {
          icon: markerIcon,
          title: float.platformId,
        })
          .on('click', () => onFloatClick(float))
          .addTo(map)

        markersRef.current[float.platformId] = marker

        // Add popup
        const popupContent = `
          <div class="p-2 text-sm">
            <div class="font-bold text-sky-700">${float.platformId}</div>
            <div class="text-xs text-gray-600 mt-1">
              <div>${float.lastLatitude?.toFixed(2) || '?'}°N, ${float.lastLongitude?.toFixed(2) || '?'}°E</div>
              <div class="mt-0.5">${float.instrumentType || 'UNKNOWN'}</div>
            </div>
          </div>
        `
        marker.bindPopup(popupContent)
      })

      // Fit bounds if floats exist
      if (floats.length > 0) {
        const validFloats = floats.filter((f) => f.lastLatitude && f.lastLongitude)
        if (validFloats.length > 0) {
          const bounds = L.latLngBounds(
            validFloats.map((f) => [f.lastLatitude, f.lastLongitude])
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
