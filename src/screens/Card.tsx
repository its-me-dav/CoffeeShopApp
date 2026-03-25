import { useState } from 'react'
import { Wifi, Coffee } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'
import { Ripple } from '@/components/ui/ripple'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { MagicCard } from '@/components/ui/magic-card'

const user = {
  name: 'Alex Rivera',
  points: 1240,
  tier: 'Premium Member',
}

function QRCode() {
  const modules = [
    [1,1,1,1,1,1,1, 0,1,0,1,0, 1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1, 0,0,1,0,1, 1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1, 0,1,0,1,0, 1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1, 0,0,1,0,1, 1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1, 0,1,0,0,0, 1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1, 0,0,1,0,1, 1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1, 0,1,0,1,0, 1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0, 0,1,1,0,0, 0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1, 1,0,1,0,1, 1,0,1,0,1,1,0],
    [0,1,0,0,1,0,0, 1,1,0,1,0, 0,1,0,1,0,0,1],
    [1,1,0,1,1,0,1, 0,0,1,0,1, 0,0,1,1,0,1,0],
    [0,0,0,0,0,0,0, 0,1,0,1,1, 0,1,0,0,1,0,1],
    [1,1,1,1,1,1,1, 0,0,1,0,0, 1,0,1,1,0,0,1],
    [1,0,0,0,0,0,1, 0,1,0,1,0, 0,1,0,0,1,0,0],
    [1,0,1,1,1,0,1, 0,0,1,0,1, 1,1,0,1,0,1,1],
    [1,0,1,1,1,0,1, 0,1,0,1,0, 0,0,1,0,1,0,0],
    [1,0,1,1,1,0,1, 0,0,1,0,1, 1,0,0,1,0,1,1],
    [1,0,0,0,0,0,1, 0,1,0,0,0, 0,1,0,0,1,0,0],
    [1,1,1,1,1,1,1, 0,0,1,0,1, 1,0,1,1,0,1,1],
  ]
  const cell = 8
  const size = 19
  return (
    <svg viewBox={`0 0 ${size * cell} ${size * cell}`} width={size * cell} height={size * cell} shapeRendering="crispEdges">
      {modules.map((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1C1C1E" /> : null
        )
      )}
    </svg>
  )
}

export default function Card() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F4EF] pb-24">
      {/* Header */}
      <div className="flex items-center justify-center px-6 pt-14 pb-6">
        <div className="flex items-center gap-2">
          <Coffee size={20} strokeWidth={2.5} className="text-[#1A1A1A]" />
          <span className="text-[15px] font-bold tracking-widest uppercase text-[#1A1A1A]">
            GRND
          </span>
        </div>
      </div>

      <div className="px-6 space-y-8">

        {/* Flippable Loyalty Card */}
        <div
          className="aspect-[1.6/1] cursor-pointer"
          style={{ perspective: '1200px' }}
          onClick={() => setFlipped(f => !f)}
        >
          <div
            className="relative w-full h-full"
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1)',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* ── Front — dark card with MagicCard spotlight + BorderBeam ── */}
            <MagicCard
              className="absolute inset-0 rounded-3xl"
              spotlightColor="rgba(244,162,97,0.10)"
            >
              <div
                className="w-full h-full bg-[#1C1C1E] rounded-3xl p-6 flex flex-col justify-between shadow-xl overflow-hidden"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee size={18} strokeWidth={2.5} className="text-white" />
                    <span className="text-white text-[14px] font-bold tracking-widest uppercase">
                      GRND
                    </span>
                  </div>
                  <span className="text-[#8A8A8E] text-[11px] uppercase tracking-widest">
                    {user.tier}
                  </span>
                </div>

                <div>
                  <p className="text-[#8A8A8E] text-[11px] uppercase tracking-widest mb-1">
                    Balance
                  </p>
                  <p className="text-white text-[42px] font-bold leading-none">
                    <NumberTicker value={user.points} className="text-white text-[42px] font-bold" />
                    <span className="text-[#8A8A8E] text-[16px] font-normal ml-1">pts</span>
                  </p>
                  <p className="text-white text-[16px] font-medium mt-2">
                    {user.name}
                  </p>
                </div>

              </div>
            </MagicCard>

            {/* ── Back — QR code ── */}
            <div
              className="absolute inset-0 bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-xl"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <QRCode />
              <div className="text-center">
                <p className="text-[13px] font-semibold text-[#1A1A1A]">{user.name}</p>
                <p className="text-[11px] text-[#8A8A8E] mt-0.5 tracking-widest uppercase">
                  Scan to collect points
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NFC Scan Area — Ripple behind the icon circle */}
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative flex items-center justify-center w-24 h-24">
            <Ripple color="#1A1A1A" count={3} maxRadius={60} />
            <div className="relative z-10 w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center">
              <Wifi size={40} className="text-[#1A1A1A] rotate-90" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-[#1A1A1A]">Ready to Scan</p>
            <p className="text-[13px] text-[#8A8A8E] mt-1">
              Hold near reader to pay or collect points
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <ShimmerButton onClick={() => setFlipped(f => !f)}>
            {flipped ? 'Show Card' : 'Show QR Code'}
          </ShimmerButton>
          <button className="w-full bg-white text-[#1A1A1A] rounded-2xl py-4 text-[15px] font-semibold border border-[#E5E5EA]">
            Add to Wallet
          </button>
        </div>
      </div>
    </div>
  )
}
