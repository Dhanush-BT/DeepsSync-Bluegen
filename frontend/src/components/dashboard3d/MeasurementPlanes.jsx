import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'
import { generateDepthSliceData } from '../../utils/volumeRenderer'

export default function MeasurementPlanes({ points, selectedVariable }) {
  const {
    measurementLongitude: lon,
    measurementLatitude: lat,
    measurementDepth: depth,
    colormapPalette,
    verticalExaggeration,
  } = useAppStore()

  const sliceMeshRef = useRef()
  const sliceWireframeRef = useRef()

  // Standard Normalized Coordinates [-1, 1]:
  // X = Longitude: 70°E to 95°E (range = 25)
  // Y = Depth: 0m to 2000m -> surface is +1, 2000m is -1
  // Z = Latitude: -10°S to 25°N (range = 35)

  const normLon = Math.max(-1, Math.min(1, ((lon - 70) / 25) * 2 - 1))
  const normLat = Math.max(-1, Math.min(1, ((lat - (-10)) / 35) * 2 - 1))
  const normDepth = Math.max(-1, Math.min(1, 1 - (depth / 2000) * 2)) * verticalExaggeration

  // Dynamically generate interpolated depth slice mesh
  useEffect(() => {
    if (!sliceMeshRef.current || !points || points.length === 0) return

    try {
      const sliceData = generateDepthSliceData(points, selectedVariable, depth, colormapPalette)
      if (!sliceData || sliceData.positions.length === 0) return

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sliceData.positions), 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(sliceData.colors), 3))
      geometry.computeVertexNormals()

      if (sliceMeshRef.current.geometry) sliceMeshRef.current.geometry.dispose()
      sliceMeshRef.current.geometry = geometry

      if (sliceWireframeRef.current) {
        if (sliceWireframeRef.current.geometry) sliceWireframeRef.current.geometry.dispose()
        sliceWireframeRef.current.geometry = new THREE.WireframeGeometry(geometry)
      }
    } catch (err) {
      console.error('Error updating depth slice geometry:', err)
    }
  }, [points, selectedVariable, depth, colormapPalette])

  return (
    <group>
      {/* 1. True 3D Interpolated Horizontal Depth Slice with Scalar Heatmap */}
      <group position={[0, normDepth, 0]}>
        <mesh ref={sliceMeshRef} renderOrder={200}>
          <bufferGeometry />
          <meshStandardMaterial
            vertexColors
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
            roughness={0.25}
            metalness={0.1}
            depthWrite={false}
          />
        </mesh>

        {/* Crisp grid isoline wireframe on depth slice */}
        <lineSegments ref={sliceWireframeRef} renderOrder={201}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
        </lineSegments>

        {/* Highlight Outer Border of the Depth Slice */}
        <lineSegments renderOrder={202}>
          <edgesGeometry args={[new THREE.PlaneGeometry(2, 2)]} />
          <lineBasicMaterial color="#38bdf8" linewidth={2.5} transparent opacity={0.9} />
        </lineSegments>

        {/* Ambient Depth Indicator Glow Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={199}>
          <planeGeometry args={[2.02, 2.02]} />
          <meshBasicMaterial
            color="#0284c7"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 2. Longitude vertical slice (YZ plane at selected longitude) - Red indicator */}
      <mesh position={[normLon, 0, 0]}>
        <planeGeometry args={[2, 2 * verticalExaggeration]} />
        <meshBasicMaterial
          color={0xef4444}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Longitude line (vertical) */}
      <line position={[normLon, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -verticalExaggeration, 0, 0, verticalExaggeration, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xef4444} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* 3. Latitude vertical slice (XY plane at selected latitude) - Green indicator */}
      <mesh position={[0, 0, normLat]}>
        <planeGeometry args={[2, 2 * verticalExaggeration]} />
        <meshBasicMaterial
          color={0x10b981}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Latitude line */}
      <line position={[0, 0, normLat]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-1, 0, 0, 1, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x10b981} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* 4. Crosshair guide lines intersecting at [normLon, normDepth, normLat] */}
      {/* Horizontal X axis line */}
      <line position={[0, normDepth, normLat]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-1, 0, 0, 1, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xfbbf24} linewidth={2} transparent opacity={0.7} />
      </line>

      {/* Vertical Y axis line */}
      <line position={[normLon, 0, normLat]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -verticalExaggeration, 0, 0, verticalExaggeration, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xfbbf24} linewidth={2} transparent opacity={0.7} />
      </line>

      {/* Front-back Z axis line */}
      <line position={[normLon, normDepth, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -1, 0, 0, 1])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xfbbf24} linewidth={2} transparent opacity={0.7} />
      </line>

      {/* 5. Sounding Intersection Target Marker */}
      <mesh position={[normLon, normDepth, normLat]} renderOrder={999}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#eab308"
          emissiveIntensity={1.2}
          roughness={0.2}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Outer Halo Glow Sphere */}
      <mesh position={[normLon, normDepth, normLat]} renderOrder={998}>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={0.4}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      {/* Center target dot */}
      <mesh position={[normLon, normDepth, normLat]} renderOrder={1000}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#0f172a" depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  )
}
