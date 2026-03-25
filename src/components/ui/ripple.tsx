import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface RippleProps {
  className?: string
  color?: string
  count?: number
  maxRadius?: number
}

export function Ripple({ className, color = '#1A1A1A', count = 4, maxRadius = 44 }: RippleProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 flex items-center justify-center', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: color, opacity: 0 }}
          animate={{
            width:   [96, 96 + (i + 1) * maxRadius],
            height:  [96, 96 + (i + 1) * maxRadius],
            opacity: [0.35, 0],
          }}
          transition={{
            duration: 2.8,
            delay: i * 0.55,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
