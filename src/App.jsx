import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Mesocycle from './pages/Mesocycle'
import Upload from './pages/Upload'
import PlayerDetail from './pages/PlayerDetail'
import Settings from './pages/Settings'
import History from './pages/History'
import AnalysisTools from './pages/AnalysisTools'
import PerformanceTesting from './pages/PerformanceTesting'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AuthGuard />}>
        <Route path="/home" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mesocycle" element={<Mesocycle />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/player/:id" element={<PlayerDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history/:id" element={<History />} />
          <Route path="/tools" element={<AnalysisTools />} />
          <Route path="/performance-testing" element={<PerformanceTesting />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
