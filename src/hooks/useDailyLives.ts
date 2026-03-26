import { useState, useCallback, useEffect, useMemo } from 'react'

const LIVES_KEY = 'grnd_daily_lives'
const MAX_LIVES = 3
const RECHARGE_MS = 2 * 60 * 60 * 1000 // 2 hours per life

interface LivesData {
  usedAt: number[] // timestamps when each life was used
}

function load(): LivesData {
  try {
    const raw = localStorage.getItem(LIVES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.usedAt)) return parsed
    }
  } catch { /* ignore */ }
  return { usedAt: [] }
}

function save(data: LivesData) {
  localStorage.setItem(LIVES_KEY, JSON.stringify(data))
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function useDailyLives() {
  const [data, setData] = useState<LivesData>(load)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const { lives, nextRechargeAt } = useMemo(() => {
    const active = data.usedAt.filter(t => now - t < RECHARGE_MS)
    const lives = MAX_LIVES - active.length
    const nextRechargeAt = active.length > 0 ? Math.min(...active) + RECHARGE_MS : null
    return { lives, nextRechargeAt }
  }, [data, now])

  const useLife = useCallback(() => {
    setData(prev => {
      const next = { usedAt: [...prev.usedAt, Date.now()] }
      save(next)
      return next
    })
  }, [])

  const countdown = nextRechargeAt !== null ? formatCountdown(nextRechargeAt - now) : null

  return { lives, maxLives: MAX_LIVES, canPlay: lives > 0, useLife, countdown }
}
