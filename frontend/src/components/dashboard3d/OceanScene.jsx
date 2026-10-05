import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'
import { getColorForValue, getVariableValue, generateTriangularMesh, generateCubicMesh, getArrayMinMax } from '../../utils/volumeRenderer'
import AxisLabels from './AxisLabels'
import TextLabels from './TextLabels'
import AutoRotateToggle from './AutoRotateToggle'
import MeasurementPlanes from './MeasurementPlanes'
import DatasetSelector from './DatasetSelector'

// Helper to create circular particle texture for crisp point rendering
function createCircleTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const center = 32
  const radius = 28

  ctx.beginPath()
  ctx.arc(center, center, radius, 0, 2 * Math.PI, false)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

let circleTextureInstance = null
function getCircleTexture() {
  if (!circleTextureInstance && typeof document !== 'undefined') {
    circleTextureInstance = createCircleTexture()
  }
  return circleTextureInstance
}

// 1. 3D Triangular Surface Mesh Component
function TriangularMeshVolume({ points, selectedVariable, verticalExaggeration, volumeOpacity }) {
  const meshRef = useRef()
  const wireframeRef = useRef()
  const { colormapPalette } = useAppStore()

  useEffect(() => {
    if (!meshRef.current || !points || points.length === 0) return

    try {
      const meshData = generateTriangularMesh(points, selectedVariable, colormapPalette, verticalExaggeration)
      if (!meshData || meshData.positions.length === 0) return

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(meshData.positions), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(meshData.colors), 3))
      geometry.computeVertexNormals()

      if (meshRef.current.geometry) meshRef.current.geometry.dispose()
      meshRef.current.geometry = geometry

      // Triangular wireframe facet overlay for high-definition polygon aesthetics
      if (wireframeRef.current) {
        if (wireframeRef.current.geometry) wireframeRef.current.geometry.dispose()
        wireframeRef.current.geometry = new THREE.WireframeGeometry(geometry)
      }
    } catch (err) {
      console.error('Error generating triangular mesh:', err)
    }
  }, [points, selectedVariable, verticalExaggeration, colormapPalette])

  return (
    <group>
      <mesh ref={meshRef}>
        <bufferGeometry />
        <meshStandardMaterial
          vertexColors
          transparent
          opacity={volumeOpacity}
          side={THREE.DoubleSide}
          roughness={0.35}
          metalness={0.15}
          flatShading={true}
        />
      </mesh>
      <lineSegments ref={wireframeRef}>
        <lineBasicMaterial color="#0369a1" transparent opacity={Math.min(volumeOpacity, 0.4)} />
      </lineSegments>
    </group>
  )
}

// 2. 3D Cubic Voxel Mesh Component
function CubicMeshVolume({ points, selectedVariable, verticalExaggeration, volumeOpacity }) {
  const meshRef = useRef()
  const wireframeRef = useRef()
  const { colormapPalette } = useAppStore()

  useEffect(() => {
    if (!meshRef.current || !points || points.length === 0) return

    try {
      const meshData = generateCubicMesh(points, selectedVariable, colormapPalette, verticalExaggeration)
      if (!meshData || meshData.positions.length === 0) return

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(meshData.positions), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(meshData.colors), 3))
      geometry.computeVertexNormals()

      if (meshRef.current.geometry) meshRef.current.geometry.dispose()
      meshRef.current.geometry = geometry

      if (wireframeRef.current) {
        if (wireframeRef.current.geometry) wireframeRef.current.geometry.dispose()
        wireframeRef.current.geometry = new THREE.WireframeGeometry(geometry)
      }
    } catch (err) {
      console.error('Error generating cubic mesh:', err)
    }
  }, [points, selectedVariable, verticalExaggeration, colormapPalette])

  return (
    <group>
      <mesh ref={meshRef}>
        <bufferGeometry />
        <meshStandardMaterial
          vertexColors
          transparent
          opacity={volumeOpacity}
          roughness={0.3}
          metalness={0.1}
          flatShading={true}
        />
      </mesh>
      <lineSegments ref={wireframeRef}>
        <lineBasicMaterial color="#0284c7" transparent opacity={Math.min(volumeOpacity, 0.35)} />
      </lineSegments>
    </group>
  )
}

