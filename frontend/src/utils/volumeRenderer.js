// 3D Grid creation and volumetric surface rendering

export function generateVolumeSurface(points, selectedVariable, gridSize = 10) {
  if (!points || points.length === 0) return { positions: [], colors: [] }

  // Get bounds
  const lats = points.map(p => p.latitude)
  const lons = points.map(p => p.longitude)
  const depths = points.map(p => p.depthMeters)

  const latMin = Math.min(...lats), latMax = Math.max(...lats)
  const lonMin = Math.min(...lons), lonMax = Math.max(...lons)
  const depthMin = Math.min(...depths), depthMax = Math.max(...depths)

  const latRange = latMax - latMin || 1
  const lonRange = lonMax - lonMin || 1
  const depthRange = depthMax - depthMin || 1

  const latStep = latRange / (gridSize - 1)
  const lonStep = lonRange / (gridSize - 1)
  const depthStep = depthRange / (gridSize - 1)

  // Create grid points with interpolated values
  const gridPoints = []
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      for (let k = 0; k < gridSize; k++) {
        const lat = latMin + i * latStep
        const lon = lonMin + j * lonStep
        const depth = depthMin + k * depthStep

        const value = interpolateValue(points, lat, lon, depth, selectedVariable)

        gridPoints.push({
          x: ((lon - lonMin) / lonRange) * 2 - 1,
          y: ((lat - latMin) / latRange) * 2 - 1,
          z: -((depth - depthMin) / depthRange) * 2,
          value: value,
          i,
          j,
          k,
        })
      }
    }
  }

  // Create surface by connecting grid points
  const positions = []
  const colors = []

  // Get min/max for normalization
  const values = gridPoints.map(p => p.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const valRange = maxVal - minVal || 1

  // Create quads connecting adjacent grid points
  for (let i = 0; i < gridSize - 1; i++) {
    for (let j = 0; j < gridSize - 1; j++) {
      for (let k = 0; k < gridSize - 1; k++) {
        const idx = (i * gridSize + j) * gridSize + k

        const p0 = gridPoints[idx]
        const p1 = gridPoints[idx + 1]
        const p2 = gridPoints[(i * gridSize + j + 1) * gridSize + k]
        const p3 = gridPoints[((i + 1) * gridSize + j) * gridSize + k]

        if (!p0 || !p1 || !p2 || !p3) continue

        // Create two triangles for each quad
        addTriangle(p0, p1, p2, positions, colors, minVal, valRange)
        addTriangle(p0, p2, p3, positions, colors, minVal, valRange)
      }
    }
  }

  return { positions, colors }
}

function addTriangle(p1, p2, p3, positions, colors, minVal, valRange) {
  const addPoint = (p) => {
    positions.push(p.x, p.y, p.z)
    const norm = (p.value - minVal) / valRange
    const color = getColorForValue(Math.max(0, Math.min(1, norm)))
    colors.push(...color)
  }

  addPoint(p1)
  addPoint(p2)
  addPoint(p3)
}

function interpolateValue(points, lat, lon, depth, variable, k = 4) {
  // K-nearest neighbors with inverse distance weighting
  const distances = points
    .map((p) => {
      const dLat = p.latitude - lat
      const dLon = p.longitude - lon
      const dDepth = (p.depthMeters - depth) / 100 // Scale depth appropriately
      const dist = Math.sqrt(dLat * dLat + dLon * dLon + dDepth * dDepth)
      return {
        dist,
        value: getVariableValue(p, variable),
      }
    })
    .sort((a, b) => a.dist - b.dist)

  const nearest = distances.slice(0, Math.min(k, distances.length))

  // If very close to a point, use that value
  if (nearest[0].dist < 0.0001) {
    return nearest[0].value
  }

  // Inverse distance weighting
  let weightSum = 0
  let valueSum = 0

  nearest.forEach(({ dist, value }) => {
    const weight = 1 / Math.pow(dist + 0.001, 2)
    weightSum += weight
    valueSum += weight * value
  })

  return valueSum / weightSum
}

function getVariableValue(point, variable) {
  switch (variable) {
    case 'temperatureC':
      return point.temperatureC ?? 0
    case 'salinityPsu':
      return point.salinityPsu ?? 0
    case 'currentSpeed':
      return Math.sqrt((point.currentU ?? 0) ** 2 + (point.currentV ?? 0) ** 2)
    case 'chlorophyll':
      return point.chlorophyll ?? 0
    default:
      return point.temperatureC ?? 0
  }
}

function getColorForValue(normalized) {
  // Ensure value is in 0-1 range
  const t = Math.max(0, Math.min(1, normalized))

  if (t < 0.2) {
    // Blue (deep cold)
    return [0.0, 0.0, 0.8]
  } else if (t < 0.4) {
    // Cyan
    const s = (t - 0.2) / 0.2
    return [0.0, 0.5 + s * 0.3, 0.8 - s * 0.2]
  } else if (t < 0.6) {
    // Green
    const s = (t - 0.4) / 0.2
    return [s * 0.4, 0.8 - s * 0.2, 0.6 - s * 0.4]
  } else if (t < 0.8) {
    // Yellow/Orange
    const s = (t - 0.6) / 0.2
    return [0.4 + s * 0.4, 0.6 - s * 0.3, 0.2 - s * 0.2]
  } else {
    // Red (hot)
    const s = (t - 0.8) / 0.2
    return [0.8 + s * 0.2, 0.3 - s * 0.3, 0.0]
  }
}
