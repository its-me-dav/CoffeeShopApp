# Game Screen Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `src/screens/Game.tsx` (1,217 lines) into a `src/screens/Game/` feature folder with one file per concern.

**Architecture:** A `useGameEngine` hook owns all game logic and refs, exposing a clean interface to `index.tsx`. Three dumb UI components (`IdleScreen`, `GameOverScreen`, `ScoreHUD`) receive props and fire callbacks. Pure helper modules (`types`, `constants`, `renderer`, `platforms`) have zero React dependencies.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, React Router, Canvas API

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/screens/Game/types.ts` | GamePhase, Player, Platform, SugarCube interfaces |
| Create | `src/screens/Game/constants.ts` | All game constants |
| Create | `src/screens/Game/renderer.ts` | Pure canvas draw functions |
| Create | `src/screens/Game/platforms.ts` | Platform factory functions |
| Create | `src/screens/Game/useGameEngine.ts` | All refs, tick loop, startGame, endGame |
| Create | `src/screens/Game/IdleScreen.tsx` | Idle phase UI |
| Create | `src/screens/Game/GameOverScreen.tsx` | Game over UI |
| Create | `src/screens/Game/ScoreHUD.tsx` | Score overlay during play |
| Create | `src/screens/Game/index.tsx` | Thin orchestrator |
| Delete | `src/screens/Game.tsx` | Replaced by folder |

---

### Task 1: Create types.ts

**Files:**
- Create: `src/screens/Game/types.ts`

- [ ] **Step 1: Create the file**

```ts
export type GamePhase = 'idle' | 'playing' | 'gameover'

export interface Player {
  x: number; y: number
  vx: number; vy: number
  w: number; h: number
}

export interface SugarCube { id: number; x: number; y: number }

