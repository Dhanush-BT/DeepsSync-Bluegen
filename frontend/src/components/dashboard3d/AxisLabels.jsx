import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

export default function AxisLabels() {
  const { scene } = useThree()

  useEffect(() => {
    // Create axes
    const axesLength = 2.5

    // X-axis (Longitude) - Red
    const xGeometry = new THREE.BufferGeometry()
    xGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, axesLength, 0, 0]), 3))
    const xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 })
    const xLine = new THREE.Line(xGeometry, xMaterial)

    // Y-axis (Latitude) - Green
    const yGeometry = new THREE.BufferGeometry()
    yGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, axesLength, 0]), 3))
    const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
    const yLine = new THREE.Line(yGeometry, yMaterial)

    // Z-axis (Depth) - Blue
    const zGeometry = new THREE.BufferGeometry()
    zGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0, 0, 0, axesLength]), 3))
    const zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 })
    const zLine = new THREE.Line(zGeometry, zMaterial)

    scene.add(xLine, yLine, zLine)

    // Create tick marks and labels using canvas texture
    const createTextTexture = (text) => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 128, 32)

      const texture = new THREE.CanvasTexture(canvas)
      return texture
    }

    // X-axis (Longitude) label
    const xLabelGeometry = new THREE.PlaneGeometry(0.6, 0.2)
    const xLabelMaterial = new THREE.MeshBasicMaterial({
      map: createTextTexture('Longitude'),
      transparent: true,
    })
    const xLabel = new THREE.Mesh(xLabelGeometry, xLabelMaterial)
    xLabel.position.set(1.3, -0.3, 0)
    xLabel.renderOrder = 100
    scene.add(xLabel)

    // Y-axis (Latitude) label
    const yLabelGeometry = new THREE.PlaneGeometry(0.6, 0.2)
    const yLabelMaterial = new THREE.MeshBasicMaterial({
      map: createTextTexture('Latitude'),
      transparent: true,
    })
    const yLabel = new THREE.Mesh(yLabelGeometry, yLabelMaterial)
    yLabel.position.set(-0.5, 1.3, 0)
    yLabel.renderOrder = 100
    scene.add(yLabel)

    // Z-axis (Depth) label
    const zLabelGeometry = new THREE.PlaneGeometry(0.5, 0.2)
    const zLabelMaterial = new THREE.MeshBasicMaterial({
      map: createTextTexture('Depth'),
      transparent: true,
    })
    const zLabel = new THREE.Mesh(zLabelGeometry, zLabelMaterial)
    zLabel.position.set(0.3, -0.3, 1.3)
    zLabel.renderOrder = 100
    scene.add(zLabel)

    // Add tick marks on axes
    const tickSize = 0.05
    const tickMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc })

    // Ticks on X-axis (5 ticks)
    for (let i = 0; i <= 5; i++) {
      const x = (i / 5) * axesLength
      const tickGeometry = new THREE.BufferGeometry()
      tickGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([x, 0, 0, x, -tickSize, 0]), 3
      ))
      const tick = new THREE.Line(tickGeometry, tickMaterial)
      scene.add(tick)
    }

    // Ticks on Y-axis (5 ticks)
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * axesLength
      const tickGeometry = new THREE.BufferGeometry()
      tickGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([0, y, 0, -tickSize, y, 0]), 3
      ))
      const tick = new THREE.Line(tickGeometry, tickMaterial)
      scene.add(tick)
    }

    // Ticks on Z-axis (5 ticks)
    for (let i = 0; i <= 5; i++) {
      const z = (i / 5) * axesLength
      const tickGeometry = new THREE.BufferGeometry()
      tickGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([0, 0, z, 0, -tickSize, z]), 3
      ))
      const tick = new THREE.Line(tickGeometry, tickMaterial)
      scene.add(tick)
    }

    return () => {
      scene.remove(xLine, yLine, zLine, xLabel, yLabel, zLabel)
    }
  }, [scene])

  return null
}
