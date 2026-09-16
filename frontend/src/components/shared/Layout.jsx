import { Outlet } from 'react-router-dom'
import Navbar from '../home/Navbar'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen deepsync-page-bg relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* Layered Decorative Glow Elements */}
      <div className="deepsync-glow-top-left" aria-hidden="true"></div>
      <div className="deepsync-glow-middle-right" aria-hidden="true"></div>
      <div className="deepsync-glow-bottom-left" aria-hidden="true"></div>

      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
