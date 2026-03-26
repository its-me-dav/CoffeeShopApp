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
