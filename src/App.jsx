import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import GaragePage from './pages/GaragePage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import MaintenancePage from './pages/MaintenancePage'
import RemindersPage from './pages/RemindersPage'
import ProfilePage from './pages/ProfilePage'
import FeedbackPage from './pages/FeedbackPage'
import ContactPage from './pages/ContactPage'
import { Loader2 } from 'lucide-react'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-950">
        <Loader2 className="animate-spin text-mecha" size={32} />
      </div>
    )
  }

  if (!session) return <Navigate to="/connexion" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/garage" element={<GaragePage />} />
        <Route path="/garage/:vehicleId" element={<VehicleDetailPage />} />
        <Route path="/entretiens" element={<MaintenancePage />} />
        <Route path="/rappels" element={<RemindersPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="/avis" element={<FeedbackPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
