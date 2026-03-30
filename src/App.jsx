import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/useAuth'
import Layout from './components/Layout'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Map from './pages/Map'
import Shelters from './pages/Shelters'
import Reminders from './pages/Reminders'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-dark text-white">Učitavanje...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Javne rute */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Zaštićene rute */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Feed />} />
          <Route path="profil" element={<Profile />} />
          <Route path="mapa" element={<Map />} />
          <Route path="azili" element={<Shelters />} />
          <Route path="podsjetnici" element={<Reminders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
