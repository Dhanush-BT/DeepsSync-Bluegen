// Domain bounds
export const DOMAIN = {
  lonMin: 70,
  lonMax: 95,
  latMin: -10,
  latMax: 25,
  depthMin: 0,
  depthMax: 2000,
}

// Convert real coordinates to [-1, 1] 3D bounding box
export function toNormalized(lon, lat, depth, vertExag = 1.0) {
  const x = Math.max(-1, Math.min(1, ((lon - DOMAIN.lonMin) / (DOMAIN.lonMax - DOMAIN.lonMin)) * 2 - 1))
  const normY = Math.max(-1, Math.min(1, 1 - (depth / DOMAIN.depthMax) * 2))
  const y = normY * vertExag
  const z = Math.max(-1, Math.min(1, ((lat - DOMAIN.latMin) / (DOMAIN.latMax - DOMAIN.latMin)) * 2 - 1))
  return [x, y, z]
}

/**
 * Generates a SOLID, CONTINUOUS 3D Volumetric Polygonal Mesh with ZERO GAPS.
 * Creates a fully closed, solid 3D tetrahedral/triangular volumetric grid
 * spanning all 6 outer faces and internal volume levels without gaps.
 */
export function generateTriangularMesh(points, selectedVariable, palette = 'turbo', vertExag = 1.0) {
  if (!points || points.length === 0) return { positions: [], colors: [] }

  const values = points
    .map((p) => getVariableValue(p, selectedVariable))
    .filter((v) => v !== null && v !== undefined && isFinite(v))

  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 1
  const valRange = maxVal - minVal || 1

  // Solid 3D volumetric regular grid resolution
  const nx = 14
  const ny = 10
  const nz = 14

  // Spatial binning for ultra-fast sample lookup
  const binMap = new Map()
  for (let p of points) {
    const bx = Math.floor(((p.longitude - DOMAIN.lonMin) / 25) * nx)
    const bz = Math.floor(((p.latitude - DOMAIN.latMin) / 35) * nz)
    const key = `${bx}_${bz}`
    if (!binMap.has(key)) binMap.set(key, [])
    binMap.get(key).push(p)
  }

  const sampleValue = (targetLon, targetLat, targetDepth) => {
    const bx = Math.floor(((targetLon - DOMAIN.lonMin) / 25) * nx)
    const bz = Math.floor(((targetLat - DOMAIN.latMin) / 35) * nz)
    
    let bestDist = Infinity
    let bestVal = (minVal + maxVal) / 2

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const bucket = binMap.get(`${bx + dx}_${bz + dz}`)
        if (!bucket) continue
        for (let pt of bucket) {
          const dLon = pt.longitude - targetLon
          const dLat = pt.latitude - targetLat
          const dDepth = (pt.depthMeters - targetDepth) / 100
          const dist = dLon * dLon + dLat * dLat + dDepth * dDepth
          if (dist < bestDist) {
            bestDist = dist
            bestVal = getVariableValue(pt, selectedVariable)
          }
        }
      }
    }
    return bestVal
  }

  // Pre-calculate 3D vertex grid
  const grid = new Array(ny)
  for (let iy = 0; iy < ny; iy++) {
    grid[iy] = new Array(nz)
    const depth = (iy / (ny - 1)) * DOMAIN.depthMax
    const normY = (1 - (depth / DOMAIN.depthMax) * 2) * vertExag

    for (let iz = 0; iz < nz; iz++) {
      grid[iy][iz] = new Array(nx)
      const lat = DOMAIN.latMin + (iz / (nz - 1)) * 35
      const z = (iz / (nz - 1)) * 2 - 1

      for (let ix = 0; ix < nx; ix++) {
        const lon = DOMAIN.lonMin + (ix / (nx - 1)) * 25
        const x = (ix / (nx - 1)) * 2 - 1
        const val = sampleValue(lon, lat, depth)
        const norm = (val - minVal) / valRange
        const rgb = getColorForValue(norm, palette)

        grid[iy][iz][ix] = { x, y: normY, z, rgb }
      }
    }
  }

  const positions = []
  const colors = []

  const addTri = (p1, p2, p3) => {
    positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z)
    colors.push(...p1.rgb, ...p2.rgb, ...p3.rgb)
  }

  const addQuad = (p00, p10, p11, p01) => {
    addTri(p00, p10, p11)
    addTri(p00, p11, p01)
  }

  // 1. Solid Exterior Boundary Faces (Top, Bottom, Front, Back, Left, Right)
  // Top Face (surface, iy = 0)
  for (let iz = 0; iz < nz - 1; iz++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      addQuad(grid[0][iz][ix], grid[0][iz][ix + 1], grid[0][iz + 1][ix + 1], grid[0][iz + 1][ix])
    }
  }

  // Bottom Face (abyssal floor, iy = ny - 1)
  for (let iz = 0; iz < nz - 1; iz++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      addQuad(grid[ny - 1][iz][ix], grid[ny - 1][iz + 1][ix], grid[ny - 1][iz + 1][ix + 1], grid[ny - 1][iz][ix + 1])
    }
  }

  // Front Face (+Z, iz = nz - 1)
  for (let iy = 0; iy < ny - 1; iy++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      addQuad(grid[iy][nz - 1][ix], grid[iy][nz - 1][ix + 1], grid[iy + 1][nz - 1][ix + 1], grid[iy + 1][nz - 1][ix])
    }
  }

  // Back Face (-Z, iz = 0)
  for (let iy = 0; iy < ny - 1; iy++) {
    for (let ix = 0; ix < nx - 1; ix++) {
      addQuad(grid[iy][0][ix], grid[iy + 1][0][ix], grid[iy + 1][0][ix + 1], grid[iy][0][ix + 1])
    }
  }

  // Right Face (+X, ix = nx - 1)
  for (let iy = 0; iy < ny - 1; iy++) {
    for (let iz = 0; iz < nz - 1; iz++) {
      addQuad(grid[iy][iz][nx - 1], grid[iy + 1][iz][nx - 1], grid[iy + 1][iz + 1][nx - 1], grid[iy][iz + 1][nx - 1])
    }
  }

  // Left Face (-X, ix = 0)
  for (let iy = 0; iy < ny - 1; iy++) {
    for (let iz = 0; iz < nz - 1; iz++) {
      addQuad(grid[iy][iz][0], grid[iy][iz + 1][0], grid[iy + 1][iz + 1][0], grid[iy + 1][iz][0])
    }
  }

  // 2. Continuous Internal Depth Slices across volume (no gaps)
  for (let iy = 1; iy < ny - 1; iy++) {
    for (let iz = 0; iz < nz - 1; iz++) {
      for (let ix = 0; ix < nx - 1; ix++) {
        addQuad(grid[iy][iz][ix], grid[iy][iz][ix + 1], grid[iy][iz + 1][ix + 1], grid[iy][iz + 1][ix])
      }
    }
  }

  return { positions, colors }
}

