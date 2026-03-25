import { useEffect, useRef, useState } from 'react'
import { Coffee } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import introSrc  from '@/assets/videos/mascot-intro.mp4'
import mascotGif from '@/assets/images/mascot-gif.gif'

const INTRO_PLAYED_KEY = 'grnd_mascot_intro_played'

function CoffeeBean({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="12" cy="15" rx="9" ry="13" fill={filled ? '#6B4423' : '#E5E5EA'} />
      <path
        d="M12 4 C15 8, 15 12, 12 15 C9 18, 9 22, 12 26"
        stroke={filled ? '#3D2510' : '#C8C8CE'}
        strokeWidth="1.8" strokeLinecap="round" fill="none"
      />
      <ellipse
        cx="8.5" cy="9" rx="2.5" ry="3.5"
        fill={filled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)'}
        transform="rotate(-15 8.5 9)"
      />
    </svg>
  )
}

const user = {
  name: 'Alex',
  points: 2450,
  nextReward: 3000,
  streak: 7,
  maxStreak: 10,
}

export default function Home() {
  const pointsToGo = user.nextReward - user.points
  const progress   = (user.points / user.nextReward) * 100

  const introPlayed = sessionStorage.getItem(INTRO_PLAYED_KEY) === 'true'
  const [showGif, setShowGif] = useState(introPlayed)
  const introRef = useRef<HTMLVideoElement>(null)

  const handleIntroEnded = () => {
    sessionStorage.setItem(INTRO_PLAYED_KEY, 'true')
    setShowGif(true)
  }

  useEffect(() => {
    if (!showGif) introRef.current?.play().catch(() => {})
  }, [showGif])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-[#F5F4EF] pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-14 pb-6">
        <div className="flex items-center gap-2">
          <Coffee size={20} strokeWidth={2.5} className="text-[#1A1A1A]" />
          <span className="text-[15px] font-bold tracking-widest uppercase text-[#1A1A1A]">
            GRND
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center">
          <span className="text-white text-[13px] font-semibold">{user.name[0]}</span>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Greeting */}
        <div>
          <p className="text-[#8A8A8E] text-[14px]">Welcome back</p>
          <h1 className="text-[28px] font-semibold text-[#1A1A1A] leading-tight">
            {getGreeting()}, {user.name}
          </h1>
        </div>

        {/* Points Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <p className="text-[#8A8A8E] text-[12px] uppercase tracking-widest font-medium mb-1">
            Points Balance
          </p>
          <p className="text-[56px] font-bold text-[#1A1A1A] leading-none">
            <NumberTicker value={user.points} className="text-[56px] font-bold text-[#1A1A1A]" />
          </p>
          <p className="text-[#8A8A8E] text-[13px] mt-2">
            {pointsToGo.toLocaleString()} points until your next reward
          </p>
          <div className="mt-4 h-1.5 bg-[#F0EFEA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A1A1A] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-[#1A1A1A]">10-Day Streak</p>
            <p className="text-[13px] text-[#8A8A8E]">{user.streak}/{user.maxStreak}</p>
          </div>
          <div className="flex items-end gap-1.5">
            {Array.from({ length: user.maxStreak }).map((_, i) => (
              <div key={i} className="flex-1 aspect-[4/5]">
                <CoffeeBean filled={i < user.streak} />
              </div>
            ))}
          </div>
          <p className="text-[#8A8A8E] text-[12px] mt-3">
            {user.maxStreak - user.streak} more visits to earn a free coffee
          </p>
        </div>

        {/* Mascot — sits below streak card in the page flow */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-44 h-44 pointer-events-none">
            <video
              ref={introRef}
              src={introSrc}
              playsInline
              muted
              onEnded={handleIntroEnded}
              className="w-full h-full object-contain"
              style={{ display: showGif ? 'none' : 'block' }}
            />
            <img
              src={mascotGif}
              alt="GRND mascot"
              className="w-full h-full object-contain"
              style={{ display: showGif ? 'block' : 'none' }}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
