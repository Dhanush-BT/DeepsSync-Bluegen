import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'

export default function MeasurementPlanes() {
  const { measurementLongitude: lon, measurementLatitude: lat, measurementDepth: depth } = useAppStore()

  // Standard Normalized Coordinates [-1, 1]:
  // X = Longitude: 70°E to 95°E (range = 25)
  // Y = Depth: 0m to 2000m -> surface is +1, 2000m is -1
  // Z = Latitude: -10°S to 25°N (range = 35)

  const normLon = Math.max(-1, Math.min(1, ((lon - 70) / 25) * 2 - 1))
  const normLat = Math.max(-1, Math.min(1, ((lat - (-10)) / 35) * 2 - 1))
  const normDepth = Math.max(-1, Math.min(1, 1 - (depth / 2000) * 2))

  return (
    <group>
      {/* Longitude plane (YZ plane at selected longitude) - RED - vertical slice */}
      <mesh position={[normLon, 0, 0]}>
        <planeGeometry args={[2, 2]} />
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
            array={new Float32Array([0, -1, 0, 0, 1, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xef4444} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Latitude plane (XY plane at selected latitude) - GREEN - depth-longitude slice */}
      <mesh position={[0, 0, normLat]}>
        <planeGeometry args={[2, 2]} />
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

      {/* Depth plane (XZ plane at selected depth) - BLUE - horizontal slice */}
      <mesh position={[0, normDepth, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial
          color={0x0284c7}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Depth lines along horizontal plane perimeter */}
      <line position={[0, normDepth, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -1, 0, 0, 1])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x0284c7} linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Crosshair guide lines intersecting at [normLon, normDepth, normLat] */}
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
            array={new Float32Array([0, -1, 0, 0, 1, 0])}
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

      {/* Intersection Sphere: Vivid, prominent, renderOrder high with depthTest=false so it's always clearly visible */}
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