/**
 * Generates a SEAMLESS, CONTINUOUS 3D Cubic Voxel Grid with ZERO GAPS.
 * Adjacent voxels share boundary planes with scale = 1.0 (no spacing gaps).
 */
export function generateCubicMesh(points, selectedVariable, palette = 'turbo', vertExag = 1.0) {
  if (!points || points.length === 0) return { positions: [], colors: [] }

  const values = points
    .map((p) => getVariableValue(p, selectedVariable))
    .filter((v) => v !== null && v !== undefined && isFinite(v))

  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 1
  const valRange = maxVal - minVal || 1

  // Dense contiguous voxel grid filling the entire volume with ZERO gaps
  const numX = 12
  const numY = 10
  const numZ = 12

  // Binning for fast query
  const binMap = new Map()
  for (let p of points) {
    const bx = Math.floor(((p.longitude - DOMAIN.lonMin) / 25) * numX)
    const bz = Math.floor(((p.latitude - DOMAIN.latMin) / 35) * numZ)
    const key = `${bx}_${bz}`
    if (!binMap.has(key)) binMap.set(key, [])
    binMap.get(key).push(p)
  }

  const sampleValue = (targetLon, targetLat, targetDepth) => {
    const bx = Math.floor(((targetLon - DOMAIN.lonMin) / 25) * numX)
    const bz = Math.floor(((targetLat - DOMAIN.latMin) / 35) * numZ)
    
    let bestDist = Infinity
    let bestVal = (minVal + maxVal) / 2

    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const bucket = binMap.get(`${bx + dx}_${bz + dz}`)
        if (!bucket) continue
        for (let pt of bucket) {
          const dLon = pt.longitude - targetLon
          const dLat = pt.latitude - targetLat
          const dDepth = (pt.depthMeters - targetDepth) / 100
          const dist = dLon * dLon + dLat * dLat + dDepth * dDepth
          if (dist < bestDist) {
            bestDist = dist
            bestVal = getVariableValue(pt, selectedVariable)
          }
        }
      }
    }
    return bestVal
  }

  const positions = []
  const colors = []

  // Voxel half-extents (1.0 scale: perfectly flush with neighboring voxels, zero gaps)
  const hx = 1.0 / numX
  const hz = 1.0 / numZ
  const hy = (1.0 / numY) * vertExag

  const cubeOffsets = [
    // Front (+Z)
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, -1, 1], [1, 1, 1], [-1, 1, 1],
    // Back (-Z)
    [1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
    // Top (+Y)
    [-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, 1], [1, 1, -1], [-1, 1, -1],
    // Bottom (-Y)
    [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, -1], [1, -1, 1], [-1, -1, 1],
    // Right (+X)
    [1, -1, 1], [1, -1, -1], [1, 1, -1], [1, -1, 1], [1, 1, -1], [1, 1, 1],
    // Left (-X)
    [-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, -1, -1], [-1, 1, 1], [-1, 1, -1],
  ]

  for (let iy = 0; iy < numY; iy++) {
    const depth = ((iy + 0.5) / numY) * DOMAIN.depthMax
    const cy = (1 - ((iy + 0.5) / numY) * 2) * vertExag

    for (let iz = 0; iz < numZ; iz++) {
      const lat = DOMAIN.latMin + ((iz + 0.5) / numZ) * 35
      const cz = ((iz + 0.5) / numZ) * 2 - 1

      for (let ix = 0; ix < numX; ix++) {
        const lon = DOMAIN.lonMin + ((ix + 0.5) / numX) * 25
        const cx = ((ix + 0.5) / numX) * 2 - 1

        const val = sampleValue(lon, lat, depth)
        const norm = (val - minVal) / valRange
        const rgb = getColorForValue(norm, palette)

        for (let v = 0; v < 36; v++) {
          const [ox, oy, oz] = cubeOffsets[v]
          positions.push(cx + ox * hx, cy + oy * hy, cz + oz * hz)
          colors.push(rgb[0], rgb[1], rgb[2])
        }
      }
    }
  }

  return { positions, colors }
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

