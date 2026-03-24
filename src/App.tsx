import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/screens/Home'
import Card from '@/screens/Card'
import Game from '@/screens/Game'
import Leaderboard from '@/screens/Leaderboard'
import BottomNav from '@/components/layout/BottomNav'

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/card" element={<Card />} />
          <Route path="/game" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
