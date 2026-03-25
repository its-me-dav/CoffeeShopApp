import { createContext, useContext, useState } from 'react'

export interface GrndUser {
  name: string
  email: string
  points: number
  streak: number
  maxStreak: number
  nextReward: number
  tier: string
}

interface AuthCtx {
  user: GrndUser | null
  login: (email: string, password: string) => void
  logout: () => void
  addPoints: (pts: number) => void
}

const DEMO_USER: GrndUser = {
  name: 'Alex Rivera',
  email: 'alex@grnd.coffee',
  points: 2450,
  streak: 7,
  maxStreak: 10,
  nextReward: 3000,
  tier: 'Premium Member',
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GrndUser | null>(() => {
    try {
      const s = localStorage.getItem('grnd_auth')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const persist = (u: GrndUser | null) => {
    setUser(u)
    if (u) localStorage.setItem('grnd_auth', JSON.stringify(u))
    else localStorage.removeItem('grnd_auth')
  }

  const login = (email: string) => {
    persist({ ...DEMO_USER, email })
  }

  const logout = () => persist(null)

  const addPoints = (pts: number) => {
    setUser(prev => {
      if (!prev) return prev
      const updated = { ...prev, points: prev.points + pts }
      localStorage.setItem('grnd_auth', JSON.stringify(updated))
      return updated
    })
  }

  return <Ctx.Provider value={{ user, login, logout, addPoints }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
