import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
// Replace shop.svg with your own image (photo or illustration) at any time
import shopImg       from '@/assets/images/GRNDshop.png'
import sprRightIdle  from '@/assets/images/bean-right-idle.png'
import sprRightJump  from '@/assets/images/bean-right-jump.png'
import sprLeftIdle   from '@/assets/images/bean-left-idle.png'
import sprLeftJump   from '@/assets/images/bean-left-jump.png'

// ─── Types ───────────────────────────────────────────────────────────────────

type GamePhase = 'idle' | 'playing' | 'gameover'

interface Player {
  x: number; y: number
  vx: number; vy: number
  w: number; h: number
}

interface SugarCube { id: number; x: number; y: number }

interface Platform {
  id: number; x: number; y: number; width: number
  type: 'normal' | 'crumble'
  jumps: number
  crumbling: boolean
  crumbleTimer: number  // counts down from 45 when crumbling
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GRAVITY     = 0.38
const JUMP_VY     = -13.5
const PW          = 76
const PH          = 90
const PLH         = 13
const MAX_VX      = 7
const TILT_MULT   = 0.18    // was 0.45 — much less sensitive
const TILT_DEAD   = 4       // degrees dead zone before tilt kicks in, was 1.5
const PB_KEY             = 'grnd_jump_pb'
const WEEKLY_HIGH        = 3_280
const SHOP_H_RATIO       = 0.30   // shop occupies bottom 30% of screen height
const SUGAR_RUSH_FRAMES  = 6 * 60        // 6 s at ~60 fps
const SUGAR_LIFT_VY      = JUMP_VY * 4   // upward velocity applied every frame during rush
const SC_SIZE            = 22            // sugar cube px

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
  ctx.scale(1 + (1 - squish) * 0.3, squish)

  const armsUp = vy < -3

  // ── Body with radial gradient ──────────────────────────────────────────────
  const bodyGrad = ctx.createRadialGradient(-w * 0.1, -h * 0.14, 2, 0, 0, w * 0.52)
  bodyGrad.addColorStop(0,   '#B5763A')   // warm highlight
  bodyGrad.addColorStop(0.5, '#8B5228')   // mid coffee brown
  bodyGrad.addColorStop(1,   '#4E2A0C')   // dark shadow edge

  ctx.beginPath()
  ctx.ellipse(0, 2, w * 0.46, h * 0.43, 0, 0, Math.PI * 2)
  ctx.fillStyle = bodyGrad
  ctx.fill()

