import { Trophy, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'


const tabs = ['Global', 'Friends', 'Weekly']

const players = [
  { rank: 1, name: 'Alex', subtitle: 'Coffee Drinker', score: 12450, isCurrentUser: true },
  { rank: 2, name: 'Jordan', subtitle: 'Daily Grinder', score: 11200, isCurrentUser: false },
  { rank: 3, name: 'Taylor', subtitle: 'Espresso Expert', score: 10890, isCurrentUser: false },
  { rank: 4, name: 'Casey', subtitle: '', score: 9450, isCurrentUser: false },
  { rank: 5, name: 'Megan', subtitle: '', score: 7900, isCurrentUser: false },
  { rank: 6, name: 'Riley', subtitle: '', score: 7100, isCurrentUser: false },
]

export default function Leaderboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Weekly')

  return (
    <div className="min-h-screen bg-[#F5F4EF] pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/game')} className="text-[#8A8A8E]">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#F4A261]" />
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">
              Weekly Leaderboard
            </h1>
          </div>
        </div>

        {/* Prize Banner */}
        <div className="bg-[#F4A261] rounded-2xl px-4 py-3 flex items-center justify-between mb-4">
          <div>
            <p className="text-white text-[11px] uppercase tracking-widest font-medium">
              This week's prize
            </p>
            <p className="text-white text-[16px] font-bold mt-0.5">
              Free Coffee
            </p>
          </div>
          <Trophy size={28} className="text-white opacity-80" />
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#8A8A8E]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings */}
      <div className="px-6 space-y-2">
        {players.map((player) => (
          <div
            key={player.rank}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
              player.isCurrentUser
                ? 'bg-[#F4A261]'
                : 'bg-white'
            }`}
          >
            {/* Rank */}
            <div className="w-6 text-center">
              {player.rank === 1 ? (
                <Trophy size={16} className="text-[#F4A261] mx-auto" style={{ color: player.isCurrentUser ? 'white' : '#F4A261' }} />
              ) : (
                <span className={`text-[13px] font-bold ${player.isCurrentUser ? 'text-white' : 'text-[#8A8A8E]'}`}>
                  {player.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              player.isCurrentUser ? 'bg-white' : 'bg-[#F5F4EF]'
            }`}>
              <span className={`text-[13px] font-bold ${player.isCurrentUser ? 'text-[#F4A261]' : 'text-[#1A1A1A]'}`}>
                {player.name[0]}
              </span>
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className={`text-[14px] font-semibold truncate ${player.isCurrentUser ? 'text-white' : 'text-[#1A1A1A]'}`}>
                {player.name}
                {player.isCurrentUser && ' (You)'}
              </p>
              {player.subtitle && (
                <p className={`text-[11px] truncate ${player.isCurrentUser ? 'text-white/70' : 'text-[#8A8A8E]'}`}>
                  {player.subtitle}
                </p>
              )}
            </div>

            {/* Score */}
            <p className={`text-[14px] font-bold flex-shrink-0 ${player.isCurrentUser ? 'text-white' : 'text-[#1A1A1A]'}`}>
              {player.score.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