export interface Platform {
  id: number; x: number; y: number; width: number
  type: 'normal' | 'crumble' | 'moving'
  jumps: number
  crumbling: boolean
  crumbleTimer: number
  vx: number
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors (Game.tsx still exists and hasn't changed)

---

### Task 2: Create constants.ts

**Files:**
- Create: `src/screens/Game/constants.ts`

- [ ] **Step 1: Create the file**

```ts
export const GRAVITY            = 0.143
export const JUMP_VY            = -8.55
export const PW                 = 86
export const PH                 = 101
export const PLH                = 13
export const MAX_VX             = 5
export const TILT_MULT          = 0.055
export const TILT_DEAD          = 5
export const PB_KEY             = 'grnd_jump_pb'
export const SHOP_H_RATIO       = 0.30
export const SUGAR_RUSH_FRAMES  = 6 * 60
export const SUGAR_LIFT_VY      = JUMP_VY * 4
export const SC_SIZE            = 22
// WEEKLY_HIGH removed — was defined but never used
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 3: Create renderer.ts

**Files:**
- Create: `src/screens/Game/renderer.ts`

- [ ] **Step 1: Create the file**

```ts
import { PLH, SC_SIZE } from './constants'
import type { Platform } from './types'

export function rr(
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

export function drawBean(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  squish = 1, vy = 0,
) {
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.scale(1 + (1 - squish) * 0.3, squish)

  const armsUp = vy < -3

  const bodyGrad = ctx.createRadialGradient(-w * 0.1, -h * 0.14, 2, 0, 0, w * 0.52)
  bodyGrad.addColorStop(0,   '#B5763A')
  bodyGrad.addColorStop(0.5, '#8B5228')
  bodyGrad.addColorStop(1,   '#4E2A0C')

  ctx.beginPath()
  ctx.ellipse(0, 2, w * 0.46, h * 0.43, 0, 0, Math.PI * 2)
  ctx.fillStyle = bodyGrad
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(0, h * 0.44, w * 0.36, h * 0.07, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, -h * 0.38)
  ctx.bezierCurveTo(w * 0.21, -h * 0.1, w * 0.21, h * 0.1, 0, h * 0.38)
  ctx.strokeStyle = '#3A1E08'
  ctx.lineWidth = 2.8
  ctx.lineCap = 'round'
  ctx.stroke()

  ctx.save()
  ctx.globalAlpha = 0.22
  ;([-1, 1] as const).forEach(side => {
    ctx.beginPath()
    ctx.ellipse(side * w * 0.24, h * 0.07, w * 0.12, h * 0.075, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#FF6B6B'
    ctx.fill()
  })
  ctx.restore()

  ;([-1, 1] as const).forEach(side => {
    const ex = side * w * 0.155
    const ey = -h * 0.09

    ctx.beginPath()
    ctx.ellipse(ex, ey, 6, 7.5, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(ex, ey + 1.5, 4, 5, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#3B1F0A'
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(ex, ey + 1.5, 2.2, 3, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#0A0400'
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(ex + 2, ey - 0.5, 1.8, 1.8, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(ex - 1.5, ey + 3, 0.9, 0.9, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fill()
  })

  ctx.strokeStyle = '#3A1E08'
  ctx.lineWidth = 2.2
  ctx.lineCap = 'round'
  ;([-1, 1] as const).forEach(side => {
    ctx.beginPath()
    ctx.arc(side * w * 0.155, -h * 0.26, 7, Math.PI + 0.45, -0.45)
    ctx.stroke()
  })

  if (armsUp) {
    ctx.beginPath()
    ctx.arc(0, h * 0.11, w * 0.155, 0.18, Math.PI - 0.18)
    ctx.strokeStyle = '#3A1E08'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(0, h * 0.2, w * 0.07, h * 0.04, 0, 0, Math.PI)
    ctx.fillStyle = '#E8706A'
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.arc(0, h * 0.09, w * 0.13, 0.25, Math.PI - 0.25)
    ctx.strokeStyle = '#3A1E08'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.beginPath()
    ctx.rect(-w * 0.05, h * 0.09, w * 0.1, h * 0.035)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
  }

  ;([-1, 1] as const).forEach(side => {
    const angle  = armsUp ? -1.0 : 0.45
    const startX = side * w * 0.39
    const startY = -h * 0.02
    const endX   = startX + side * Math.cos(armsUp ? angle : -angle * side) * 16
    const endY   = startY - Math.sin(angle) * 16

    ctx.strokeStyle = '#7A4E22'
    ctx.lineWidth   = 6.5
    ctx.lineCap     = 'round'
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(endX, endY, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#7A4E22'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(endX, endY - 2, 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fill()
  })

  ;([-1, 1] as const).forEach(side => {
    ctx.strokeStyle = '#7A4E22'
    ctx.lineWidth   = 5.5
    ctx.lineCap     = 'round'
    ctx.beginPath()
    ctx.moveTo(side * w * 0.2, h * 0.37)
    ctx.lineTo(side * w * 0.24, h * 0.52)
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(side * w * 0.28, h * 0.545, 7, 4.5, side * 0.25, 0, Math.PI * 2)
    ctx.fillStyle = '#4E2A0C'
    ctx.fill()
  })

  ctx.restore()
}

export function drawPlatform(ctx: CanvasRenderingContext2D, pl: Platform) {
  const { x, y, width: w, type, jumps, crumbling, crumbleTimer } = pl

  ctx.save()

  if (type === 'moving') {
    ctx.beginPath(); rr(ctx, x + 2, y + 5, w, PLH, PLH / 2)
    ctx.fillStyle = '#1A4A3A'; ctx.fill()
    ctx.beginPath(); rr(ctx, x, y, w, PLH, PLH / 2)
    ctx.fillStyle = '#2ECC71'; ctx.fill()
    ctx.strokeStyle = '#1A4A3A'; ctx.lineWidth = 2.5; ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = `bold ${PLH - 2}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(pl.vx > 0 ? '▶' : '◀', x + w / 2, y + PLH / 2)

  } else if (type === 'normal') {
    ctx.beginPath(); rr(ctx, x + 2, y + 5, w, PLH, PLH / 2)
    ctx.fillStyle = '#1A1A1A'; ctx.fill()
    ctx.beginPath(); rr(ctx, x, y, w, PLH, PLH / 2)
    ctx.fillStyle = '#FFFFFF'; ctx.fill()
    ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke()

  } else {
    if (crumbling) {
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
      const shakeX = jumps >= 1 ? (Math.random() - 0.5) * 3 : 0
      ctx.translate(shakeX, 0)
      ctx.beginPath(); rr(ctx, x + 2, y + 5, w, PLH, PLH / 2)
      ctx.fillStyle = '#1A1A1A'; ctx.fill()
      ctx.beginPath(); rr(ctx, x, y, w, PLH, PLH / 2)
      ctx.fillStyle = '#F4A261'; ctx.fill()
      ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2.5; ctx.stroke()
    }
  }

  ctx.restore()
}

export function drawSugarCube(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const s = SC_SIZE
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.beginPath(); rr(ctx, x + 3, y + 4, s, s, 4); ctx.fill()
  ctx.beginPath(); rr(ctx, x, y, s, s, 4)
  ctx.fillStyle = '#FFFFFF'; ctx.fill()
  ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 2; ctx.stroke()
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x + s / 2, y + 2); ctx.lineTo(x + s / 2, y + s - 2)
  ctx.moveTo(x + 2, y + s / 2); ctx.lineTo(x + s - 2, y + s / 2)
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath(); ctx.arc(x + 5, y + 5, 2, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

export function drawShop(
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

export function createBgPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const tile = document.createElement('canvas')
  tile.width  = 110
  tile.height = 110
  const t = tile.getContext('2d')
  if (!t) return null

  const ink = 'rgba(0,0,0,0.07)'

  t.save()
  t.translate(28, 32); t.rotate(-0.4)
  t.beginPath(); t.ellipse(0, 0, 13, 8.5, 0, 0, Math.PI * 2)
  t.strokeStyle = ink; t.lineWidth = 1.5; t.stroke()
  t.beginPath(); t.moveTo(0, -8.5)
  t.bezierCurveTo(5, -3, 5, 3, 0, 8.5)
  t.strokeStyle = ink; t.lineWidth = 1; t.stroke()
  t.restore()

  t.save()
  t.translate(82, 80); t.rotate(0.9)
  t.beginPath(); t.ellipse(0, 0, 10, 6.5, 0, 0, Math.PI * 2)
  t.strokeStyle = ink; t.lineWidth = 1.5; t.stroke()
  t.beginPath(); t.moveTo(0, -6.5)
  t.bezierCurveTo(4, -2, 4, 2, 0, 6.5)
  t.strokeStyle = ink; t.lineWidth = 1; t.stroke()
  t.restore()

  t.save()
  t.translate(75, 28)
  t.strokeStyle = ink; t.lineWidth = 1.5; t.lineCap = 'round'
  t.beginPath()
  t.moveTo(0, 14)
  t.bezierCurveTo(-7, 7, 7, 2, 0, -6)
  t.stroke()
  t.restore()

  t.save()
  t.translate(18, 82)
  t.strokeStyle = ink; t.lineWidth = 1.2; t.lineCap = 'round'
  t.beginPath()
  t.moveTo(0, 10)
  t.bezierCurveTo(-4, 5, 4, 1, 0, -5)
  t.stroke()
  t.restore()

  ;[[55, 18], [90, 50], [40, 90], [10, 55]].forEach(([dx, dy]) => {
    t.beginPath(); t.arc(dx, dy, 2.2, 0, Math.PI * 2)
    t.fillStyle = ink; t.fill()
  })

  return ctx.createPattern(tile, 'repeat')
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 4: Create platforms.ts

**Files:**
- Create: `src/screens/Game/platforms.ts`

- [ ] **Step 1: Create the file**

```ts
import type { Platform } from './types'

export function makePlat(id: number, x: number, y: number, width: number, type: Platform['type'], vx = 0): Platform {
  return { id, x, y, width, type, jumps: 0, crumbling: false, crumbleTimer: 0, vx }
}

export function makePlatforms(W: number, H: number, idRef: { current: number }): Platform[] {
  const SHOP_H_RATIO = 0.30
  const plats: Platform[] = []
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 5: Create useGameEngine.ts

**Files:**
- Create: `src/screens/Game/useGameEngine.ts`

- [ ] **Step 1: Create the file**

```ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  saveUserWeeklyBest, getUserWeeklyBest,
  getWeeklyTopScore, getWeeklyLeaderboard,
} from '@/lib/leaderboard'
import { useDailyLives } from '@/hooks/useDailyLives'
import { createBgPattern, drawBean, drawPlatform, drawSugarCube, drawShop } from './renderer'
import { makePlat, makePlatforms } from './platforms'
import {
  GRAVITY, JUMP_VY, PW, PH, PLH, MAX_VX,
  TILT_MULT, TILT_DEAD, PB_KEY, SHOP_H_RATIO,
  SUGAR_RUSH_FRAMES, SUGAR_LIFT_VY, SC_SIZE,
} from './constants'
import type { GamePhase, Player, Platform, SugarCube } from './types'
import shopImg      from '@/assets/images/GRNDshop.png'
import sprRightIdle from '@/assets/images/bean-right-idle.png'
import sprRightJump from '@/assets/images/bean-right-jump.png'
import sprLeftIdle  from '@/assets/images/bean-left-idle.png'
import sprLeftJump  from '@/assets/images/bean-left-jump.png'

export function useGameEngine() {
  const { user } = useAuth()

  const canvasRef           = useRef<HTMLCanvasElement>(null)
  const previewBgCanvasRef  = useRef<HTMLCanvasElement>(null)
  const gameoverBgCanvasRef = useRef<HTMLCanvasElement>(null)

  const phaseRef          = useRef<GamePhase>('idle')
  const playerRef         = useRef<Player>({ x: 0, y: 0, vx: 0, vy: 0, w: PW, h: PH })
  const platformsRef      = useRef<Platform[]>([])
  const scoreRef          = useRef(0)
  const cameraRef         = useRef(0)
  const rafRef            = useRef(0)
  const tiltRef           = useRef(0)
  const keysRef           = useRef({ left: false, right: false, touchAx: 0 })
  const squishRef         = useRef(1)
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
  const lastSugarScoreRef = useRef(-9999)
  const weeklyTopRef      = useRef(getWeeklyTopScore())
  const pbPassedRef       = useRef(false)

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

  const { lives, maxLives, canPlay, useLife, countdown } = useDailyLives()

  const [phase, setPhase]               = useState<GamePhase>('idle')
  const [displayScore, setDisplayScore] = useState(0)
  const [finalScore, setFinalScore]     = useState(0)
  const [personalBest, setPersonalBest] = useState(() =>
    parseInt(localStorage.getItem(PB_KEY) || '0', 10)
  )
  const [isNewPB, setIsNewPB]   = useState(false)
  const [weeklyRank, setWeeklyRank] = useState(0)

  function paintCardBg(canvas: HTMLCanvasElement) {
    canvas.width  = canvas.offsetWidth  || 400
    canvas.height = canvas.offsetHeight || 600
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const pat = createBgPattern(ctx)
    if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, canvas.width, canvas.height) }
  }

  useEffect(() => {
    if (phase === 'idle' && previewBgCanvasRef.current) paintCardBg(previewBgCanvasRef.current)
  }, [phase])

  useEffect(() => {
    if (phase === 'gameover' && gameoverBgCanvasRef.current) paintCardBg(gameoverBgCanvasRef.current)
  }, [phase])

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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onTouch = (e: TouchEvent) => {
      if (phaseRef.current !== 'playing') return
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const tx   = e.touches[0].clientX - rect.left
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

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma != null) tiltRef.current = e.gamma
    }
    window.addEventListener('deviceorientation', handler)
    return () => window.removeEventListener('deviceorientation', handler)
  }, [])

  const endGame = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    const s = scoreRef.current
    phaseRef.current = 'gameover'
    setPhase('gameover')
    setFinalScore(s)
    setPersonalBest(prev => {
      const newPB = s > prev
      setIsNewPB(newPB)
      const next = Math.max(prev, s)
      localStorage.setItem(PB_KEY, String(next))
      return next
    })
    if (user) {
      saveUserWeeklyBest(user.email, s)
      weeklyTopRef.current = Math.max(weeklyTopRef.current, s)
      const board = getWeeklyLeaderboard(user.email, user.name.split(' ')[0])
      const entry = board.find(e => e.isCurrentUser)
      setWeeklyRank(entry?.rank ?? 0)
    }
    pbPassedRef.current = false
  }, [user])

  const tick = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || phaseRef.current !== 'playing') return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height

    const p     = playerRef.current
    const plats = platformsRef.current

    const ta = keysRef.current.touchAx
    let ax = 0
    if (Math.abs(ta) > 0.05) {
      ax = ta * TILT_MULT * 10
    } else if (keysRef.current.left) {
      ax = -TILT_MULT * 10
    } else if (keysRef.current.right) {
      ax =  TILT_MULT * 10
    } else if (Math.abs(tiltRef.current) > TILT_DEAD) {
      ax =  tiltRef.current * TILT_MULT
    }

    p.vx += ax
    p.vx  = Math.max(-MAX_VX, Math.min(MAX_VX, p.vx))

    if (Math.abs(ta) <= 0.05 && !keysRef.current.left && !keysRef.current.right && Math.abs(tiltRef.current) < TILT_DEAD + 1) {
      p.vx *= 0.82
    }

    p.x += p.vx
    if (p.x + p.w < 0) p.x = W
    if (p.x > W)       p.x = -p.w

    if (sugarRushRef.current > 0) {
      p.vy = SUGAR_LIFT_VY
    } else {
      p.vy += GRAVITY
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
          p.vy              = JUMP_VY
          squishRef.current = 0.68
          if (pl.type === 'crumble') {
            pl.crumbling    = true
            pl.crumbleTimer = 45
          }
          break
        }
      }
    }

    const cubes = sugarCubesRef.current
    for (let i = cubes.length - 1; i >= 0; i--) {
      const sc = cubes[i]
      if (p.x + p.w > sc.x && p.x < sc.x + SC_SIZE && p.y + p.h > sc.y && p.y < sc.y + SC_SIZE) {
        cubes.splice(i, 1)
        sugarRushRef.current = SUGAR_RUSH_FRAMES
      }
    }

    if (sugarRushRef.current > 0) sugarRushRef.current--

    if (squishRef.current < 1) squishRef.current = Math.min(1, squishRef.current + 0.065)

    const threshold = H * 0.38
    if (p.y < threshold) {
      const delta = threshold - p.y
      p.y = threshold
      plats.forEach(pl => { pl.y += delta })
      sugarCubesRef.current.forEach(sc => { sc.y += delta })
      cameraRef.current += delta
      scoreRef.current   = Math.floor(cameraRef.current / 7)
      setDisplayScore(scoreRef.current)
      const pb = parseInt(localStorage.getItem(PB_KEY) || '0', 10)
      if (!pbPassedRef.current && pb > 0 && scoreRef.current > pb) {
        pbPassedRef.current = true
      }
    }

    for (let i = plats.length - 1; i >= 0; i--) {
      const pl = plats[i]
      if (pl.crumbling) {
        pl.crumbleTimer--
        if (pl.crumbleTimer <= 0) { plats.splice(i, 1); continue }
      }
      if (pl.type === 'moving') {
        pl.x += pl.vx
        if (pl.x <= 0) { pl.x = 0; pl.vx = Math.abs(pl.vx) }
        if (pl.x + pl.width >= W) { pl.x = W - pl.width; pl.vx = -Math.abs(pl.vx) }
      }
      if (pl.y > H + 30) plats.splice(i, 1)
    }

    sugarCubesRef.current = sugarCubesRef.current.filter(sc => sc.y < H + 50)

    const topY = plats.reduce((m, pl) => Math.min(m, pl.y), H)
    if (topY > 60) {
      const w    = 70 + Math.random() * 45
      const x    = 10 + Math.random() * (W - w - 20)
      const newY = topY - (80 + Math.random() * 55)
      const t = Math.min(scoreRef.current / 5000, 1)
      const movingChance  = 0.03 + t * 0.17
      const crumbleChance = 0.08 + t * 0.20
      const roll = Math.random()
      let type: Platform['type'] = 'normal'
      let platVx = 0
      if (roll < movingChance) {
        type   = 'moving'
        platVx = (0.7 + Math.random() * 0.7) * (Math.random() < 0.5 ? 1 : -1)
      } else if (roll < movingChance + crumbleChance) {
        type = 'crumble'
      }
      plats.push(makePlat(platIdRef.current++, x, newY, w, type, platVx))

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
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, W, H)
      if (!bgPatternRef.current) bgPatternRef.current = createBgPattern(ctx)
      if (bgPatternRef.current) {
        ctx.save()
        ctx.translate(0, cameraRef.current % 110)
        ctx.fillStyle = bgPatternRef.current
        ctx.fillRect(0, -110, W, H + 220)
        ctx.restore()
      }
    }

    plats.forEach(pl => drawPlatform(ctx, pl))
    sugarCubesRef.current.forEach(sc => drawSugarCube(ctx, sc.x, sc.y))

    const pbScore = parseInt(localStorage.getItem(PB_KEY) || '0', 10)
    if (pbScore > 0) {
      const pbScreenY = H * 0.38 + cameraRef.current - pbScore * 7
      if (pbScreenY >= 0 && pbScreenY <= H) {
        ctx.save()
        ctx.setLineDash([10, 6])
        ctx.strokeStyle = 'rgba(26, 26, 26, 0.22)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, pbScreenY)
        ctx.lineTo(W, pbScreenY)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillStyle = 'rgba(26, 26, 26, 0.35)'
        ctx.fillText(pbPassedRef.current ? 'NEW PERSONAL BEST' : 'BEAT THIS', W - 8, pbScreenY - 3)
        ctx.restore()
      }
    }

    const shopH       = H * SHOP_H_RATIO
    const shopScreenY = H + cameraRef.current - shopH
    if (shopScreenY < H) {
      const img = shopImgRef.current
      if (img && img.naturalWidth > 0) {
        const aspect = img.naturalWidth / img.naturalHeight
        const drawW  = W
        const drawH  = drawW / aspect
        const finalH = Math.min(drawH, H)
        const finalW = finalH * aspect
        ctx.drawImage(img, (W - finalW) / 2, H + cameraRef.current - finalH, finalW, finalH)
      } else {
        drawShop(ctx, (W - W * 0.72) / 2, shopScreenY, W * 0.72, shopH)
      }
    }

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

    if (sugarRushRef.current > 0) {
      const flash = Math.floor(Date.now() / 180) % 2 === 0
      if (flash) {
        const hue = (Date.now() / 10) % 360
        ctx.save()
        ctx.font         = `bold ${Math.round(W * 0.1)}px Geist Variable, sans-serif`
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeStyle  = '#1A1A1A'
        ctx.lineWidth    = 6
        ctx.strokeText('SUGAR RUSH', W / 2, H * 0.18)
        ctx.fillStyle = `hsl(${hue}, 90%, 55%)`
        ctx.fillText('SUGAR RUSH', W / 2, H * 0.18)
        ctx.restore()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [endGame])

  const startGame = useCallback(async () => {
    useLife()

    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }
    if (typeof DOE.requestPermission === 'function') {
      try { await DOE.requestPermission() } catch { /* ignore */ }
    }

    sizeCanvas()
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width, H = canvas.height

    cameraRef.current         = 0
    scoreRef.current          = 0
    squishRef.current         = 1
    tiltRef.current           = 0
    keysRef.current           = { left: false, right: false, touchAx: 0 }
    platIdRef.current         = 0
    sugarCubesRef.current     = []
    sugarRushRef.current      = 0
    sugarCubeIdRef.current    = 0
    lastSugarScoreRef.current = -9999
    pbPassedRef.current       = false
    weeklyTopRef.current      = getWeeklyTopScore()
    if (user) weeklyTopRef.current = Math.max(weeklyTopRef.current, getUserWeeklyBest(user.email))
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
  }, [tick, sizeCanvas, user, useLife])

  const playAgain = useCallback(() => {
    phaseRef.current = 'idle'
    setPhase('idle')
  }, [])

  return {
    canvasRef,
    previewBgCanvasRef,
    gameoverBgCanvasRef,
    phase,
    displayScore,
    finalScore,
    personalBest,
    isNewPB,
    weeklyRank,
    weeklyTop: weeklyTopRef.current,
    startGame,
    playAgain,
    lives,
    maxLives,
    canPlay,
    countdown,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit the logic layer**

```bash
git add src/screens/Game/
git commit -m "refactor: extract game types, constants, renderer, platforms, engine hook"
```

---

### Task 6: Create IdleScreen.tsx

**Files:**
- Create: `src/screens/Game/IdleScreen.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import shopImg   from '@/assets/images/GRNDshop.png'
import cupFilled from '@/assets/images/cup-filled.png'
import cupEmpty  from '@/assets/images/cup-empty.png'

interface IdleScreenProps {
  personalBest: number
  lives: number
  maxLives: number
  canPlay: boolean
  countdown: string | null
  onStart: () => void
  previewBgCanvasRef: React.RefObject<HTMLCanvasElement>
}

export default function IdleScreen({
  personalBest, lives, maxLives, canPlay, countdown, onStart, previewBgCanvasRef,
}: IdleScreenProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col bg-[#F5F4EF]" style={{ height: 'calc(100svh - 4rem)' }}>

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

      <div className="text-center px-5 pt-3 pb-2 shrink-0">
        <h1 className="text-[42px] font-black uppercase tracking-tight leading-none text-[#1A1A1A]">
          GRND Jump
        </h1>
        <p className="text-[#1A1A1A] text-[13px] mt-1.5 font-medium">
          Rank in the Top 3 this week to win a FREE coffee!
        </p>
      </div>

      <div className="mx-5 flex-1 min-h-0 max-h-[46svh] rounded-3xl overflow-hidden relative border-2 border-[#1A1A1A]">
        <canvas ref={previewBgCanvasRef} className="absolute inset-0 w-full h-full" />

        <div className="absolute top-[10%] left-[12%] w-[36%] h-[13px] bg-white border-2 border-[#1A1A1A] rounded-full" style={{ boxShadow: '2px 5px 0 #1A1A1A' }} />
        <div className="absolute top-[24%] right-[9%]  w-[40%] h-[13px] bg-white border-2 border-[#1A1A1A] rounded-full" style={{ boxShadow: '2px 5px 0 #1A1A1A' }} />
        <div className="absolute top-[40%] left-[16%] w-[32%] h-[13px] bg-white border-2 border-[#1A1A1A] rounded-full" style={{ boxShadow: '2px 5px 0 #1A1A1A' }} />
        <div className="absolute top-[54%] right-[12%] w-[38%] h-[13px] bg-[#F4A261] border-2 border-[#1A1A1A] rounded-full" style={{ boxShadow: '2px 5px 0 #1A1A1A' }} />

        <div className="absolute bottom-0 left-0 right-0 h-[40%]">
          <img src={shopImg} alt="GRND Coffee Shop" className="w-full h-full object-contain object-bottom" />
        </div>

        {personalBest > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white rounded-full px-5 py-2 whitespace-nowrap">
            <span className="text-[13px]">Personal Best: <span className="font-bold">{personalBest.toLocaleString()}</span></span>
          </div>
        )}
      </div>

      <div className="px-5 pt-3 pb-4 space-y-3 shrink-0">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: maxLives }).map((_, i) => (
              <img
                key={i}
                src={i < lives ? cupFilled : cupEmpty}
                alt={i < lives ? 'Life available' : 'Life used'}
                className="w-10 h-auto"
              />
            ))}
          </div>
          {countdown && (
            <p className="text-[13px] text-[#8A8A8E]">
              Next life in: <span className="font-bold text-[#1A1A1A]">{countdown}</span>
            </p>
          )}
        </div>
        <ShimmerButton onClick={onStart} disabled={!canPlay}>
          {canPlay ? 'Start Game' : 'No lives left'}
        </ShimmerButton>
      </div>
    </div>
  )
}
```

---

### Task 7: Create GameOverScreen.tsx

**Files:**
- Create: `src/screens/Game/GameOverScreen.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useNavigate } from 'react-router-dom'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import shopImg   from '@/assets/images/GRNDshop.png'
import cupFilled from '@/assets/images/cup-filled.png'
import cupEmpty  from '@/assets/images/cup-empty.png'

interface GameOverScreenProps {
  finalScore: number
  isNewPB: boolean
  weeklyRank: number
  lives: number
  maxLives: number
  canPlay: boolean
  countdown: string | null
  onPlayAgain: () => void
  gameoverBgCanvasRef: React.RefObject<HTMLCanvasElement>
}

export default function GameOverScreen({
  finalScore, isNewPB, weeklyRank, lives, maxLives,
  canPlay, countdown, onPlayAgain, gameoverBgCanvasRef,
}: GameOverScreenProps) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F4EF] flex flex-col px-5 pt-12 pb-6" style={{ gap: '14px' }}>

      <h1 className="text-[48px] font-black uppercase tracking-tight leading-none text-[#1A1A1A] text-center shrink-0">
        Game Over
      </h1>

      <div className="relative flex-1 min-h-0 max-h-[58svh] rounded-3xl border-2 border-[#1A1A1A] overflow-hidden">
        <canvas ref={gameoverBgCanvasRef} className="absolute inset-0 w-full h-full" />

        {isNewPB && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              width: '160px', top: '32px', right: '-42px',
              transform: 'rotate(45deg)', background: '#E8843A',
              padding: '7px 0', textAlign: 'center', overflow: 'hidden',
            }}
          >
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.1) 55%, transparent 70%)',
            }} />
            <span className="relative text-white text-[8px] font-black uppercase tracking-widest leading-tight">
              New Personal Best
            </span>
          </div>
        )}

        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white rounded-2xl px-8 py-3 whitespace-nowrap z-10">
          <span className="text-[40px] font-black leading-none">{finalScore.toLocaleString()}</span>
        </div>

        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center whitespace-nowrap">
          <p className="text-[18px] font-bold text-[#1A1A1A]">
            Current Rank: <span>#{weeklyRank}</span>
          </p>
        </div>

        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            {Array.from({ length: maxLives }).map((_, i) => (
              <img key={i} src={i < lives ? cupFilled : cupEmpty} alt="" className="w-14 h-auto" />
            ))}
          </div>
          {countdown && (
            <p className="text-[13px] text-[#8A8A8E]">
              Next life in: <span className="font-bold text-[#1A1A1A]">{countdown}</span>
            </p>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[35%]">
          <img src={shopImg} alt="GRND Coffee Shop" className="w-full h-full object-contain object-bottom" />
        </div>
      </div>

      <div className="space-y-2.5 shrink-0">
        <ShimmerButton onClick={onPlayAgain} disabled={!canPlay}>
          {canPlay ? 'Play Again' : 'No lives left'}
        </ShimmerButton>
        <button
          onClick={() => navigate('/leaderboard')}
          className="w-full bg-transparent text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-2xl py-4 text-[15px] font-bold active:scale-95 transition-transform"
        >
          View Leaderboard
        </button>
      </div>
    </div>
  )
}
```

---

### Task 8: Create ScoreHUD.tsx

**Files:**
- Create: `src/screens/Game/ScoreHUD.tsx`

- [ ] **Step 1: Create the file**

```tsx
interface ScoreHUDProps {
  displayScore: number
  weeklyTop: number
}

