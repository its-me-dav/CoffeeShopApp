import { useState } from 'react'
import { Trophy, ChevronLeft, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getWeeklyLeaderboard, getFriendsLeaderboard } from '@/lib/leaderboard'

const TABS = ['Weekly', 'Friends'] as const
type Tab = typeof TABS[number]

const PRIZES: Record<number, string> = {
  1: '☕ Free Coffee',
  2: '50% off',
  3: '25% off',
  4: '10% off',
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('Weekly')

  if (!user) return null

  const userId = user.email // use email as unique id
  const entries = activeTab === 'Weekly'
    ? getWeeklyLeaderboard(userId, user.name.split(' ')[0])
    : getFriendsLeaderboard(userId, user.name.split(' ')[0])

  const weeklyTopScore = 9200 // Jordan's score — the current #1

  return (
    <div className="min-h-screen bg-[#F5F4EF] pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/game')} className="text-[#8A8A8E] active:opacity-60">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#F4A261]" />
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">Leaderboard</h1>
          </div>
        </div>

        {/* Prize banner */}
        <div className="bg-[#1A1A1A] rounded-2xl px-4 py-3 flex items-center justify-between mb-4">
          <div>
            <p className="text-[#8A8A8E] text-[11px] uppercase tracking-widest font-medium">Weekly prize — #1</p>
            <p className="text-white text-[16px] font-bold mt-0.5">Free Coffee</p>
          </div>
          <Trophy size={26} className="text-[#F4A261]" />
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'text-[#8A8A8E]'
              }`}
            >
              {tab === 'Friends' && <Users size={12} />}
              {tab === 'Weekly' && <Trophy size={12} />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 podium for Weekly */}
      {activeTab === 'Weekly' && entries.length >= 3 && (
        <div className="px-6 mb-4">
          <div className="flex items-end justify-center gap-3">
            {/* 2nd */}
            <div className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${entries[1].isCurrentUser ? 'bg-[#F4A261]' : 'bg-white border border-[#E5E5EA]'}`}>
                <span className={`text-[14px] font-bold ${entries[1].isCurrentUser ? 'text-white' : 'text-[#1A1A1A]'}`}>{entries[1].name[0]}</span>
              </div>
              <p className="text-[11px] font-semibold text-[#1A1A1A] truncate max-w-[60px] text-center">{entries[1].name}</p>
              <p className="text-[10px] text-[#8A8A8E]">{entries[1].score.toLocaleString()}</p>
              <div className="w-full bg-[#E5E5EA] rounded-t-lg mt-1 flex items-center justify-center h-12">
                <span className="text-[#8A8A8E] font-bold text-[16px]">2</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex-1 flex flex-col items-center">
              <Trophy size={14} className="text-[#F4A261] mb-1" />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1 ${entries[0].isCurrentUser ? 'bg-[#F4A261]' : 'bg-[#1A1A1A]'}`}>
                <span className="text-white text-[16px] font-bold">{entries[0].name[0]}</span>
              </div>
              <p className="text-[11px] font-bold text-[#1A1A1A] truncate max-w-[60px] text-center">{entries[0].name}</p>
              <p className="text-[10px] text-[#8A8A8E]">{entries[0].score.toLocaleString()}</p>
              <p className="text-[9px] text-[#F4A261] font-semibold mt-0.5">Defending 🏆</p>
              <div className="w-full bg-[#1A1A1A] rounded-t-lg mt-1 flex items-center justify-center h-16">
                <span className="text-white font-bold text-[18px]">1</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex-1 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${entries[2].isCurrentUser ? 'bg-[#F4A261]' : 'bg-white border border-[#E5E5EA]'}`}>
                <span className={`text-[14px] font-bold ${entries[2].isCurrentUser ? 'text-white' : 'text-[#1A1A1A]'}`}>{entries[2].name[0]}</span>
              </div>
              <p className="text-[11px] font-semibold text-[#1A1A1A] truncate max-w-[60px] text-center">{entries[2].name}</p>
              <p className="text-[10px] text-[#8A8A8E]">{entries[2].score.toLocaleString()}</p>
              <div className="w-full bg-[#D1D1D6] rounded-t-lg mt-1 flex items-center justify-center h-8">
                <span className="text-white font-bold text-[14px]">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full list (rank 4+, or all for Friends) */}
      <div className="px-6 space-y-2">
        {(activeTab === 'Weekly' ? entries.slice(3) : entries).map(entry => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-4 rounded-2xl ${
              entry.isCurrentUser ? 'bg-[#F4A261]' : 'bg-white'
            }`}
          >
            <div className="w-7 text-center flex-shrink-0">
              <span className={`text-[13px] font-bold ${entry.isCurrentUser ? 'text-white' : 'text-[#8A8A8E]'}`}>
                {entry.rank}
              </span>
            </div>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              entry.isCurrentUser ? 'bg-white' : 'bg-[#F5F4EF]'
            }`}>
              <span className={`text-[13px] font-bold ${entry.isCurrentUser ? 'text-[#F4A261]' : 'text-[#1A1A1A]'}`}>
                {entry.name[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[14px] font-semibold truncate ${entry.isCurrentUser ? 'text-white' : 'text-[#1A1A1A]'}`}>
                {entry.name}{entry.isCurrentUser ? ' (You)' : ''}
              </p>
              {PRIZES[entry.rank] && (
                <p className={`text-[11px] ${entry.isCurrentUser ? 'text-white/80' : 'text-[#F4A261]'}`}>
                  {PRIZES[entry.rank]}
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-[14px] font-bold ${entry.isCurrentUser ? 'text-white' : 'text-[#1A1A1A]'}`}>
                {entry.score > 0 ? entry.score.toLocaleString() : '—'}
              </p>
              {entry.isCurrentUser && entry.score < weeklyTopScore && (
                <p className="text-[10px] text-white/70">
                  {(weeklyTopScore - entry.score).toLocaleString()} behind #1
                </p>
              )}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-12">
            <Users size={32} className="text-[#D1D1D6] mx-auto mb-3" />
            <p className="text-[#8A8A8E] text-[14px]">No friends yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
