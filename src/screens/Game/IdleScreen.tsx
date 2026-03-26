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
  previewBgCanvasRef: React.RefObject<HTMLCanvasElement | null>
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