export default function ScoreHUD({ displayScore, weeklyTop }: ScoreHUDProps) {
  return (
    <>
      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
        <div className="bg-[#1A1A1A] text-white text-[15px] font-bold px-6 py-2.5 rounded-full whitespace-nowrap">
          SCORE: {displayScore.toLocaleString()}
        </div>
      </div>

      {weeklyTop > 0 && (
        <div className="fixed top-[3.1rem] right-4 z-[60] pointer-events-none">
          {displayScore >= weeklyTop ? (
            <div className="bg-[#2ECC71] rounded-full px-2.5 py-1.5 whitespace-nowrap">
              <span className="text-[10px] font-bold text-white">🏆 Record!</span>
            </div>
          ) : (
            <div className="bg-[#F4A261]/90 rounded-full px-2.5 py-1.5 whitespace-nowrap">
              <span className="text-[10px] font-bold text-white">
                🏆 {(weeklyTop - displayScore).toLocaleString()} to beat
              </span>
            </div>
          )}
        </div>
      )}
    </>
  )
}
```

---

### Task 9: Create index.tsx and delete Game.tsx

**Files:**
- Create: `src/screens/Game/index.tsx`
- Delete: `src/screens/Game.tsx`

- [ ] **Step 1: Create index.tsx**

```tsx
import { useGameEngine } from './useGameEngine'
import IdleScreen from './IdleScreen'
import GameOverScreen from './GameOverScreen'
import ScoreHUD from './ScoreHUD'