export function getVariableValue(point, variable) {
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

export function getColorForValue(normalized, palette = 'turbo') {
  // Ensure value is in 0-1 range
  const t = Math.max(0, Math.min(1, normalized))

  switch (palette) {
    case 'viridis': {
      // Perceptually uniform Viridis: Purple -> Blue -> Green -> Yellow
      if (t < 0.25) {
        const s = t / 0.25
        return [0.27 + s * -0.1, 0.0 + s * 0.25, 0.33 + s * 0.3] // dark purple to indigo
      } else if (t < 0.5) {
        const s = (t - 0.25) / 0.25
        return [0.17 + s * -0.05, 0.25 + s * 0.35, 0.63 + s * -0.15] // indigo to teal
      } else if (t < 0.75) {
        const s = (t - 0.5) / 0.25
        return [0.12 + s * 0.45, 0.60 + s * 0.25, 0.48 + s * -0.3] // teal to light green
      } else {
        const s = (t - 0.75) / 0.25
        return [0.57 + s * 0.4, 0.85 + s * 0.12, 0.18 + s * -0.05] // light green to yellow
      }
    }

    case 'spectral': {
      // Diverging Spectral: Cool Blue -> Cyan/Green -> Yellow -> Orange -> Deep Red (Low=Blue, High=Red)
      if (t < 0.2) {
        const s = t / 0.2
        return [0.17 + s * 0.1, 0.51 + s * 0.35, 0.73 - s * 0.1] // blue to cyan
      } else if (t < 0.4) {
        const s = (t - 0.2) / 0.2
        return [0.27 + s * 0.4, 0.86 - s * 0.05, 0.63 - s * 0.35] // cyan to green-yellow
      } else if (t < 0.6) {
        const s = (t - 0.4) / 0.2
        return [0.67 + s * 0.32, 0.81 + s * 0.18, 0.28 - s * 0.15] // green-yellow to yellow
      } else if (t < 0.8) {
        const s = (t - 0.6) / 0.2
        return [0.99 - s * 0.05, 0.99 - s * 0.45, 0.13 + s * 0.05] // yellow to orange
      } else {
        const s = (t - 0.8) / 0.2
        return [0.94 - s * 0.1, 0.54 - s * 0.35, 0.18 - s * 0.05] // orange to deep red
      }
    }

    case 'deepsea': {
      // Bathymetric: Midnight Navy -> Deep Azure -> Cyan -> Pale Ice
      if (t < 0.3) {
        const s = t / 0.3
        return [0.03 + s * 0.05, 0.08 + s * 0.2, 0.25 + s * 0.4] // abyss navy to deep azure
      } else if (t < 0.7) {
        const s = (t - 0.3) / 0.4
        return [0.08 + s * 0.05, 0.28 + s * 0.45, 0.65 + s * 0.25] // azure to cyan
      } else {
        const s = (t - 0.7) / 0.3
        return [0.13 + s * 0.7, 0.73 + s * 0.22, 0.90 + s * 0.08] // cyan to pale ice
      }
    }

    case 'turbo':
    default: {
      // Oceanic Thermal (Turbo-derived)
      if (t < 0.2) {
        return [0.15, 0.2, 0.85] // deep cold blue
      } else if (t < 0.4) {
        const s = (t - 0.2) / 0.2
        return [0.1, 0.5 + s * 0.35, 0.85 - s * 0.25] // cyan
      } else if (t < 0.6) {
        const s = (t - 0.4) / 0.2
        return [0.15 + s * 0.5, 0.85 - s * 0.1, 0.6 - s * 0.4] // green to amber
      } else if (t < 0.8) {
        const s = (t - 0.6) / 0.2
        return [0.65 + s * 0.3, 0.75 - s * 0.4, 0.2 - s * 0.2] // orange
      } else {
        const s = (t - 0.8) / 0.2
        return [0.95, 0.35 - s * 0.3, 0.05] // hot red
      }
    }
  }
}
