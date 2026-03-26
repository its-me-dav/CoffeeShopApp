import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  saveUserWeeklyBest, getUserWeeklyBest,
  getWeeklyTopScore, getWeeklyLeaderboard, getCompetitors,
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
  const startDelayRef     = useRef(0)
  const introJumpVYRef    = useRef(JUMP_VY)
  const dyingRef          = useRef(false)
  const deathBeanYRef     = useRef(0)
  const deathBeanVYRef    = useRef(0)
  const deathPauseRef     = useRef(0)

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
  const [isNewPB, setIsNewPB]       = useState(false)
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

    // ── Death animation: bean falls back down to the shop ─────────────────────
    if (dyingRef.current) {
      const beanRestY = H - PH

      ctx.fillStyle = '#FAF0E4'
      ctx.fillRect(0, 0, W, H)
      const dImg = shopImgRef.current
      if (dImg && dImg.naturalWidth > 0) {
        const dAspect = dImg.naturalWidth / dImg.naturalHeight
        const dFinalH = Math.min(W / dAspect, H)
        const dFinalW = dFinalH * dAspect
        ctx.drawImage(dImg, (W - dFinalW) / 2, H - dFinalH, dFinalW, dFinalH)
      } else {
        drawShop(ctx, (W - W * 0.72) / 2, H - H * SHOP_H_RATIO, W * 0.72, H * SHOP_H_RATIO)
      }

      const beanX = W / 2 - PW / 2

      if (deathPauseRef.current === 0) {
        deathBeanVYRef.current += GRAVITY
        deathBeanYRef.current  += deathBeanVYRef.current

        if (deathBeanYRef.current >= beanRestY) {
          deathBeanYRef.current  = beanRestY
          deathBeanVYRef.current = 0
          squishRef.current      = 0.6
          deathPauseRef.current  = 1
        }

        const dSprite = sprRightIdleRef.current
        if (dSprite) ctx.drawImage(dSprite, beanX, deathBeanYRef.current, PW, PH)
        else drawBean(ctx, beanX, deathBeanYRef.current, PW, PH, 1, deathBeanVYRef.current)
      } else {
        if (squishRef.current < 1) squishRef.current = Math.min(1, squishRef.current + 0.04)
        const sq  = squishRef.current
        const sw  = PW * (1 + (1 - sq) * 0.3)
        const sh  = PH * sq
        const dSprite = sprRightIdleRef.current
        if (dSprite) {
          ctx.drawImage(dSprite, beanX + (PW - sw) / 2, beanRestY + (PH - sh), sw, sh)
        } else {
          drawBean(ctx, beanX, beanRestY, PW, PH, sq, 0)
        }
        deathPauseRef.current++
        if (deathPauseRef.current > 70) { endGame(); return }
      }

      rafRef.current = requestAnimationFrame(tick)
      return
    }

    // 1.5-second intro freeze — render scene but skip all physics
    if (startDelayRef.current > 0) {
      startDelayRef.current--

      ctx.fillStyle = '#FAF0E4'
      ctx.fillRect(0, 0, W, H)
      if (!bgPatternRef.current) bgPatternRef.current = createBgPattern(ctx)
      if (bgPatternRef.current) {
        ctx.save()
        ctx.translate(0, cameraRef.current % 110)
        ctx.fillStyle = bgPatternRef.current
        ctx.fillRect(0, -110, W, H + 220)
        ctx.restore()
      }
      const iImg = shopImgRef.current
      if (iImg && iImg.naturalWidth > 0) {
        const iAspect = iImg.naturalWidth / iImg.naturalHeight
        const iFinalH = Math.min(W / iAspect, H)
        const iFinalW = iFinalH * iAspect
        ctx.drawImage(iImg, (W - iFinalW) / 2, H - iFinalH, iFinalW, iFinalH)
      } else {
        drawShop(ctx, (W - W * 0.72) / 2, H - H * SHOP_H_RATIO, W * 0.72, H * SHOP_H_RATIO)
      }
      const sprite = sprRightIdleRef.current
      if (sprite) {
        ctx.drawImage(sprite, p.x, p.y, p.w, p.h)
      } else {
        drawBean(ctx, p.x, p.y, p.w, p.h, 1, 0)
      }

      rafRef.current = requestAnimationFrame(tick)
      return
    }

    // First frame after delay — launch the bean toward the first platform
    if (p.vy === 0) p.vy = introJumpVYRef.current

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

    if (p.y > H + 80) {
      dyingRef.current       = true
      deathBeanYRef.current  = -PH - 20
      deathBeanVYRef.current = 2.5
      deathPauseRef.current  = 0
      squishRef.current      = 1
      rafRef.current = requestAnimationFrame(tick)
      return
    }

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
      ctx.fillStyle = '#FAF0E4'
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
    startDelayRef.current     = 90
    dyingRef.current          = false
    deathPauseRef.current     = 0
    // Compute jump velocity to clear the first platform from ground level
    const jumpHeight = H * SHOP_H_RATIO + PH + 60
    introJumpVYRef.current = -Math.sqrt(2 * GRAVITY * jumpHeight)
    weeklyTopRef.current      = getWeeklyTopScore()
    if (user) weeklyTopRef.current = Math.max(weeklyTopRef.current, getUserWeeklyBest(user.email))
    setDisplayScore(0)

    const plats = makePlatforms(W, H, platIdRef)
    platformsRef.current = plats

    playerRef.current = {
      x: W / 2 - PW / 2,
      y: H - PH,
      vx: 0, vy: 0,
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
    competitors: getCompetitors(),
    startGame,
    playAgain,
    lives,
    maxLives,
    canPlay,
    countdown,
  }
}
