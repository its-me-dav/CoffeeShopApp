export function CoffeeBean({ filled }: { filled: boolean }) {
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
