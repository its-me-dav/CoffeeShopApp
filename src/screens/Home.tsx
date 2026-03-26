import { useEffect, useRef, useState } from 'react'
import { Coffee } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import { CoffeeBean } from '@/components/ui/coffee-bean'
import { useAuth } from '@/contexts/AuthContext'
import ProfileSheet from '@/components/layout/ProfileSheet'
import introSrc  from '@/assets/videos/mascot-intro.mp4'
import mascotGif from '@/assets/images/mascot-gif.gif'

const INTRO_PLAYED_KEY = 'grnd_mascot_intro_played'


export default function Home() {
  const { user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)

  const introPlayed = sessionStorage.getItem(INTRO_PLAYED_KEY) === 'true'
  const [showGif, setShowGif] = useState(introPlayed)
  const [videoReady, setVideoReady] = useState(false)
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

  if (!user) return null

  const pointsToGo = user.nextReward - user.points
  const progress   = Math.min((user.points / user.nextReward) * 100, 100)

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
        <button
          onClick={() => setShowProfile(true)}
          className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center active:scale-95 transition-transform"
        >
          <span className="text-white text-[13px] font-semibold">{user.name[0]}</span>
        </button>
      </div>

      <div className="px-6 space-y-6">
        {/* Greeting */}
        <div>
          <p className="text-[#8A8A8E] text-[14px]">Welcome back</p>
          <h1 className="text-[28px] font-semibold text-[#1A1A1A] leading-tight">
            {getGreeting()}, {user.name.split(' ')[0]}
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
            {pointsToGo > 0 ? `${pointsToGo.toLocaleString()} points until your next reward` : 'Reward ready to claim!'}
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

        {/* Mascot — sits below streak card */}
        <div className="flex justify-center pt-1 pb-2">
          <div className="w-[352px] h-[352px] pointer-events-none">
            <video
              ref={introRef}
              src={introSrc}
              playsInline
              muted
              onLoadedData={() => setVideoReady(true)}
              onEnded={handleIntroEnded}
              className="w-full h-full object-contain"
              style={{
                display: showGif ? 'none' : 'block',
                visibility: videoReady ? 'visible' : 'hidden',
              }}
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

      {showProfile && <ProfileSheet onClose={() => setShowProfile(false)} />}
    </div>
  )
}
