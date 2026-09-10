// 3D Grid creation and interpolation utilities for volumetric rendering

export function createGrid(points, selectedVariable, gridSize = 15) {
  if (points.length === 0) return null

  // Get bounds
  const lats = points.map(p => p.latitude)
  const lons = points.map(p => p.longitude)
  const depths = points.map(p => p.depthMeters)

  const latMin = Math.min(...lats), latMax = Math.max(...lats)
  const lonMin = Math.min(...lons), lonMax = Math.max(...lons)
  const depthMin = Math.min(...depths), depthMax = Math.max(...depths)

  const latStep = (latMax - latMin) / (gridSize - 1) || 1
  const lonStep = (lonMax - lonMin) / (gridSize - 1) || 1
  const depthStep = (depthMax - depthMin) / (gridSize - 1) || 1

  const grid = []

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      for (let k = 0; k < gridSize; k++) {
        const lat = latMin + i * latStep
        const lon = lonMin + j * lonStep
        const depth = depthMin + k * depthStep

        // Inverse distance weighting for interpolation
        const value = interpolateValue(points, lat, lon, depth, selectedVariable)

        grid.push({
          x: (lon - lonMin) / (lonMax - lonMin || 1) * 2 - 1,
          y: (lat - latMin) / (latMax - latMin || 1) * 2 - 1,
          z: -(depth - depthMin) / (depthMax - depthMin || 1) * 2,
          value: value,
        })
      }
    }
  }

  return {
    grid,
    gridSize,
    bounds: { latMin, latMax, lonMin, lonMax, depthMin, depthMax },
  }
}

function getVariableValue(point, variable) {
  switch (variable) {
    case 'temperatureC':
      return point.temperatureC
    case 'salinityPsu':
      return point.salinityPsu
    case 'currentSpeed':
      return Math.sqrt((point.currentU || 0) ** 2 + (point.currentV || 0) ** 2)
    case 'chlorophyll':
      return point.chlorophyll
    default:
      return point.temperatureC
  }
}

function interpolateValue(points, lat, lon, depth, variable, k = 5) {
  // K-nearest neighbors inverse distance weighting
  const distances = points.map((p, idx) => ({
    dist: Math.sqrt((p.latitude - lat) ** 2 + (p.longitude - lon) ** 2 + (p.depthMeters - depth) ** 2 / 100000),
    value: getVariableValue(p, variable),
    idx,
  }))

  distances.sort((a, b) => a.dist - b.dist)

  const nearest = distances.slice(0, Math.min(k, distances.length))

  if (nearest.some(n => n.dist < 0.001)) {
    return nearest.find(n => n.dist < 0.001).value
  }

  let weightSum = 0
  let valueSum = 0

  nearest.forEach(({ dist, value }) => {
    const weight = 1 / (dist + 0.01)
    weightSum += weight
    valueSum += weight * value
  })

  return valueSum / weightSum
}

export function generateIsosurfaceMesh(grid, gridSize, isoValue = null) {
  if (!grid || grid.length === 0) return null

  const positions = []
  const colors = []

  // Simple surface extraction: create faces for points above threshold
  const threshold = isoValue !== null ? isoValue : calculateMedian(grid.map(p => p.value))

  // Create triangles for surface
  for (let i = 0; i < gridSize - 1; i++) {
    for (let j = 0; j < gridSize - 1; j++) {
      for (let k = 0; k < gridSize - 1; k++) {
        const idx = (i * gridSize + j) * gridSize + k

        if (idx >= grid.length - 1) continue

        const p0 = grid[idx]
        const p1 = grid[idx + 1]
        const p2 = grid[idx + gridSize]
        const p3 = grid[idx + gridSize + 1]

        // Create surface triangles where value crosses threshold
        if ((p0.value - threshold) * (p1.value - threshold) <= 0) {
          addSurfaceTriangle(p0, p1, positions, colors)
        }
        if ((p0.value - threshold) * (p2.value - threshold) <= 0) {
          addSurfaceTriangle(p0, p2, positions, colors)
        }
      }
    }
  }

  return { positions, colors }
}

function addSurfaceTriangle(p1, p2, positions, colors) {
  const normalizeColor = (val, min = 5, max = 30) => {
    const norm = Math.max(0, Math.min(1, (val - min) / (max - min)))
    return getColorForValue(norm)
  }

  const color1 = normalizeColor(p1.value)
  const color2 = normalizeColor(p2.value)

  positions.push(p1.x, p1.y, p1.z)
  colors.push(...color1)

  positions.push(p2.x, p2.y, p2.z)
  colors.push(...color2)

  // Add a third point for triangle
  const midpoint = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2,
  }
  const midColor = normalizeColor((p1.value + p2.value) / 2)

  positions.push(midpoint.x, midpoint.y, midpoint.z)
  colors.push(...midColor)
}

function getColorForValue(normalized) {
  if (normalized < 0.25) {
    const t = normalized / 0.25
    return [0.0, 0.3 + t * 0.3, 0.8]
  } else if (normalized < 0.5) {
    const t = (normalized - 0.25) / 0.25
    return [0.0, 0.6 + t * 0.2, 0.8 - t * 0.3]
  } else if (normalized < 0.75) {
    const t = (normalized - 0.5) / 0.25
    return [0.0 + t * 0.5, 0.8 - t * 0.2, 0.5 - t * 0.3]
  } else {
    const t = (normalized - 0.75) / 0.25
    return [0.5 + t * 0.5, 0.6 - t * 0.3, 0.2]
  }
}

function calculateMedian(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

export function generateVolumeSurface(points, selectedVariable, gridSize = 12) {
  const gridData = createGrid(points, selectedVariable, gridSize)
  if (!gridData) return null

  const surfaceData = generateIsosurfaceMesh(gridData.grid, gridSize)
  return surfaceData
}
