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
