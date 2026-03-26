import sprRightIdle from '@/assets/images/bean-right-idle.png'

interface Competitor {
  name: string
  score: number
  rank: number
}

interface ScoreHUDProps {
  displayScore: number
  competitors: Competitor[]
}

export default function ScoreHUD({ displayScore, competitors }: ScoreHUDProps) {
  const next = competitors.find(c => c.score > displayScore)

  return (
    <div className="fixed top-12 left-0 right-0 z-[60] pointer-events-none" style={{ height: '44px' }}>

      {/* Score — always dead centre */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0">
        <div className="bg-[#1A1A1A] text-white text-[15px] font-bold px-6 py-2.5 rounded-full whitespace-nowrap">
          SCORE: {displayScore.toLocaleString()}
        </div>
      </div>

      {/* Rank — right side, smaller, never overlaps */}
      <div className="absolute right-4 top-0 flex items-center h-full">
        {next ? (
          <div className="bg-[#F4A261] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={sprRightIdle} alt="" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-[12px] leading-none">#{next.rank}</p>
              <p className="text-white/80 text-[9px] font-semibold leading-tight mt-0.5">
                {(next.score - displayScore).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#1A1A1A] rounded-xl px-2.5 py-1.5">
            <p className="text-white font-black text-[12px]">🏆 #1!</p>
          </div>
        )}
      </div>
    </div>
  )
}
