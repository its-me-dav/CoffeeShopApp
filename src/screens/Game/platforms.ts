import { SHOP_H_RATIO } from './constants'
import type { Platform } from './types'

export function makePlat(id: number, x: number, y: number, width: number, type: Platform['type'], vx = 0): Platform {
  return { id, x, y, width, type, jumps: 0, crumbling: false, crumbleTimer: 0, vx }
}

export function makePlatforms(W: number, H: number, idRef: { current: number }): Platform[] {
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
