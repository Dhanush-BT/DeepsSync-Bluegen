import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Convert Latitude and Longitude to 3D Cartesian coordinates on sphere surface
export function latLonToVector3(lat, lon, radius = 2.0) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

function getInstrumentColor(type) {
  if (!type) return '#38bdf8'
  const u = String(type).toUpperCase()
  if (u.includes('ARGO')) return '#00b4d8' // Vivid Cyan-Blue
  if (u.includes('GLIDER')) return '#fbbf24' // Radiant Gold/Amber
  if (u.includes('CTD')) return '#10b981' // Vibrant Emerald
  if (u.includes('BUOY') || u.includes('MOOR')) return '#a855f7' // Bright Purple
  if (u.includes('DRIFT')) return '#f43f5e' // Vibrant Coral Rose
  return '#06b6d4'
}

// 3D Geodesic Trajectory Line embedded on Earth's rotating surface
function FloatTrajectory({ positions, color }) {
  const linePoints = useMemo(() => {
    if (!positions || positions.length < 2) return []
    const pts = []
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i]
      if (p.latitude != null && p.longitude != null) {
        pts.push(latLonToVector3(p.latitude, p.longitude, 2.008))
      }
    }
    return pts
  }, [positions])

  if (linePoints.length < 2) return null

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints)

  return (
    <primitive
      object={
        new THREE.Line(
          lineGeometry,
          new THREE.LineBasicMaterial({
            color,
            linewidth: 3,
            transparent: true,
            opacity: 0.9,
          })
        )
      }
    />
  )
}

