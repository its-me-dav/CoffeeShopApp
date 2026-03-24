import { Wifi, Coffee } from 'lucide-react'

const user = {
  name: 'Alex Rivera',
  points: 1240,
  tier: 'Premium Member',
}

export default function Card() {
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
        {/* Loyalty Card */}
        <div className="bg-[#1C1C1E] rounded-3xl p-6 aspect-[1.6/1] flex flex-col justify-between shadow-xl">
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
              {user.points.toLocaleString()}
              <span className="text-[#8A8A8E] text-[16px] font-normal ml-1">pts</span>
            </p>
            <p className="text-white text-[16px] font-medium mt-2">
              {user.name}
            </p>
          </div>
        </div>

        {/* NFC Scan Area */}
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Wifi
              size={40}
              className="text-[#1A1A1A] rotate-90"
              strokeWidth={1.5}
            />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold text-[#1A1A1A]">
              Ready to Scan
            </p>
            <p className="text-[13px] text-[#8A8A8E] mt-1">
              Hold near reader to pay or collect points
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full bg-[#1A1A1A] text-white rounded-2xl py-4 text-[15px] font-semibold">
            Show QR Code
          </button>
          <button className="w-full bg-white text-[#1A1A1A] rounded-2xl py-4 text-[15px] font-semibold border border-[#E5E5EA]">
            Add to Wallet
          </button>
        </div>
      </div>
    </div>
  )
}
