import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'

const stats = {
  personalBest: 1240,
  weeklyPrize: 'Free Coffee',
}

export default function Game() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F5F4EF] pb-24 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-6">
        <div>
          <p className="text-[#8A8A8E] text-[12px] uppercase tracking-widest">
            This week
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Trophy size={14} className="text-[#F4A261]" />
            <p className="text-[13px] font-semibold text-[#1A1A1A]">
              {stats.weeklyPrize}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/leaderboard')}
          className="text-[13px] text-[#8A8A8E] underline underline-offset-2"
        >
          Leaderboard
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-[36px] font-black uppercase tracking-tight text-[#1A1A1A]">
            GRND Jump
          </h1>
          <p className="text-[#8A8A8E] text-[13px] mt-1">
            Tap to jump your way to the top
          </p>
        </div>

        {/* Game Preview */}
        <div className="w-full bg-white rounded-3xl overflow-hidden shadow-sm aspect-[3/4] flex flex-col justify-end relative">
          {/* Platforms placeholder */}
          <div className="absolute inset-0 flex flex-col justify-around items-center px-8">
            {[0.2, 0.38, 0.55, 0.72].map((_pos, i) => (
              <div
                key={i}
                className="w-20 h-2 bg-[#1A1A1A] rounded-full"
                style={{ alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end' }}
              />
            ))}
          </div>

          {/* GRND Shop at bottom */}
          <div className="bg-[#F5F4EF] px-6 py-4 border-t border-[#E5E5EA]">
            <p className="text-[11px] font-black uppercase tracking-widest text-center text-[#1A1A1A]">
              GRND
            </p>
          </div>
        </div>

        {/* Personal Best */}
        <p className="text-[#8A8A8E] text-[13px]">
          Personal best:{' '}
          <span className="text-[#1A1A1A] font-semibold">
            {stats.personalBest.toLocaleString()}
          </span>
        </p>

        {/* Start Button */}
        <button className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 text-[16px] font-bold">
          Start Game
        </button>
      </div>
    </div>
  )
}
