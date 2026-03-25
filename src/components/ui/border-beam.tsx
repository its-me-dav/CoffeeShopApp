import { motion } from 'motion/react'

interface BorderBeamProps {
  colorFrom?: string
  colorTo?: string
  duration?: number
  borderWidth?: number
}

export function BorderBeam({
  colorFrom = '#F4A261',
  colorTo = 'rgba(255,255,255,0.7)',
  duration = 4,
  borderWidth = 2,
}: BorderBeamProps) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        padding: borderWidth,
        background: `conic-gradient(from 0deg, transparent 0deg, ${colorFrom} 50deg, ${colorTo} 80deg, transparent 110deg)`,
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'destination-out',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    />
  )
}
