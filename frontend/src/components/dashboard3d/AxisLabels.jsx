import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

export default function AxisLabels() {
  const { scene } = useThree()

  useEffect(() => {
    const size = 2
    const halfSize = size / 2

    // Create wireframe bounding box
    const boxGeometry = new THREE.BoxGeometry(size, size, size)
    const edges = new THREE.EdgesGeometry(boxGeometry)
    const wireframe = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xcccccc }))
    scene.add(wireframe)

    // Add grid lines on faces
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.3 })

    // Grid on XY plane (longitude-latitude)
    for (let i = 0; i <= 4; i++) {
      const pos = -halfSize + (i / 4) * size

      // Lines parallel to Y (latitude)
      const yGeometry = new THREE.BufferGeometry()
      yGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([pos, -halfSize, halfSize, pos, halfSize, halfSize]), 3
      ))
      scene.add(new THREE.Line(yGeometry, gridMaterial))

      // Lines parallel to X (longitude)
      const xGeometry = new THREE.BufferGeometry()
      xGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([-halfSize, pos, halfSize, halfSize, pos, halfSize]), 3
      ))
      scene.add(new THREE.Line(xGeometry, gridMaterial))
    }

    // Grid on YZ plane (latitude-depth)
    for (let i = 0; i <= 4; i++) {
      const pos = -halfSize + (i / 4) * size

      // Lines parallel to Z (depth)
      const zGeometry = new THREE.BufferGeometry()
      zGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([-halfSize, pos, -halfSize, -halfSize, pos, halfSize]), 3
      ))
      scene.add(new THREE.Line(zGeometry, gridMaterial))

      // Lines parallel to Y (latitude)
      const yGeometry = new THREE.BufferGeometry()
      yGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([-halfSize, -halfSize, pos, -halfSize, halfSize, pos]), 3
      ))
      scene.add(new THREE.Line(yGeometry, gridMaterial))
    }

    return () => {
      scene.remove(wireframe)
    }
  }, [scene])

  return null
}
