import { cn } from '@/lib/utils'

interface ShimmerButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function ShimmerButton({ children, onClick, className, disabled }: ShimmerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative overflow-hidden w-full rounded-2xl py-4 text-[15px] font-semibold transition-transform',
        disabled
          ? 'bg-[#E5E5EA] text-[#8A8A8E] cursor-not-allowed'
          : 'bg-[#1A1A1A] text-white active:scale-95',
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      {/* Shimmer sweep — only when enabled */}
      {!disabled && (
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
      )}
    </button>
  )
}
