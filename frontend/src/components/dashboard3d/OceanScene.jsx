import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import apiClient from '../../api/client'
import { useAppStore } from '../../store/useAppStore'

function PointCloud({ points }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (!meshRef.current || !points.length) return

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(points.length * 3)
    const colors = new Float32Array(points.length * 3)

    const tempMin = Math.min(...points.map((p) => p.temperatureC))
    const tempMax = Math.max(...points.map((p) => p.temperatureC))

    points.forEach((point, i) => {
      positions[i * 3] = point.longitude
      positions[i * 3 + 1] = point.latitude
      positions[i * 3 + 2] = -point.depthMeters / 1000

      const normalized = (point.temperatureC - tempMin) / (tempMax - tempMin)
      colors[i * 3] = normalized
      colors[i * 3 + 1] = 0.5
      colors[i * 3 + 2] = 1 - normalized
    })

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    meshRef.current.geometry = geometry
  }, [points])

  return (
    <points ref={meshRef}>
      <bufferGeometry />
      <pointsMaterial size={0.05} sizeAttenuation vertexColors />
    </points>
  )
}

function Scene({ points, onPointSelect }) {
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  const handleClick = (event) => {
    mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
    mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
  }

  return (
    <>
      <PerspectiveCamera position={[0, 0, 3]} fov={50} />
      <OrbitControls enableZoom enablePan enableRotate />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <PointCloud points={points} />
      <gridHelper args={[20, 20]} position={[0, 0, -5]} />
    </>
  )
}

export default function OceanScene() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { filter, setSelectedPoint } = useAppStore()

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

  return (
    <div className="w-full h-full relative">
      {loading && <div className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-lg text-sm text-slate-700 z-10">Loading {points.length} points...</div>}
      {error && <div className="absolute top-4 left-4 bg-red-100/90 px-4 py-2 rounded-lg text-sm text-red-700 z-10">Error: {error}</div>}
      <Canvas className="w-full h-full">
        <Scene points={points} onPointSelect={setSelectedPoint} />
      </Canvas>
    </div>
  )
}
