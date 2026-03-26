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
  gameoverBgCanvasRef: React.RefObject<HTMLCanvasElement | null>
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
