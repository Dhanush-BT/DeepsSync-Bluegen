import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

export default function MeasurementPlanes() {
  const { measurementLongitude: lon, measurementLatitude: lat, measurementDepth: depth } = useAppStore()

  // Normalize values to axis ranges
  // X = Longitude: 75-95 -> -1 to 1
  // Y = Depth: 0-1000 -> 1 to -1 (inverted, top is positive)
  // Z = Latitude: -100 to 10 -> -1 to 1

  const normLon = ((lon - 75) / 20) * 2 - 1
  const normLat = ((lat + 100) / 110) * 2 - 1
  const normDepth = -((depth / 1000) * 2 - 1)  // Inverted: 0 at top, -1 at bottom

  return (
    <>
      {/* Longitude plane (YZ plane at selected longitude) - RED - vertical */}
      <mesh position={[normLon, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color={0xff0000}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          rotation={[0, 0, 0]}
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

      {/* Latitude plane (XY plane at selected latitude) - GREEN - depth-longitude slice */}
      <mesh position={[0, 0, normLat]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color={0x00ff00}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
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
        <lineBasicMaterial color={0x00ff00} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Depth plane (XZ plane at selected depth) - BLUE - horizontal */}
      <mesh position={[0, normDepth, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color={0x0000ff}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </mesh>

      {/* Depth line (vertical going down) */}
      <line position={[0, normDepth, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -1, 0, 0, 1])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x0000ff} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Intersection point - white dot */}
      <mesh position={[normLon, normDepth, normLat]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={0xffffff} />
      </mesh>

      {/* Crosshair lines at intersection */}
      {/* Horizontal line (X axis - Longitude) */}
      <line position={[0, normDepth, normLat]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-1, 0, 0, 1, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xffff00} linewidth={2} transparent opacity={0.6} />
      </line>

      {/* Vertical line (Y axis - Depth) */}
      <line position={[normLon, 0, normLat]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -1, 0, 0, 1, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xffff00} linewidth={2} transparent opacity={0.6} />
      </line>

      {/* Front-back line (Z axis - Latitude) */}
      <line position={[normLon, normDepth, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -1, 0, 0, 1])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xffff00} linewidth={2} transparent opacity={0.6} />
      </line>
    </>
  )
}
