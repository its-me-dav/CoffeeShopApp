import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Home from '@/screens/Home'
import Card from '@/screens/Card'
import Game from '@/screens/Game'
import Leaderboard from '@/screens/Leaderboard'
import Login from '@/screens/Login'
import BottomNav from '@/components/layout/BottomNav'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/card" element={<RequireAuth><Card /></RequireAuth>} />
          <Route path="/game" element={<RequireAuth><Game /></RequireAuth>} />
          <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
