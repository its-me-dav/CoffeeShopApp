import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    login(email, password)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex flex-col px-6 pt-20 pb-10">
      <div className="flex items-center gap-2 mb-14">
        <Coffee size={22} strokeWidth={2.5} className="text-[#1A1A1A]" />
        <span className="text-[16px] font-bold tracking-widest uppercase text-[#1A1A1A]">GRND</span>
      </div>

      <h1 className="text-[34px] font-bold text-[#1A1A1A] leading-tight mb-2">Welcome back</h1>
      <p className="text-[#8A8A8E] text-[15px] mb-10">Sign in to your loyalty account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[12px] uppercase tracking-widest text-[#8A8A8E] font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full bg-white rounded-2xl px-4 py-4 text-[15px] text-[#1A1A1A] outline-none border border-transparent focus:border-[#1A1A1A] transition-colors"
          />
        </div>
        <div>
          <label className="text-[12px] uppercase tracking-widest text-[#8A8A8E] font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 w-full bg-white rounded-2xl px-4 py-4 text-[15px] text-[#1A1A1A] outline-none border border-transparent focus:border-[#1A1A1A] transition-colors"
          />
        </div>
        {error && <p className="text-red-500 text-[13px]">{error}</p>}
        <button
          type="submit"
          className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 text-[15px] font-semibold mt-2 active:scale-95 transition-transform"
        >
          Sign in
        </button>
      </form>

      <p className="text-[12px] text-[#8A8A8E] text-center mt-10">
        Demo mode — any email and password will work
      </p>
    </div>
  )
}
