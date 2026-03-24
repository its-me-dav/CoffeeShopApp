import { NavLink } from 'react-router-dom'
import { Home, CreditCard, Gamepad2 } from 'lucide-react'

const tabs = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/card', label: 'Card', icon: CreditCard },
  { to: '/game', label: 'Game', icon: Gamepad2 },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-[#E5E5EA] px-6 py-2 z-50">
      <ul className="flex justify-around items-center">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-4 transition-colors ${
                  isActive ? 'text-[#1A1A1A]' : 'text-[#8A8A8E]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
