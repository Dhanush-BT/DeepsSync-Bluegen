import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import apiClient from './api/client'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiClient
      .get('/health')
      .then((response) => setHealth(response.data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <section id="center">
        <h1>DEEPSYNC</h1>
        <p>
          Backend health check:{' '}
          {error && `error — ${error}`}
          {!error && !health && 'loading...'}
          {!error && health && `${health.status} @ ${health.timestamp}`}
        </p>
      </section>

      <div style={{ width: '100%', height: '400px' }}>
        <Canvas camera={{ position: [2, 2, 2] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
          </mesh>
          <OrbitControls />
        </Canvas>
      </div>
    </>
  )
}

export default App
