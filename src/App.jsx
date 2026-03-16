import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import DeviceManagement from './pages/DeviceManagement'
import DataMonitoring from './pages/DataMonitoring'
import CommandControl from './pages/CommandControl'
import Settings from './pages/Settings'
import ConnectionManager from './pages/ConnectionManager'

function App() {
  console.log('App rendering...')

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/devices" element={<DeviceManagement />} />
          <Route path="/connection" element={<ConnectionManager />} />
          <Route path="/monitoring" element={<DataMonitoring />} />
          <Route path="/control" element={<CommandControl />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