  // Drop shadow under body (gives lift)
  ctx.beginPath()
  ctx.ellipse(0, h * 0.44, w * 0.36, h * 0.07, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fill()

  // ── Bean crease ────────────────────────────────────────────────────────────
  ctx.beginPath()
  ctx.moveTo(0, -h * 0.38)
  ctx.bezierCurveTo(w * 0.21, -h * 0.1, w * 0.21, h * 0.1, 0, h * 0.38)
  ctx.strokeStyle = '#3A1E08'
  ctx.lineWidth = 2.8
  ctx.lineCap = 'round'
  ctx.stroke()

  // ── Rosy cheeks ────────────────────────────────────────────────────────────
  ctx.save()
  ctx.globalAlpha = 0.22
  ;([-1, 1] as const).forEach(side => {
    ctx.beginPath()
    ctx.ellipse(side * w * 0.24, h * 0.07, w * 0.12, h * 0.075, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#FF6B6B'
    ctx.fill()
  })
  ctx.restore()

  // ── Eyes ───────────────────────────────────────────────────────────────────
  ;([-1, 1] as const).forEach(side => {
    const ex = side * w * 0.155
    const ey = -h * 0.09

    // White sclera
    ctx.beginPath()
    ctx.ellipse(ex, ey, 6, 7.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()

    // Coloured iris
    ctx.beginPath()
    ctx.ellipse(ex, ey + 1.5, 4, 5, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#3B1F0A'
    ctx.fill()

    // Pupil
    ctx.beginPath()
    ctx.ellipse(ex, ey + 1.5, 2.2, 3, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#0A0400'
    ctx.fill()

    // Sparkle highlight
    ctx.beginPath()
    ctx.ellipse(ex + 2, ey - 0.5, 1.8, 1.8, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()

    // Small secondary sparkle
    ctx.beginPath()
    ctx.ellipse(ex - 1.5, ey + 3, 0.9, 0.9, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fill()
  })

  // ── Eyebrows (friendly arch, slightly raised) ──────────────────────────────
  ctx.strokeStyle = '#3A1E08'
  ctx.lineWidth = 2.2
  ctx.lineCap = 'round'
  ;([-1, 1] as const).forEach(side => {
    ctx.beginPath()
    ctx.arc(side * w * 0.155, -h * 0.26, 7, Math.PI + 0.45, -0.45)
    ctx.stroke()
  })

  // ── Mouth ──────────────────────────────────────────────────────────────────
  if (armsUp) {
    // Big open happy grin when jumping
    ctx.beginPath()
    ctx.arc(0, h * 0.11, w * 0.155, 0.18, Math.PI - 0.18)
    ctx.strokeStyle = '#3A1E08'
    ctx.lineWidth = 2.5
    ctx.stroke()
    // Tongue peeking
    ctx.beginPath()
    ctx.ellipse(0, h * 0.2, w * 0.07, h * 0.04, 0, 0, Math.PI)
    ctx.fillStyle = '#E8706A'
    ctx.fill()
  } else {
    // Friendly closed smile
    ctx.beginPath()
    ctx.arc(0, h * 0.09, w * 0.13, 0.25, Math.PI - 0.25)
    ctx.strokeStyle = '#3A1E08'
    ctx.lineWidth = 2.5
    ctx.stroke()
    // Small tooth hint
    ctx.beginPath()
    ctx.rect(-w * 0.05, h * 0.09, w * 0.1, h * 0.035)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
  }

  // ── Arms (chubby rounded stubs) ────────────────────────────────────────────
  ;([-1, 1] as const).forEach(side => {
    const angle    = armsUp ? -1.0 : 0.45
    const startX   = side * w * 0.39
    const startY   = -h * 0.02
    const endX     = startX + side * Math.cos(armsUp ? angle : -angle * side) * 16
    const endY     = startY - Math.sin(angle) * 16

    ctx.strokeStyle = '#7A4E22'
    ctx.lineWidth   = 6.5
    ctx.lineCap     = 'round'
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    // Round hand
    ctx.beginPath()
    ctx.arc(endX, endY, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#7A4E22'
    ctx.fill()
    // Knuckle highlight
    ctx.beginPath()
    ctx.arc(endX, endY - 2, 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fill()
  })

  // ── Legs and feet ──────────────────────────────────────────────────────────
  ;([-1, 1] as const).forEach(side => {
    ctx.strokeStyle = '#7A4E22'
    ctx.lineWidth   = 5.5
    ctx.lineCap     = 'round'
    ctx.beginPath()
    ctx.moveTo(side * w * 0.2, h * 0.37)
    ctx.lineTo(side * w * 0.24, h * 0.52)
    ctx.stroke()

    // Rounded foot
    ctx.beginPath()
    ctx.ellipse(side * w * 0.28, h * 0.545, 7, 4.5, side * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = '#4E2A0C'
    ctx.fill()
  })

  ctx.restore()
}

function drawPlatform(ctx: CanvasRenderingContext2D, pl: Platform) {
  const { x, y, width: w, type, jumps, crumbling, crumbleTimer } = pl

  ctx.save()

  if (type === 'normal') {
    // 3-D shadow
    ctx.beginPath(); rr(ctx, x + 2, y + 5, w, PLH, PLH / 2)
    ctx.fillStyle = '#1A1A1A'; ctx.fill()
    // Outlined pill — white fill, dark border
    ctx.beginPath(); rr(ctx, x, y, w, PLH, PLH / 2)
    ctx.fillStyle = '#FFFFFF'; ctx.fill()
    ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke()

  } else {
    // Crumble platform
    if (crumbling) {
      // Three chunks fall and rotate separately
      const progress = 1 - crumbleTimer / 45
      const chunkW   = w / 3
      ctx.globalAlpha = crumbleTimer / 45
      for (let i = 0; i < 3; i++) {
        const fallY  = progress * 80 * (1 + i * 0.25)
        const rotate = progress * (i - 1) * 0.55
        ctx.save()
        ctx.translate(x + chunkW * i + chunkW / 2, y + PLH / 2 + fallY)
        ctx.rotate(rotate)
        ctx.beginPath(); rr(ctx, -chunkW / 2 + 1, -PLH / 2, chunkW - 2, PLH, PLH / 2)
        ctx.fillStyle = '#F4A261'; ctx.fill()
        ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke()
        ctx.restore()
      }
      ctx.globalAlpha = 1
    } else {
      // Shake when 1st jump done (warn player)
      const shakeX = jumps >= 1 ? (Math.random() - 0.5) * 3 : 0
      ctx.translate(shakeX, 0)

      // 3-D shadow
      ctx.beginPath(); rr(ctx, x + 2, y + 5, w, PLH, PLH / 2)
      ctx.fillStyle = '#1A1A1A'; ctx.fill()
      // Outlined pill — orange fill, dark border
      ctx.beginPath(); rr(ctx, x, y, w, PLH, PLH / 2)
      ctx.fillStyle = '#F4A261'; ctx.fill()
      ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke()
    }
  }

  ctx.restore()
}

function drawSugarCube(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const s = SC_SIZE
  ctx.save()
  // 3-D shadow
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath(); rr(ctx, x + 3, y + 4, s, s, 4); ctx.fill()
  // Face
  ctx.beginPath(); rr(ctx, x, y, s, s, 4)
  ctx.fillStyle = '#FFFFFF'; ctx.fill()
  ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2; ctx.stroke()
  // Grid lines (sugar texture)
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x + s / 2, y + 2); ctx.lineTo(x + s / 2, y + s - 2)
  ctx.moveTo(x + 2, y + s / 2); ctx.lineTo(x + s - 2, y + s / 2)
  ctx.stroke()
  // Sparkle dot
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath(); ctx.arc(x + 5, y + 5, 2, 0, Math.PI * 2); ctx.fill()
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

// ─── Background pattern ───────────────────────────────────────────────────────

function createBgPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const tile = document.createElement('canvas')
  tile.width  = 110
  tile.height = 110
  const t = tile.getContext('2d')
  if (!t) return null

  const ink = 'rgba(0,0,0,0.07)'  // very faint — blends into white

  // ── Coffee bean A (top-left, angled) ──
  t.save()
  t.translate(28, 32); t.rotate(-0.4)
  t.beginPath(); t.ellipse(0, 0, 13, 8.5, 0, 0, Math.PI * 2)
  t.strokeStyle = ink; t.lineWidth = 1.5; t.stroke()
  t.beginPath(); t.moveTo(0, -8.5)
  t.bezierCurveTo(5, -3, 5, 3, 0, 8.5)
  t.strokeStyle = ink; t.lineWidth = 1; t.stroke()
  t.restore()

  // ── Coffee bean B (bottom-right, different angle) ──
  t.save()
  t.translate(82, 80); t.rotate(0.9)
  t.beginPath(); t.ellipse(0, 0, 10, 6.5, 0, 0, Math.PI * 2)
  t.strokeStyle = ink; t.lineWidth = 1.5; t.stroke()
  t.beginPath(); t.moveTo(0, -6.5)
  t.bezierCurveTo(4, -2, 4, 2, 0, 6.5)
  t.strokeStyle = ink; t.lineWidth = 1; t.stroke()
  t.restore()

  // ── Steam wisp (centre-right) ──
  t.save()
  t.translate(75, 28)
  t.strokeStyle = ink; t.lineWidth = 1.5; t.lineCap = 'round'
  t.beginPath()
  t.moveTo(0, 14)
  t.bezierCurveTo(-7, 7, 7, 2, 0, -6)
  t.stroke()
  t.restore()

  // ── Tiny steam wisp (bottom-left) ──
  t.save()
  t.translate(18, 82)
  t.strokeStyle = ink; t.lineWidth = 1.2; t.lineCap = 'round'
  t.beginPath()
  t.moveTo(0, 10)
  t.bezierCurveTo(-4, 5, 4, 1, 0, -5)
  t.stroke()
  t.restore()

  // ── Scattered dots (coffee bubbles) ──
  ;[[55, 18], [90, 50], [40, 90], [10, 55]].forEach(([dx, dy]) => {
    t.beginPath(); t.arc(dx, dy, 2.2, 0, Math.PI * 2)
    t.fillStyle = ink; t.fill()
  })

  return ctx.createPattern(tile, 'repeat')
}

function makePlat(id: number, x: number, y: number, width: number, type: Platform['type']): Platform {
  return { id, x, y, width, type, jumps: 0, crumbling: false, crumbleTimer: 0 }
}

function makePlatforms(W: number, H: number, idRef: { current: number }): Platform[] {
  const plats: Platform[] = []
  // First platform sits just above the shop (shop occupies bottom SHOP_H_RATIO of H)
  const firstY = H * (1 - SHOP_H_RATIO) - 30
  plats.push(makePlat(idRef.current++, W / 2 - 55, firstY, 110, 'normal'))
  let topY = firstY
  for (let i = 0; i < 9; i++) {
    const w    = 70 + Math.random() * 45
    const x    = 10 + Math.random() * (W - w - 20)
    topY      -= 85 + Math.random() * 35
    const type = Math.random() < 0.3 ? 'crumble' : 'normal'
    plats.push(makePlat(idRef.current++, x, topY, w, type))
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
  const keysRef      = useRef({ left: false, right: false, touchAx: 0 })
  const squishRef    = useRef(1)
  const platIdRef         = useRef(0)
  const shopImgRef        = useRef<HTMLImageElement | null>(null)
  const bgPatternRef      = useRef<CanvasPattern | null>(null)
  const sprRightIdleRef   = useRef<HTMLImageElement | null>(null)
  const sprRightJumpRef   = useRef<HTMLImageElement | null>(null)
  const sprLeftIdleRef    = useRef<HTMLImageElement | null>(null)
  const sprLeftJumpRef    = useRef<HTMLImageElement | null>(null)
  const lastDirRef        = useRef<'left' | 'right'>('right')
  const sugarCubesRef     = useRef<SugarCube[]>([])
  const sugarRushRef      = useRef(0)
  const sugarCubeIdRef    = useRef(0)
  const lastSugarScoreRef  = useRef(-9999)
  const previewBgCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const load = (src: string, ref: React.MutableRefObject<HTMLImageElement | null>) => {
      const img = new Image(); img.src = src; img.onload = () => { ref.current = img }
    }
    load(shopImg,      shopImgRef)
    load(sprRightIdle, sprRightIdleRef)
    load(sprRightJump, sprRightJumpRef)
    load(sprLeftIdle,  sprLeftIdleRef)
    load(sprLeftJump,  sprLeftJumpRef)
  }, [])

  const [phase, setPhase]               = useState<GamePhase>('idle')
  const [displayScore, setDisplayScore] = useState(0)
  const [finalScore, setFinalScore]     = useState(0)
  const [personalBest, setPersonalBest] = useState(() =>
    parseInt(localStorage.getItem(PB_KEY) || '0', 10)
  )

  // ── Preview background pattern ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'idle') return
    const canvas = previewBgCanvasRef.current
    if (!canvas) return
    canvas.width  = canvas.offsetWidth  || 400
    canvas.height = canvas.offsetHeight || 600
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const pat = createBgPattern(ctx)
    if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, canvas.width, canvas.height) }
  }, [phase])


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
      // Normalised -1..+1 relative to canvas centre; clamp to [-1, 1]
      const norm = Math.max(-1, Math.min(1, (tx - canvas.width / 2) / (canvas.width / 2)))
      keysRef.current.touchAx = norm
      keysRef.current.left    = norm < -0.05
      keysRef.current.right   = norm >  0.05
    }
    const onEnd = () => {
      keysRef.current.left    = false
      keysRef.current.right   = false
      keysRef.current.touchAx = 0
    }
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

    // Difficulty scales with score: 1× at 0 → 2.5× at score 5000
    const diff = 1 + Math.min(scoreRef.current / 5000, 1.5)

    // Horizontal — proportional touch takes priority, then tilt
    const ta = keysRef.current.touchAx
    let ax = 0
    if (Math.abs(ta) > 0.05) {
      // Proportional: further from centre = more acceleration
      ax = ta * TILT_MULT * 10
    } else if (keysRef.current.left) {
      ax = -TILT_MULT * 10
    } else if (keysRef.current.right) {
      ax =  TILT_MULT * 10
    } else if (Math.abs(tiltRef.current) > TILT_DEAD) {
      ax =  tiltRef.current * TILT_MULT
    }

    p.vx += ax * diff
    p.vx  = Math.max(-MAX_VX * diff, Math.min(MAX_VX * diff, p.vx))

    // Friction when no active input
    if (Math.abs(ta) <= 0.05 && !keysRef.current.left && !keysRef.current.right && Math.abs(tiltRef.current) < TILT_DEAD + 1) {
      p.vx *= 0.82
    }

    p.x += p.vx

    if (p.x + p.w < 0) p.x = W
    if (p.x > W)       p.x = -p.w

    // Sugar rush: carry player upward at 4× jump velocity; skip gravity & platforms
    if (sugarRushRef.current > 0) {
      p.vy = SUGAR_LIFT_VY
    } else {
      p.vy += GRAVITY * diff
    }
    p.y += p.vy

    if (p.vy > 0 && sugarRushRef.current === 0) {
      for (const pl of plats) {
        if (pl.crumbling) continue
        const pb = p.y + p.h
        if (
          pb >= pl.y &&
          pb <= pl.y + PLH + Math.max(p.vy, 2) + 2 &&
          p.x + p.w > pl.x + 6 &&
          p.x       < pl.x + pl.width - 6
        ) {
          p.y               = pl.y - p.h
          p.vy              = JUMP_VY * diff
          squishRef.current = 0.68
          if (pl.type === 'crumble') {
            pl.crumbling    = true
            pl.crumbleTimer = 45
          }
          break
        }
      }
    }

    // Sugar cube collection
    const cubes = sugarCubesRef.current
    for (let i = cubes.length - 1; i >= 0; i--) {
      const sc = cubes[i]
      if (p.x + p.w > sc.x && p.x < sc.x + SC_SIZE && p.y + p.h > sc.y && p.y < sc.y + SC_SIZE) {
        cubes.splice(i, 1)
        sugarRushRef.current = SUGAR_RUSH_FRAMES
      }
    }

    // Sugar rush countdown
    if (sugarRushRef.current > 0) {
      sugarRushRef.current--
      if (sugarRushRef.current === 0) { /* rush ended */ }
    }

    if (squishRef.current < 1) {
      squishRef.current = Math.min(1, squishRef.current + 0.065)
    }

    const threshold = H * 0.38
    if (p.y < threshold) {
      const delta = threshold - p.y
      p.y = threshold
      plats.forEach(pl => { pl.y += delta })
      sugarCubesRef.current.forEach(sc => { sc.y += delta })
      cameraRef.current += delta
      scoreRef.current   = Math.floor(cameraRef.current / 7)
      setDisplayScore(scoreRef.current)
    }

    for (let i = plats.length - 1; i >= 0; i--) {
      const pl = plats[i]
      if (pl.crumbling) {
        pl.crumbleTimer--
        if (pl.crumbleTimer <= 0) { plats.splice(i, 1); continue }
      }
      if (pl.y > H + 30) plats.splice(i, 1)
    }

    // Remove off-screen sugar cubes
    sugarCubesRef.current = sugarCubesRef.current.filter(sc => sc.y < H + 50)

    const topY = plats.reduce((m, pl) => Math.min(m, pl.y), H)
    if (topY > 60) {
      const w    = 70 + Math.random() * 45
      const x    = 10 + Math.random() * (W - w - 20)
      const type = Math.random() < 0.3 ? 'crumble' : 'normal'
      plats.push(makePlat(platIdRef.current++, x, topY - (80 + Math.random() * 55), w, type))

      // Spawn a sugar cube occasionally — min 500 score gap, 7% chance, max 1 on screen
      if (
        sugarCubesRef.current.length === 0 &&
        scoreRef.current - lastSugarScoreRef.current > 500 &&
        Math.random() < 0.07
      ) {
        const scX = 20 + Math.random() * (W - SC_SIZE - 40)
        const scY = topY - (130 + Math.random() * 60)
        sugarCubesRef.current.push({ id: sugarCubeIdRef.current++, x: scX, y: scY })
        lastSugarScoreRef.current = scoreRef.current
      }
    }

    if (p.y > H + 80) { endGame(); return }

    // ── Draw ──────────────────────────────────────────────────────────────────

    // Background — rainbow during sugar rush, patterned otherwise
    if (sugarRushRef.current > 0) {
      const hue  = (Date.now() / 15) % 360
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0,    `hsl(${hue},            80%, 88%)`)
      grad.addColorStop(0.33, `hsl(${(hue + 120) % 360}, 80%, 88%)`)
      grad.addColorStop(0.66, `hsl(${(hue + 240) % 360}, 80%, 88%)`)
      grad.addColorStop(1,    `hsl(${hue},            80%, 88%)`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, W, H)
    } else {
      // White base
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, W, H)
      // Coffee pattern overlay — create once, reuse every frame
      if (!bgPatternRef.current) bgPatternRef.current = createBgPattern(ctx)
      if (bgPatternRef.current) {
        // Scroll the pattern with the camera so it moves with the world
        ctx.save()
        ctx.translate(0, cameraRef.current % 110)
        ctx.fillStyle = bgPatternRef.current
        ctx.fillRect(0, -110, W, H + 220)
        ctx.restore()
      }
    }

    // Platforms drawn first so the shop image paints over any that overlap it
    plats.forEach(pl => drawPlatform(ctx, pl))
    sugarCubesRef.current.forEach(sc => drawSugarCube(ctx, sc.x, sc.y))

    // Shop image — anchored to ground, scrolls with camera, no distortion
    const shopH      = H * SHOP_H_RATIO
    const shopScreenY = H + cameraRef.current - shopH
    if (shopScreenY < H) {
      const img = shopImgRef.current
      if (img && img.naturalWidth > 0) {
        // contain-fit: scale to fill full width, maintain aspect ratio
        const aspect  = img.naturalWidth / img.naturalHeight
        const drawW   = W
        const drawH   = drawW / aspect
        // if image is taller than shopH, scale down to shopH instead
        const finalH  = Math.min(drawH, H)
        const finalW  = finalH * aspect
        ctx.drawImage(img, (W - finalW) / 2, H + cameraRef.current - finalH, finalW, finalH)
      } else {
        drawShop(ctx, (W - W * 0.72) / 2, shopScreenY, W * 0.72, shopH)
      }
    }

    // Direction — latch last non-zero direction
    if (p.vx > 0.5)       lastDirRef.current = 'right'
    else if (p.vx < -0.5) lastDirRef.current = 'left'

    const isJumping = p.vy < -2
    const sprite = lastDirRef.current === 'right'
      ? (isJumping ? sprRightJumpRef.current : sprRightIdleRef.current)
      : (isJumping ? sprLeftJumpRef.current  : sprLeftIdleRef.current)

    if (sprite) {
      const sq = squishRef.current
      const sw = p.w * (1 + (1 - sq) * 0.3)
      const sh = p.h * sq
      ctx.drawImage(sprite, p.x + (p.w - sw) / 2, p.y + (p.h - sh), sw, sh)
    } else {
      drawBean(ctx, p.x, p.y, p.w, p.h, squishRef.current, p.vy)
    }

    // SUGAR RUSH overlay text
    if (sugarRushRef.current > 0) {
      const flash = Math.floor(Date.now() / 180) % 2 === 0
      if (flash) {
        const hue = (Date.now() / 10) % 360
        ctx.save()
        ctx.font        = `bold ${Math.round(W * 0.1)}px Geist Variable, sans-serif`
        ctx.textAlign   = 'center'
        ctx.textBaseline = 'middle'
        // Outline
        ctx.strokeStyle = '#1A1A1A'
        ctx.lineWidth   = 6
        ctx.strokeText('SUGAR RUSH', W / 2, H * 0.18)
        // Fill with cycling colour
        ctx.fillStyle = `hsl(${hue}, 90%, 55%)`
        ctx.fillText('SUGAR RUSH', W / 2, H * 0.18)
        ctx.restore()
      }
    }

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

    cameraRef.current       = 0
    scoreRef.current        = 0
    squishRef.current       = 1
    tiltRef.current         = 0
    keysRef.current         = { left: false, right: false, touchAx: 0 }
    platIdRef.current       = 0
    sugarCubesRef.current   = []
    sugarRushRef.current    = 0
    sugarCubeIdRef.current  = 0
    lastSugarScoreRef.current = -9999
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
          <div className="mx-5 flex-1 min-h-0 rounded-3xl overflow-hidden relative shadow-sm">

            {/* Background pattern canvas — fills the card */}
            <canvas
              ref={previewBgCanvasRef}
              className="absolute inset-0 w-full h-full"
            />

            {/* Static platform decorations — pill + 3D shadow matching gameplay */}
            <div className="absolute top-[10%] left-[12%] w-[36%] h-[13px] bg-white border-2 border-[#1A1A1A] rounded-full" style={{ boxShadow: '2px 5px 0 #1A1A1A' }} />
            <div className="absolute top-[24%] right-[9%]  w-[40%] h-[13px] bg-white border-2 border-[#1A1A1A] rounded-full" style={{ boxShadow: '2px 5px 0 #1A1A1A' }} />
            <div className="absolute top-[40%] left-[16%] w-[32%] h-[13px] bg-white border-2 border-[#1A1A1A] rounded-full" style={{ boxShadow: '2px 5px 0 #1A1A1A' }} />
            <div className="absolute top-[54%] right-[12%] w-[38%] h-[13px] bg-[#F4A261] border-2 border-[#1A1A1A] rounded-full" style={{ boxShadow: '2px 5px 0 #1A1A1A' }} />

            {/* Coffee shop image — bottom 40% of card */}
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
