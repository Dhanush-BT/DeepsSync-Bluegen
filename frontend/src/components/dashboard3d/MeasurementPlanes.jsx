import { useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

export default function MeasurementPlanes() {
  const { measurementLongitude: lon, measurementLatitude: lat, measurementDepth: depth } = useAppStore()

  // Normalize values to -1 to 1 range
  // Longitude: 75-95 -> -1 to 1
  // Latitude: -100 to 10 -> -1 to 1
  // Depth: 0-1000 -> 0 to -2

  const normLon = ((lon - 75) / 20) * 2 - 1
  const normLat = ((lat + 100) / 110) * 2 - 1
  const normDepth = -(depth / 500) // 0 to -2 range

  return (
    <>
      {/* Longitude plane (YZ plane at selected longitude) - RED */}
      <mesh position={[normLon, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color={0xff0000}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Longitude line (vertical) */}
      <line position={[normLon, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -1, 0, 0, 1, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xff0000} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Latitude plane (XZ plane at selected latitude) - GREEN */}
      <mesh position={[0, normLat, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color={0x00ff00}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </mesh>

      {/* Latitude line (front to back) */}
      <line position={[0, normLat, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-1, 0, 0, 1, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x00ff00} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Depth plane (XY plane at selected depth) - BLUE */}
      <mesh position={[0, 0, normDepth]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color={0x0000ff}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Depth line (vertical going down) */}
      <line position={[0, 0, normDepth]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -1, 0, 0, 1, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x0000ff} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Intersection point - white dot */}
      <mesh position={[normLon, normLat, normDepth]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>

      {/* Crosshair lines at intersection */}
      {/* Horizontal line (X axis) */}
      <line position={[0, normLat, normDepth]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-1, 0, 0, 1, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xcccccc} linewidth={2} transparent opacity={0.6} />
      </line>

      {/* Vertical line (Y axis) */}
      <line position={[normLon, 0, normDepth]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -1, 0, 0, 1, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xcccccc} linewidth={2} transparent opacity={0.6} />
      </line>

      {/* Depth line (Z axis) */}
      <line position={[normLon, normLat, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -2, 0, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xcccccc} linewidth={2} transparent opacity={0.6} />
      </line>
    </>
  )
}
