import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
// Replace shop.svg with your own image (photo or illustration) at any time
import shopImg from '@/assets/images/shop.svg'

// ─── Types ───────────────────────────────────────────────────────────────────

type GamePhase = 'idle' | 'playing' | 'gameover'

interface Player {
  x: number; y: number
  vx: number; vy: number
  w: number; h: number
}

interface Platform {
  id: number; x: number; y: number; width: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAVITY     = 0.38
const JUMP_VY     = -13.5
const PW          = 42
const PH          = 50
const PLH         = 13
const MAX_VX      = 7
const TILT_MULT   = 0.18    // was 0.45 — much less sensitive
const TILT_DEAD   = 4       // degrees dead zone before tilt kicks in, was 1.5
const PB_KEY      = 'grnd_jump_pb'
const WEEKLY_HIGH = 3_280

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function rr(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }
}

function drawBean(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  squish = 1, vy = 0,
) {
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.scale(1 + (1 - squish) * 0.25, squish)

  ctx.beginPath()
  ctx.ellipse(0, 2, w * 0.44, h * 0.4, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#6B4423'
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(-w * 0.12, -h * 0.1, w * 0.13, h * 0.09, -0.4, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, -h * 0.34)
  ctx.bezierCurveTo(w * 0.19, -h * 0.08, w * 0.19, h * 0.08, 0, h * 0.34)
  ctx.strokeStyle = '#3D2510'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.stroke()

  ;([-1, 1] as const).forEach(side => {
    ctx.beginPath()
    ctx.ellipse(side * w * 0.14, -h * 0.05, 3.5, 4.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(side * w * 0.14, -h * 0.03, 2, 3, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#1A1A1A'
    ctx.fill()
  })

  ctx.beginPath()
  ctx.arc(0, h * 0.1, w * 0.1, 0.3, Math.PI - 0.3)
  ctx.strokeStyle = '#3D2510'
  ctx.lineWidth = 2
  ctx.stroke()

  const armsUp = vy < -3
  ctx.strokeStyle = '#6B4423'
  ctx.lineWidth = 4.5
  ctx.lineCap = 'round'
  ;([-1, 1] as const).forEach(side => {
    const angle = armsUp ? -0.75 : 0.35
    ctx.beginPath()
    ctx.moveTo(side * w * 0.4, 0)
    ctx.lineTo(
      side * (w * 0.4 + Math.cos(angle) * 13),
      -Math.sin(angle) * 13,
    )
    ctx.stroke()
  })

  ;([-1, 1] as const).forEach(side => {
    ctx.beginPath()
    ctx.moveTo(side * w * 0.18, h * 0.36)
    ctx.lineTo(side * w * 0.28, h * 0.52)
    ctx.stroke()
  })

  ctx.restore()
}

function drawPlatform(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
) {
  ctx.save()
  ctx.beginPath()
  rr(ctx, x, y, w, PLH, 7)
  ctx.fillStyle = '#1A1A1A'
  ctx.fill()
  ctx.restore()
}

function drawShop(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
) {
  if (h <= 10) return
  ctx.save()
  ctx.translate(x, y)

  ctx.fillStyle = '#F5F4EF'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, w - 2, h - 2)

  const aw = h * 0.27
  ctx.fillStyle = '#1A1A1A'
  ctx.fillRect(-2, 0, w + 4, aw)

  ctx.fillStyle = 'white'
  const sc = 7
  const sw = w / sc
  for (let i = 0; i < sc; i += 2) {
    ctx.fillRect(i * sw, 0, sw * 0.55, aw - 2)
  }

  ctx.fillStyle = '#1A1A1A'
  ctx.beginPath()
  ctx.moveTo(-4, aw - 2)
  const scCount = 7
  const scW = (w + 8) / scCount
  for (let i = 0; i <= scCount; i++) {
    ctx.arc(i * scW - 4, aw, scW / 2, Math.PI, 0, true)
  }
  ctx.lineTo(w + 4, aw - 2)
  ctx.closePath()
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#1A1A1A'
  ctx.font = `bold ${Math.max(h * 0.16, 12)}px Geist Variable, sans-serif`
  ctx.fillText('GRND', w / 2, aw + h * 0.21)
  ctx.fillStyle = '#8A8A8E'
  ctx.font = `${Math.max(h * 0.09, 8)}px Geist Variable, sans-serif`
  ctx.fillText('COFFEE', w / 2, aw + h * 0.33)

  const dw = w * 0.26, dh = h * 0.36
  const dx = (w - dw) / 2, dy = h - dh
  ctx.fillStyle = '#1C1C1E'
  ctx.beginPath()
  rr(ctx, dx, dy, dw, dh, 4)
  ctx.fill()

  const ww = w * 0.2, wh = h * 0.18, wy = aw + h * 0.36
  ctx.fillStyle = '#D4EAF0'
  ctx.strokeStyle = '#1A1A1A'
  ctx.lineWidth = 1.5
  ;[w * 0.07, w - w * 0.07 - ww].forEach(wx => {
    ctx.beginPath()
    rr(ctx, wx, wy, ww, wh, 2)
    ctx.fill()
    ctx.stroke()
  })

  ctx.restore()
}

// ─── Platform factory ─────────────────────────────────────────────────────────

function makePlatforms(W: number, H: number, idRef: { current: number }): Platform[] {
  const plats: Platform[] = []
  plats.push({ id: idRef.current++, x: W / 2 - 55, y: H - 170, width: 110 })
  let topY = H - 170
  for (let i = 0; i < 9; i++) {
    const w = 70 + Math.random() * 45
    const x = 10 + Math.random() * (W - w - 20)
    topY -= 85 + Math.random() * 35
    plats.push({ id: idRef.current++, x, y: topY, width: w })
  }
  return plats
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Game() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const phaseRef     = useRef<GamePhase>('idle')
  const playerRef    = useRef<Player>({ x: 0, y: 0, vx: 0, vy: 0, w: PW, h: PH })
  const platformsRef = useRef<Platform[]>([])
  const scoreRef     = useRef(0)
  const cameraRef    = useRef(0)
  const rafRef       = useRef(0)
  const tiltRef      = useRef(0)
  const keysRef      = useRef({ left: false, right: false })
  const squishRef    = useRef(1)
  const platIdRef    = useRef(0)

  const [phase, setPhase]               = useState<GamePhase>('idle')
  const [displayScore, setDisplayScore] = useState(0)
  const [finalScore, setFinalScore]     = useState(0)
  const [personalBest, setPersonalBest] = useState(() =>
    parseInt(localStorage.getItem(PB_KEY) || '0', 10)
  )

  // ── Canvas sizing — uses full viewport (canvas is fixed inset-0) ────────────

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = window.innerWidth
    const h = window.innerHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w
      canvas.height = h
    }
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    window.addEventListener('resize', sizeCanvas)
    return () => window.removeEventListener('resize', sizeCanvas)
  }, [phase, sizeCanvas])

  // ── Keyboard fallback ──────────────────────────────────────────────────────

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a') keysRef.current.left  = true
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true
    }
    const ku = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a') keysRef.current.left  = false
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false
    }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup',   ku)
    return () => {
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup',   ku)
    }
  }, [])

  // ── Touch controls (tap left / right half to steer) ───────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onTouch = (e: TouchEvent) => {
      if (phaseRef.current !== 'playing') return
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const tx   = e.touches[0].clientX - rect.left
      keysRef.current.left  = tx < canvas.width / 2
      keysRef.current.right = tx >= canvas.width / 2
    }
    const onEnd = () => { keysRef.current.left = false; keysRef.current.right = false }
    canvas.addEventListener('touchstart', onTouch, { passive: false })
    canvas.addEventListener('touchmove',  onTouch, { passive: false })
    canvas.addEventListener('touchend',   onEnd)
    return () => {
      canvas.removeEventListener('touchstart', onTouch)
      canvas.removeEventListener('touchmove',  onTouch)
      canvas.removeEventListener('touchend',   onEnd)
    }
  }, [])

  // ── Device orientation (tilt) ──────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma != null) tiltRef.current = e.gamma
    }
    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [])

  // ── End game ───────────────────────────────────────────────────────────────

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    const s = scoreRef.current
    phaseRef.current = 'gameover'
    setPhase('gameover')
    setFinalScore(s)
    setPersonalBest(prev => {
      const next = Math.max(prev, s)
      localStorage.setItem(PB_KEY, String(next))
      return next
    })
  }, [])

  // ── Main game tick ─────────────────────────────────────────────────────────

  const tick = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || phaseRef.current !== 'playing') return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height

    const p     = playerRef.current
    const plats = platformsRef.current

    // Horizontal — tilt has a dead zone, then scales linearly
    let ax = 0
    if      (keysRef.current.left)                   ax = -TILT_MULT * 10
    else if (keysRef.current.right)                  ax =  TILT_MULT * 10
    else if (Math.abs(tiltRef.current) > TILT_DEAD)  ax =  tiltRef.current * TILT_MULT

    p.vx += ax
    p.vx  = Math.max(-MAX_VX, Math.min(MAX_VX, p.vx))

    // Friction when no active input
    if (!keysRef.current.left && !keysRef.current.right && Math.abs(tiltRef.current) < TILT_DEAD + 1) {
      p.vx *= 0.82
    }

    p.x += p.vx

    if (p.x + p.w < 0) p.x = W
    if (p.x > W)       p.x = -p.w

    p.vy += GRAVITY
    p.y  += p.vy

    if (p.vy > 0) {
      for (const pl of plats) {
        const pb = p.y + p.h
        if (
          pb >= pl.y &&
          pb <= pl.y + PLH + Math.max(p.vy, 2) + 2 &&
          p.x + p.w > pl.x + 6 &&
          p.x       < pl.x + pl.width - 6
        ) {
          p.y             = pl.y - p.h
          p.vy            = JUMP_VY
          squishRef.current = 0.68
          break
        }
      }
    }

    if (squishRef.current < 1) {
      squishRef.current = Math.min(1, squishRef.current + 0.065)
    }

    const threshold = H * 0.38
    if (p.y < threshold) {
      const delta = threshold - p.y
      p.y = threshold
      plats.forEach(pl => { pl.y += delta })
      cameraRef.current += delta
      scoreRef.current   = Math.floor(cameraRef.current / 7)
      setDisplayScore(scoreRef.current)
    }

    for (let i = plats.length - 1; i >= 0; i--) {
      if (plats[i].y > H + 30) plats.splice(i, 1)
    }

    const topY = plats.reduce((m, pl) => Math.min(m, pl.y), H)
    if (topY > 60) {
      const w = 70 + Math.random() * 45
      const x = 10 + Math.random() * (W - w - 20)
      plats.push({
        id: platIdRef.current++,
        x, y: topY - (80 + Math.random() * 55),
        width: w,
      })
    }

    if (p.y > H + 80) { endGame(); return }

    // ── Draw ──────────────────────────────────────────────────────────────────

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, W, H)

    const shopH = H * 0.28, shopW = W * 0.72
    const shopScreenY = H + cameraRef.current - shopH
    if (shopScreenY < H) {
      drawShop(ctx, (W - shopW) / 2, shopScreenY, shopW, shopH)
    }

    plats.forEach(pl => drawPlatform(ctx, pl.x, pl.y, pl.width))
    drawBean(ctx, p.x, p.y, p.w, p.h, squishRef.current, p.vy)

    rafRef.current = requestAnimationFrame(tick)
  }, [endGame])

  // ── Start game ─────────────────────────────────────────────────────────────

  const startGame = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }
    if (typeof DOE.requestPermission === 'function') {
      try { await DOE.requestPermission() } catch { /* ignore */ }
    }

    // Size canvas to full viewport before reading W/H
    sizeCanvas()
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width, H = canvas.height

    cameraRef.current  = 0
    scoreRef.current   = 0
    squishRef.current  = 1
    tiltRef.current    = 0
    keysRef.current    = { left: false, right: false }
    platIdRef.current  = 0
    setDisplayScore(0)

    const plats = makePlatforms(W, H, platIdRef)
    platformsRef.current = plats

    const sp = plats[0]
    playerRef.current = {
      x: sp.x + sp.width / 2 - PW / 2,
      y: sp.y - PH,
      vx: 0, vy: JUMP_VY,
      w: PW, h: PH,
    }

    phaseRef.current = 'playing'
    setPhase('playing')

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick, sizeCanvas])

  // ── Play again ─────────────────────────────────────────────────────────────

  const playAgain = useCallback(() => {
    phaseRef.current = 'idle'
    setPhase('idle')
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full" style={{ height: '100svh' }}>

      {/* Canvas — always mounted, fullscreen fixed overlay when playing */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50"
        style={{
          display: phase === 'playing' ? 'block' : 'none',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Score pill — sits above canvas during play */}
      {phase === 'playing' && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[15px] font-bold px-5 py-2 rounded-full z-[60] pointer-events-none whitespace-nowrap">
          SCORE: {displayScore.toLocaleString()}
        </div>
      )}

      {/* ── IDLE screen ────────────────────────────────────────────────────── */}
      {phase === 'idle' && (
        <div className="flex flex-col bg-[#F5F4EF]" style={{ height: 'calc(100svh - 4rem)' }}>

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-10 pb-1 shrink-0">
            <div className="flex items-center gap-1.5">
              <Trophy size={14} className="text-[#F4A261]" />
              <span className="text-[13px] font-semibold text-[#1A1A1A]">Free Coffee</span>
            </div>
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-[13px] text-[#8A8A8E] underline underline-offset-2"
            >
              Leaderboard
            </button>
          </div>

          {/* Title */}
          <div className="text-center px-5 pt-3 pb-2 shrink-0">
            <h1 className="text-[42px] font-black uppercase tracking-tight leading-none text-[#1A1A1A]">
              GRND Jump
            </h1>
            <p className="text-[#8A8A8E] text-[12px] mt-1.5">
              Tap to jump your way to the top
            </p>
          </div>

          {/* Preview card */}
          <div className="mx-5 flex-1 min-h-0 bg-white rounded-3xl overflow-hidden relative shadow-sm">

            {/* Static platform decorations */}
            <div className="absolute top-[10%] left-[12%] w-[36%] h-[8px] bg-[#1A1A1A] rounded-full" />
            <div className="absolute top-[24%] right-[9%]  w-[40%] h-[8px] bg-[#1A1A1A] rounded-full" />
            <div className="absolute top-[40%] left-[16%] w-[32%] h-[8px] bg-[#1A1A1A] rounded-full" />
            <div className="absolute top-[54%] right-[12%] w-[38%] h-[8px] bg-[#1A1A1A] rounded-full" />

            {/* Coffee shop image — bottom 40% of card */}
            {/* Swap shop.svg for your own image at src/assets/images/shop.svg */}
            <div className="absolute bottom-0 left-0 right-0 h-[40%]">
              <img
                src={shopImg}
                alt="GRND Coffee Shop"
                className="w-full h-full object-contain object-bottom"
              />
            </div>

            {/* Score pill preview */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[13px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
              SCORE: 0
            </div>
          </div>

          {/* Personal best + Start */}
          <div className="px-5 pt-3 pb-4 space-y-2.5 shrink-0">
            <p className="text-center text-[13px] text-[#8A8A8E]">
              Personal best:{' '}
              <span className="text-[#1A1A1A] font-bold">
                {personalBest > 0 ? personalBest.toLocaleString() : '—'}
              </span>
            </p>
            <button
              onClick={startGame}
              className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 text-[16px] font-bold active:scale-95 transition-transform"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* ── GAME OVER — fullscreen overlay ─────────────────────────────────── */}
      {phase === 'gameover' && (
        <div className="fixed inset-0 z-50 bg-[#F5F4EF] flex flex-col items-center justify-center px-6 gap-5">

          <div className="text-center">
            <p className="text-[#8A8A8E] text-[11px] uppercase tracking-widest mb-1">
              Game Over
            </p>
            <p className="text-[72px] font-black text-[#1A1A1A] leading-none">
              {finalScore.toLocaleString()}
            </p>
            <p className="text-[#8A8A8E] text-[14px] mt-1">Final Score</p>
          </div>

          <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#E5E5EA]">
              <span className="text-[#8A8A8E] text-[13px]">Personal Best</span>
              <span className="text-[#1A1A1A] font-bold text-[14px]">
                {personalBest.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="text-[#8A8A8E] text-[13px]">Weekly High Score</span>
              <span className="text-[#1A1A1A] font-bold text-[14px]">
                {WEEKLY_HIGH.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            <button className="w-full bg-[#F4A261] text-white rounded-2xl py-4 text-[15px] font-bold active:scale-95 transition-transform">
              Claim Weekly Prize
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full bg-white text-[#1A1A1A] border border-[#E5E5EA] rounded-2xl py-3.5 text-[14px] font-semibold active:scale-95 transition-transform"
            >
              View Leaderboard
            </button>
            <button
              onClick={playAgain}
              className="w-full bg-[#1A1A1A] text-white rounded-2xl py-3.5 text-[14px] font-semibold active:scale-95 transition-transform"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
