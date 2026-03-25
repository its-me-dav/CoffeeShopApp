import { X, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { CoffeeBean } from '@/components/ui/coffee-bean'

interface Props {
  onClose: () => void
}

export default function ProfileSheet({ onClose }: Props) {
  const { user, logout, addPoints } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login')
  }

  const handleSimulateScan = () => {
    addPoints(100)
  }

  if (!user) return null

  const pointsToGo = user.nextReward - user.points
  const progress = Math.min((user.points / user.nextReward) * 100, 100)

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#F5F4EF] rounded-t-3xl z-50 p-6 pb-10 overflow-y-auto max-h-[90vh]">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#D1D1D6] rounded-full mx-auto mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#1A1A1A]">Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#E5E5EA] flex items-center justify-center">
            <X size={16} className="text-[#1A1A1A]" />
          </button>
        </div>

        {/* Avatar + info */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[20px] font-semibold">{user.name[0]}</span>
          </div>
          <div>
            <p className="text-[17px] font-semibold text-[#1A1A1A]">{user.name}</p>
            <p className="text-[13px] text-[#8A8A8E]">{user.email}</p>
            <p className="text-[12px] text-[#F4A261] font-medium mt-0.5">{user.tier}</p>
          </div>
        </div>

        {/* Points */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <p className="text-[11px] uppercase tracking-widest text-[#8A8A8E] font-medium mb-1">Points Balance</p>
          <p className="text-[36px] font-bold text-[#1A1A1A] leading-none">{user.points.toLocaleString()}</p>
          <p className="text-[12px] text-[#8A8A8E] mt-1">{pointsToGo > 0 ? `${pointsToGo.toLocaleString()} points until your next reward` : 'Reward ready to claim!'}</p>
          <div className="mt-3 h-1.5 bg-[#F0EFEA] rounded-full overflow-hidden">
            <div className="h-full bg-[#1A1A1A] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-[#1A1A1A]">10-Day Streak</p>
            <p className="text-[13px] text-[#8A8A8E]">{user.streak}/{user.maxStreak}</p>
          </div>
          <div className="flex items-end gap-1 mb-3">
            {Array.from({ length: user.maxStreak }).map((_, i) => (
              <div key={i} className="flex-1 aspect-[4/5]">
                <CoffeeBean filled={i < user.streak} />
              </div>
            ))}
          </div>
          <div className="bg-[#F5F4EF] rounded-xl p-3">
            <p className="text-[12px] font-semibold text-[#1A1A1A] mb-1">How it works</p>
            <p className="text-[12px] text-[#8A8A8E] leading-relaxed">
              Visit GRND once a day to fill a coffee bean. Fill all 10 beans in 10 consecutive days to earn a{' '}
              <span className="text-[#1A1A1A] font-medium">free coffee</span>. Miss a day and your streak resets.
            </p>
          </div>
        </div>

        {/* Simulate scan */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">Demo: Simulate a Visit</p>
          <p className="text-[12px] text-[#8A8A8E] mb-3">In the real app, a barista scans your QR code to add points. Tap below to simulate a visit (+100 pts).</p>
          <button
            onClick={handleSimulateScan}
            className="w-full bg-[#F4A261] text-white rounded-xl py-3 text-[14px] font-semibold active:scale-95 transition-transform"
          >
            Simulate Scan (+100 pts)
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white text-[#1A1A1A] rounded-2xl py-4 text-[15px] font-semibold border border-[#E5E5EA] active:scale-95 transition-transform"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  )
}
