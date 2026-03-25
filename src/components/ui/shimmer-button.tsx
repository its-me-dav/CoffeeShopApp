import { cn } from '@/lib/utils'

interface ShimmerButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ShimmerButton({ children, onClick, className }: ShimmerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden w-full bg-[#1A1A1A] text-white rounded-2xl py-4 text-[15px] font-semibold active:scale-95 transition-transform',
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      {/* Shimmer sweep */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease-in-out 2',
        }}
      />
    </button>
  )
}
