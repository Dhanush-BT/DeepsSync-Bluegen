import { Billboard, Text } from '@react-three/drei'

export default function TextLabels() {
  const tickStyle = {
    fontSize: 0.22,
    color: '#0369a1', // ocean sky-700 for high contrast against light blue (#f5fdff)
    fontWeight: 'bold',
    anchorX: 'center',
    anchorY: 'middle',
  }

  const titleStyle = {
    fontSize: 0.32,
    color: '#0f172a', // slate-900 for high contrast
    fontWeight: 'bold',
    anchorX: 'center',
    anchorY: 'middle',
  }

  return (
    <>
      {/* Longitude labels (top) - range 70°E to 95°E (spaced out nicely without clutter) */}
      {[
        { val: 70, norm: -1.0 },
        { val: 78, norm: -0.36 },
        { val: 86, norm: 0.28 },
        { val: 95, norm: 1.0 },
      ].map(({ val, norm }, i) => (
        <Billboard key={`lon-top-${i}`} position={[norm, 1.45, 0]}>
          <Text {...tickStyle}>
            {val}° E
          </Text>
        </Billboard>
      ))}

      {/* Latitude labels (left side) - range -10°S to 25°N */}
      {[
        { val: 25, norm: 1.0 },
        { val: 15, norm: 0.43 },
        { val: 5, norm: -0.14 },
        { val: 0, norm: -0.43 },
        { val: -10, norm: -1.0 },
      ].map(({ val, norm }, i) => (
        <Billboard key={`lat-${i}`} position={[-1.7, norm, 0]}>
          <Text {...tickStyle}>
            {val > 0 ? `${val}° N` : val === 0 ? '0° EQ' : `${Math.abs(val)}° S`}
          </Text>
        </Billboard>
      ))}

      {/* Depth labels (right side) - range 0m to 2000m (Surface is y=+1, 2000m is y=-1) */}
      {[
        { val: 0, norm: 1.0 },
        { val: 500, norm: 0.5 },
        { val: 1000, norm: 0.0 },
        { val: 1500, norm: -0.5 },
        { val: 2000, norm: -1.0 },
      ].map(({ val, norm }, i) => (
        <Billboard key={`depth-${i}`} position={[1.7, norm, 0]}>
          <Text {...tickStyle}>
            -{val}m
          </Text>
        </Billboard>
      ))}

      {/* Axis titles - clear typography with comfortable spacing */}
      <Billboard position={[0, 1.85, 0]}>
        <Text {...titleStyle}>
          Longitude (°E)
        </Text>
      </Billboard>

      <Billboard position={[-2.2, 1.35, 0]}>
        <Text {...titleStyle}>
          Latitude
        </Text>
      </Billboard>

      <Billboard position={[2.2, 1.35, 0]}>
        <Text {...titleStyle}>
          Depth (m)
        </Text>
      </Billboard>
    </>
  )
}