export default function Game() {
  const {
    canvasRef,
    previewBgCanvasRef,
    gameoverBgCanvasRef,
    phase,
    displayScore,
    finalScore,
    personalBest,
    isNewPB,
    weeklyRank,
    weeklyTop,
    startGame,
    playAgain,
    lives,
    maxLives,
    canPlay,
    countdown,
  } = useGameEngine()

  return (
    <div className="relative w-full" style={{ height: '100svh' }}>

      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-50"
        style={{
          display: phase === 'playing' ? 'block' : 'none',
          width: '100%',
          height: '100%',
        }}
      />

      {phase === 'playing' && (
        <ScoreHUD displayScore={displayScore} weeklyTop={weeklyTop} />
      )}

      {phase === 'idle' && (
        <IdleScreen
          personalBest={personalBest}
          lives={lives}
          maxLives={maxLives}
          canPlay={canPlay}
          countdown={countdown}
          onStart={startGame}
          previewBgCanvasRef={previewBgCanvasRef}
        />
      )}

      {phase === 'gameover' && (
        <GameOverScreen
          finalScore={finalScore}
          isNewPB={isNewPB}
          weeklyRank={weeklyRank}
          lives={lives}
          maxLives={maxLives}
          canPlay={canPlay}
          countdown={countdown}
          onPlayAgain={playAgain}
          gameoverBgCanvasRef={gameoverBgCanvasRef}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Delete the old file**

```bash
rm src/screens/Game.tsx
```

- [ ] **Step 3: Verify the build**

```bash
npm run build
```
Expected: successful build, no errors

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "refactor: split Game screen into Game/ feature folder

- types.ts: GamePhase, Player, Platform, SugarCube interfaces
- constants.ts: all game constants (removed unused WEEKLY_HIGH)
- renderer.ts: pure canvas draw functions
- platforms.ts: platform factory functions
- useGameEngine.ts: all game logic and refs in one hook
- IdleScreen.tsx: idle phase UI
- GameOverScreen.tsx: game over UI
- ScoreHUD.tsx: score overlay during play
- index.tsx: thin orchestrator (~50 lines)
- Fix: add missing getWeeklyLeaderboard import"
```
