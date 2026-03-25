import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface MagicCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export function MagicCard({
  children,
  className,
  spotlightColor = 'rgba(244,162,97,0.13)',
}: MagicCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  const update = (clientX: number, clientY: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ x: clientX - rect.left, y: clientY - rect.top })
    setVisible(true)
  }

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      onMouseMove={e => update(e.clientX, e.clientY)}
      onMouseLeave={() => setVisible(false)}
      onTouchMove={e => { e.preventDefault(); update(e.touches[0].clientX, e.touches[0].clientY) }}
      onTouchEnd={() => setVisible(false)}
    >
      {/* Spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-10"
        style={{
          opacity: visible ? 1 : 0,
          background: `radial-gradient(circle 200px at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent)`,
        }}
      />
      {children}
    </div>
  )
}
