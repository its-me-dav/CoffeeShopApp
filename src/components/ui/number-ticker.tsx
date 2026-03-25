import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useInView } from 'motion/react'
import { cn } from '@/lib/utils'

interface NumberTickerProps {
  value: number
  className?: string
  decimalPlaces?: number
}

export function NumberTicker({ value, className, decimalPlaces = 0 }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { damping: 60, stiffness: 300 })
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, motionValue, value])

  useEffect(() => {
    return spring.on('change', latest => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(latest.toFixed(decimalPlaces)))
      }
    })
  }, [spring, decimalPlaces])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      0
    </span>
  )
}