// 3D Pin fixed directly to Earth's surface coordinate
function InstrumentPin({ float, isFocused, isHovered, onSelect, onHover }) {
  const lat = float.latitude ?? float.lastLatitude
  const lon = float.longitude ?? float.lastLongitude
  const ringRef = useRef()

  const pos = useMemo(() => {
    if (lat == null || lon == null) return new THREE.Vector3(0, 0, 0)
    return latLonToVector3(lat, lon, 2.016)
  }, [lat, lon])

  // Normal vector pointing outwards from Earth center for beacon alignment
  const normal = useMemo(() => {
    return pos.clone().normalize()
  }, [pos])

  const color = useMemo(() => {
    return getInstrumentColor(float.normalizedType || float.instrumentType)
  }, [float])

  useFrame((state) => {
    if (ringRef.current && (isFocused || isHovered)) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.4
      ringRef.current.scale.set(scale, scale, scale)
    }
  })

  if (lat == null || lon == null) return null

  return (
    <group position={pos}>
      {/* 3D Surface Pin Core */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(float)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
          onHover(float, e)
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
          onHover(null, null)
        }}
      >
        <sphereGeometry args={[isFocused ? 0.045 : isHovered ? 0.038 : 0.026, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isFocused ? 1.4 : isHovered ? 1.0 : 0.6}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Surface Base Disc / Ring anchored to terrain */}
      <mesh position={normal.clone().multiplyScalar(0.002)}>
        <circleGeometry args={[isFocused ? 0.05 : 0.032, 16]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pulsing Selection Aura */}
      {(isFocused || isHovered) && (
        <mesh ref={ringRef} position={normal.clone().multiplyScalar(0.004)}>
          <ringGeometry args={[0.035, 0.065, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

// 3D Earth Globe containing the sphere surface, atmosphere, and ALL anchored instruments
function RotatingEarth({
  autoRotate,
  floats,
  focusedFloat,
  hoveredFloat,
  onSelect,
  onHover,
}) {
  const globeGroupRef = useRef()
  const texture = useLoader(THREE.TextureLoader, '/textures/earth_daymap.jpg')

  // Enhance texture vibrancy & color grading
  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
      texture.needsUpdate = true
    }
  }, [texture])

  useFrame((state, delta) => {
    if (autoRotate && globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={globeGroupRef}>
      {/* 1. High-Vibrancy Color-Matched Earth Surface */}
      <mesh>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshLambertMaterial
          map={texture}
        />
      </mesh>

      {/* 2. Atmospheric Fresnel Rim Glow (Crisp Cyan-Sky Blue rim) */}
      <mesh scale={[1.018, 1.018, 1.018]}>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Subtle Outer Space Halo */}
      <mesh scale={[1.042, 1.042, 1.042]}>
        <sphereGeometry args={[2.0, 48, 48]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Trajectory Tracks anchored directly to the Earth sphere */}
      {floats.map((f) => {
        if (!f.positions || f.positions.length < 2) return null
        const color = getInstrumentColor(f.normalizedType || f.instrumentType)
        return (
          <FloatTrajectory
            key={`track-${f.platformId}`}
            positions={f.positions}
            color={color}
          />
        )
      })}

      {/* 5. Fixed Instrument Pins rotating WITH the Earth */}
      {floats.map((f) => {
        const isFocused = focusedFloat === f.platformId
        const isHovered = hoveredFloat?.platformId === f.platformId
        return (
          <InstrumentPin
            key={f.platformId}
            float={f}
            isFocused={isFocused}
            isHovered={isHovered}
            onSelect={onSelect}
            onHover={onHover}
          />
        )
      })}
    </group>
  )
}

export default function GlobeCanvas({
  floats = [],
  focusedFloat = null,
  onFloatClick = () => {},
  autoRotate = false,
  zoomAction = 0,
}) {
  const [hoveredFloat, setHoveredFloat] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const controlsRef = useRef()

  // Handle + / - zoom buttons from outside
  useEffect(() => {
    if (!controlsRef.current || zoomAction === 0) return
    const camera = controlsRef.current.object
    if (zoomAction > 0) {
      // Zoom in
      camera.position.multiplyScalar(0.85)
    } else if (zoomAction < 0) {
      // Zoom out
      camera.position.multiplyScalar(1.18)
    }
    controlsRef.current.update()
  }, [zoomAction])

  const handleHover = (float, event) => {
    setHoveredFloat(float)
    if (event) {
      setTooltipPos({ x: event.clientX, y: event.clientY })
    }
  }

  return (
    <div className="w-full h-full relative bg-[#010309] select-none overflow-hidden cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 1.0, 4.6], fov: 42 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.NoToneMapping,
        }}
      >
        {/* Starfield background matching reference */}
        <Stars
          radius={90}
          depth={60}
          count={5000}
          factor={4.5}
          saturation={0.8}
          fade
          speed={0.4}
        />

        {/* Crisp balanced illumination matching reference photo */}
        <ambientLight intensity={1.15} color="#ffffff" />
        <directionalLight position={[6, 3, 7]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-6, -2, -6]} intensity={0.4} color="#bae6fd" />

        {/* Rotating Earth Group with All Markers Fixed Inside */}
        <RotatingEarth
          autoRotate={autoRotate}
          floats={floats}
          focusedFloat={focusedFloat}
          hoveredFloat={hoveredFloat}
          onSelect={onFloatClick}
          onHover={handleHover}
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          minDistance={2.25}
          maxDistance={12}
          rotateSpeed={0.7}
          zoomSpeed={0.9}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>

      {/* Interactive Tooltip */}
      {hoveredFloat && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 bg-slate-900/95 backdrop-blur-md text-white border border-sky-400/50 rounded-xl shadow-2xl text-xs font-mono"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 12}px` }}
        >
          <div className="font-bold text-sky-400 flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-white/30"
              style={{
                backgroundColor: getInstrumentColor(
                  hoveredFloat.normalizedType || hoveredFloat.instrumentType
                ),
              }}
            ></span>
            <span className="text-sm">{String(hoveredFloat.platformId || '').split(',')[0].trim()}</span>
          </div>
          <div className="text-[11px] text-slate-200 mt-1.5 space-y-0.5">
            <div>
              <span className="text-slate-400">Position:</span>{' '}
              {(hoveredFloat.latitude ?? hoveredFloat.lastLatitude)?.toFixed(2)}°N,{' '}
              {(hoveredFloat.longitude ?? hoveredFloat.lastLongitude)?.toFixed(2)}°E
            </div>
            <div className="text-sky-300 font-semibold">
              {hoveredFloat.instrumentType || 'INSTRUMENT'} · {hoveredFloat.profileCount || 0} Profiles
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
