import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Pages
import Home from './views/Home'
import Login from './views/Login'
import Signup from './views/Signup'
import Dashboard from './views/Dashboard'
import GeoMap from './views/GeoMap'
import DataManager from './views/DataManager'
import ProfileSettings from './views/ProfileSettings'
import AiAssistant from './views/AiAssistant'

// Layout
import Layout from './components/shared/Layout'
import ProtectedRoute from './components/shared/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/geomap" element={<GeoMap />} />
          <Route path="/assistant" element={<AiAssistant />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/datamanager" element={<DataManager />} />
            <Route path="/settings" element={<ProfileSettings />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
