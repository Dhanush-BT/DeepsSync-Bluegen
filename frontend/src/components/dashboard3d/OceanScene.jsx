import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'
import { generateVolumeSurface } from '../../utils/volumeRenderer'
import AxisLabels from './AxisLabels'
import AutoRotateToggle from './AutoRotateToggle'
import MeasurementSliders from './MeasurementSliders'
import MeasurementPlanes from './MeasurementPlanes'

function VolumetricSurface({ points, selectedVariable, verticalExaggeration, volumeOpacity }) {
  const meshRef = useRef()
  const [surfaceReady, setSurfaceReady] = useState(false)

  useEffect(() => {
    if (!meshRef.current || points.length === 0) return

    try {
      const surfaceData = generateVolumeSurface(points, selectedVariable, 20)
      if (!surfaceData || surfaceData.positions.length === 0) return

      const geometry = new THREE.BufferGeometry()

      const positions = new Float32Array(surfaceData.positions)
      const colors = new Float32Array(surfaceData.colors)

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.computeVertexNormals()

      meshRef.current.geometry.dispose()
      meshRef.current.geometry = geometry

      setSurfaceReady(true)
    } catch (err) {
      console.error('Error generating volumetric surface:', err)
    }
  }, [points, selectedVariable, verticalExaggeration])

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <bufferGeometry />
      <meshPhongMaterial
        color={0xffffff}
        vertexColors
        transparent
        opacity={volumeOpacity}
        wireframe={false}
        side={THREE.DoubleSide}
        emissive={0x111111}
        shininess={50}
        flatShading={false}
        smoothShading={true}
      />
    </mesh>
  )
}

function Scene({ points, onPointSelect, selectedVariable, verticalExaggeration, volumeOpacity, autoRotate }) {
  const controlsRef = useRef()
  const { measurementLongitude: lon, measurementLatitude: lat, measurementDepth: depth } = useAppStore()

  // Normalize measurement values for camera positioning
  const normLon = ((lon - 75) / 20) * 2 - 1
  const normLat = ((lat + 100) / 110) * 2 - 1

  // Camera positioned to show FRONT face (depth is vertical/tallest)
  // Facing the depth dimension, with lon left-right, lat front-back
  const cameraPos = [normLon, -0.5, 3.5 + normLat * 0.5]

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate
    }
  }, [autoRotate])

  return (
    <>
      <PerspectiveCamera position={cameraPos} fov={50} lookAt={[normLon, 0.5, 0]} />
      <OrbitControls ref={controlsRef} enableZoom enablePan enableRotate autoRotate={autoRotate} autoRotateSpeed={0.3} target={[normLon, 0, 0]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.6} />
      <VolumetricSurface
        points={points}
        selectedVariable={selectedVariable}
        verticalExaggeration={verticalExaggeration}
        volumeOpacity={volumeOpacity}
      />
      <MeasurementPlanes />
      <AxisLabels />
      <gridHelper args={[4, 8]} position={[0, 0, -2]} />
    </>
  )
}

export default function OceanScene() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const { filter, setSelectedPoint, selectedVariable, verticalExaggeration, volumeOpacity, setColorbarRange } =
    useAppStore()

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter.minDepth !== null) params.append('minDepth', filter.minDepth)
    if (filter.maxDepth !== null) params.append('maxDepth', filter.maxDepth)
    if (filter.minLat !== null) params.append('minLat', filter.minLat)
    if (filter.maxLat !== null) params.append('maxLat', filter.maxLat)
    if (filter.minLon !== null) params.append('minLon', filter.minLon)
    if (filter.maxLon !== null) params.append('maxLon', filter.maxLon)
    if (filter.timestamp) params.append('timestamp', filter.timestamp)

    apiClient
      .get(`/ocean-data?${params.toString()}`)
      .then((res) => {
        setPoints(res.data || [])
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to fetch ocean data:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => {
    if (points.length > 0) {
      const getVariableValue = (p) => {
        switch (selectedVariable) {
          case 'temperatureC':
            return p.temperatureC
          case 'salinityPsu':
            return p.salinityPsu
          case 'currentSpeed':
            return Math.sqrt((p.currentU || 0) ** 2 + (p.currentV || 0) ** 2)
          case 'chlorophyll':
            return p.chlorophyll
          default:
            return p.temperatureC
        }
      }

      const values = points
        .map((p) => getVariableValue(p))
        .filter((v) => v !== null && v !== undefined && isFinite(v))
      if (values.length > 0) {
        const valueMin = Math.min(...values)
        const valueMax = Math.max(...values)
        if (isFinite(valueMin) && isFinite(valueMax)) {
          setColorbarRange(valueMin, valueMax)
        }
      }
    }
  }, [points, selectedVariable])

  return (
    <div className="w-full h-full relative">
      <MeasurementSliders />
      <AutoRotateToggle onToggle={setAutoRotate} />
      {loading && (
        <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-lg text-sm text-slate-700 z-10">
          Loading ocean data...
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-4 bg-red-100/90 px-4 py-2 rounded-lg text-sm text-red-700 z-10">
          Error: {error}
        </div>
      )}
      <Canvas className="w-full h-full">
        <Scene
          points={points}
          onPointSelect={setSelectedPoint}
          selectedVariable={selectedVariable}
          verticalExaggeration={verticalExaggeration}
          volumeOpacity={volumeOpacity}
          autoRotate={autoRotate}
        />
      </Canvas>
    </div>
  )
}
