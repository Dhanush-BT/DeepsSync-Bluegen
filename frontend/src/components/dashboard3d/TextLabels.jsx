import { Billboard, Text } from '@react-three/drei'

export default function TextLabels() {
  const labelStyle = {
    fontSize: 0.3,
    color: '#000000',
    fontWeight: 'bold',
    anchorX: 'center',
    anchorY: 'middle',
  }

  return (
    <>
      {/* Longitude labels (top) - with more gap */}
      {[75, 80, 85, 90, 95].map((lon, i) => {
        const x = -1 + (i / 4) * 2
        return (
          <Billboard key={`lon-top-${i}`} position={[x, 1.4, 0]}>
            <Text {...labelStyle} fontSize={0.25}>
              {lon}°
            </Text>
          </Billboard>
        )
      })}

      {/* Latitude labels (left side) - with more gap */}
      {[10, 0, -10, -50, -100].map((lat, i) => {
        const y = 1 - (i / 4) * 2
        return (
          <Billboard key={`lat-${i}`} position={[-1.5, y, 0]}>
            <Text {...labelStyle} fontSize={0.25}>
              {lat}°
            </Text>
          </Billboard>
        )
      })}

      {/* Depth labels (right side) - with more gap */}
      {[0, 250, 500, 750, 1000].map((d, i) => {
        const y = 1 - (i / 4) * 2
        return (
          <Billboard key={`depth-${i}`} position={[1.5, y, 0]}>
            <Text {...labelStyle} fontSize={0.25}>
              {d}m
            </Text>
          </Billboard>
        )
      })}

      {/* Axis titles - with more gap */}
      <Billboard position={[0, 1.65, 0]}>
        <Text {...labelStyle} fontSize={0.35}>
          Longitude
        </Text>
      </Billboard>

      <Billboard position={[-1.7, 1.2, 0]}>
        <Text {...labelStyle} fontSize={0.35}>
          Latitude
        </Text>
      </Billboard>

      <Billboard position={[1.7, 1.2, 0]}>
        <Text {...labelStyle} fontSize={0.35}>
          Depth
        </Text>
      </Billboard>
    </>
  )
}