// 3. 3D Point Cloud Volume Component
function OceanPointsVolume({ points, selectedVariable, verticalExaggeration, volumeOpacity }) {
  const pointsRef = useRef()
  const { colormapPalette } = useAppStore()

  useEffect(() => {
    if (!pointsRef.current || !points || points.length === 0) return

    try {
      const values = points
        .map((p) => getVariableValue(p, selectedVariable))
        .filter((v) => v !== null && v !== undefined && isFinite(v))

      const { min: minVal, max: maxVal } = getArrayMinMax(values, 0, 1)
      const valRange = maxVal - minVal || 1

      const positions = []
      const colors = []

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        const lon = p.longitude
        const lat = p.latitude
        const depth = p.depthMeters ?? 0
        const val = getVariableValue(p, selectedVariable)

        if (lon === null || lon === undefined || lat === null || lat === undefined) continue

        const x = Math.max(-1, Math.min(1, ((lon - 70) / 25) * 2 - 1))
        const normY = Math.max(-1, Math.min(1, 1 - (depth / 2000) * 2))
        const y = normY * verticalExaggeration
        const z = Math.max(-1, Math.min(1, ((lat - (-10)) / 35) * 2 - 1))

        positions.push(x, y, z)

        const normVal = (val - minVal) / valRange
        const rgb = getColorForValue(normVal, colormapPalette)
        colors.push(rgb[0], rgb[1], rgb[2])
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

      if (pointsRef.current.geometry) {
        pointsRef.current.geometry.dispose()
      }
      pointsRef.current.geometry = geometry
    } catch (err) {
      console.error('Error updating OceanPointsVolume:', err)
    }
  }, [points, selectedVariable, verticalExaggeration, colormapPalette])

  const pointTexture = getCircleTexture()

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.065}
        vertexColors
        transparent
        opacity={Math.max(0.2, Math.min(1, volumeOpacity))}
        map={pointTexture}
        alphaTest={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  )
}

function Scene({ points, onPointSelect, selectedVariable, verticalExaggeration, volumeOpacity, autoRotate }) {
  const controlsRef = useRef()
  const { measurementLongitude: lon, measurementLatitude: lat, visualizationStyle } = useAppStore()

  // Standard normalized coordinates for camera look
  const normLon = Math.max(-1, Math.min(1, ((lon - 70) / 25) * 2 - 1))
  const normLat = Math.max(-1, Math.min(1, ((lat + 10) / 35) * 2 - 1))

  // Camera positioned to show FRONT face with ample distance and clear perspective
  const cameraPos = [normLon * 0.3, 0.5, 3.8]

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate
    }
  }, [autoRotate])

  return (
    <>
      <PerspectiveCamera position={cameraPos} fov={45} lookAt={[0, 0, 0]} />
      <OrbitControls
        ref={controlsRef}
        enableZoom
        enablePan
        enableRotate
        autoRotate={autoRotate}
        autoRotateSpeed={0.3}
        target={[0, 0, 0]}
      />
      <ambientLight intensity={1.4} />
      <directionalLight position={[6, 8, 7]} intensity={1.5} />
      <directionalLight position={[-6, -4, -5]} intensity={0.8} />
      <pointLight position={[0, 4, 4]} intensity={1.0} />
      
      {/* 3D Geometry Rendering based on Selected Style */}
      {visualizationStyle === 'triangles' && (
        <TriangularMeshVolume
          points={points}
          selectedVariable={selectedVariable}
          verticalExaggeration={verticalExaggeration}
          volumeOpacity={volumeOpacity}
        />
      )}
      {visualizationStyle === 'cubes' && (
        <CubicMeshVolume
          points={points}
          selectedVariable={selectedVariable}
          verticalExaggeration={verticalExaggeration}
          volumeOpacity={volumeOpacity}
        />
      )}
      {visualizationStyle === 'points' && (
        <OceanPointsVolume
          points={points}
          selectedVariable={selectedVariable}
          verticalExaggeration={verticalExaggeration}
          volumeOpacity={volumeOpacity}
        />
      )}

      <MeasurementPlanes points={points} selectedVariable={selectedVariable} />
      <AxisLabels />
      <TextLabels />
      <gridHelper args={[4, 8, 0x0284c7, 0x94a3b8]} position={[0, -1, 0]} />
    </>
  )
}

export default function OceanScene() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const { filter, setSelectedPoint, selectedVariable, verticalExaggeration, volumeOpacity, setColorbarRange, selectedDatasets, setSelectedDatasets } =
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
    selectedDatasets.forEach(ds => params.append('dataset', ds))

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
  }, [filter, selectedDatasets])

  useEffect(() => {
    if (points.length > 0) {
      const getVal = (p) => {
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
        .map((p) => getVal(p))
        .filter((v) => v !== null && v !== undefined && isFinite(v))
      if (values.length > 0) {
        const { min: valueMin, max: valueMax } = getArrayMinMax(values)
        if (isFinite(valueMin) && isFinite(valueMax)) {
          setColorbarRange(valueMin, valueMax)
        }
      }
    }
  }, [points, selectedVariable])

  return (
    <div className="w-full h-full relative">
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
        <color attach="background" args={['#f5fdff']} />
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
