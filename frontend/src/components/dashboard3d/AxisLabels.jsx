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

    // Helper function to create text sprite
    const createTextSprite = (text, size = 0.3) => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 128, 32)

      const texture = new THREE.CanvasTexture(canvas)
      const geometry = new THREE.PlaneGeometry(size, size / 4)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      })
      return new THREE.Mesh(geometry, material)
    }

    // LONGITUDE labels (top and bottom)
    const lonLabels = ['75', '80', '85', '90', '95']
    lonLabels.forEach((label, i) => {
      const x = -halfSize + (i / 4) * size

      // Top
      const topSprite = createTextSprite(label, 0.25)
      topSprite.position.set(x, halfSize + 0.3, 0)
      topSprite.renderOrder = 100
      scene.add(topSprite)

      // Bottom
      const bottomSprite = createTextSprite(label, 0.25)
      bottomSprite.position.set(x, -halfSize - 0.3, 0)
      bottomSprite.renderOrder = 100
      scene.add(bottomSprite)
    })

    // LATITUDE labels (front and back)
    const latLabels = ['10', '0', '-10', '-50', '-100']
    latLabels.forEach((label, i) => {
      const y = halfSize - (i / 4) * size

      // Front
      const frontSprite = createTextSprite(label, 0.25)
      frontSprite.position.set(-halfSize - 0.35, y, halfSize + 0.15)
      frontSprite.lookAt(scene.position)
      frontSprite.renderOrder = 100
      scene.add(frontSprite)

      // Back
      const backSprite = createTextSprite(label, 0.25)
      backSprite.position.set(halfSize + 0.35, y, -halfSize - 0.15)
      backSprite.lookAt(scene.position)
      backSprite.renderOrder = 100
      scene.add(backSprite)
    })

    // DEPTH labels (left and right sides)
    const depthLabels = ['0', '50', '100', '150', '200']
    depthLabels.forEach((label, i) => {
      const z = halfSize - (i / 4) * size

      // Left side
      const leftSprite = createTextSprite(label, 0.25)
      leftSprite.position.set(-halfSize - 0.35, -0.3, z)
      leftSprite.lookAt(scene.position)
      leftSprite.renderOrder = 100
      scene.add(leftSprite)

      // Right side
      const rightSprite = createTextSprite(label, 0.25)
      rightSprite.position.set(halfSize + 0.35, -0.3, z)
      rightSprite.lookAt(scene.position)
      rightSprite.renderOrder = 100
      scene.add(rightSprite)
    })

    // Add axis title labels
    const titleSize = 0.4

    // "Longitude" on top
    const lonTitle = createTextSprite('Longitude', titleSize)
    lonTitle.position.set(0, halfSize + 0.6, 0)
    lonTitle.renderOrder = 100
    scene.add(lonTitle)

    // "Latitude" on left
    const latTitle = createTextSprite('Latitude', titleSize)
    latTitle.position.set(-halfSize - 0.7, halfSize + 0.2, 0)
    latTitle.lookAt(scene.position)
    latTitle.renderOrder = 100
    scene.add(latTitle)

    // "Depth" on right
    const depthTitle = createTextSprite('Depth', titleSize)
    depthTitle.position.set(halfSize + 0.7, 0, 0)
    depthTitle.lookAt(scene.position)
    depthTitle.renderOrder = 100
    scene.add(depthTitle)

    // Add detailed rulers with more tick marks
    const smallTickMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 })

    // Longitude ruler (top) - more detailed
    for (let i = 0; i <= 20; i++) {
      const pos = -halfSize + (i / 20) * size
      const tickLength = i % 4 === 0 ? 0.08 : 0.04

      const tickGeometry = new THREE.BufferGeometry()
      tickGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([pos, halfSize, halfSize, pos, halfSize + tickLength, halfSize]), 3
      ))
      scene.add(new THREE.Line(tickGeometry, smallTickMaterial))
    }

    // Depth ruler (left side) - more detailed
    for (let i = 0; i <= 20; i++) {
      const pos = halfSize - (i / 20) * size
      const tickLength = i % 4 === 0 ? 0.08 : 0.04

      const tickGeometry = new THREE.BufferGeometry()
      tickGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([-halfSize, -0.3, pos, -halfSize - tickLength, -0.3, pos]), 3
      ))
      scene.add(new THREE.Line(tickGeometry, smallTickMaterial))
    }

    // Latitude ruler (front) - more detailed
    for (let i = 0; i <= 20; i++) {
      const pos = halfSize - (i / 20) * size
      const tickLength = i % 4 === 0 ? 0.08 : 0.04

      const tickGeometry = new THREE.BufferGeometry()
      tickGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([-halfSize, pos, halfSize, -halfSize - tickLength, pos, halfSize]), 3
      ))
      scene.add(new THREE.Line(tickGeometry, smallTickMaterial))
    }

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
