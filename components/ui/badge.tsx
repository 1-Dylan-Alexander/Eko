import * as React from 'react'

type BadgeVariant = 'default' | 'green' | 'amber' | 'red'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'border-[#dddbd6] text-[#3a3935] bg-white',
  green:
    'border-[#1d7a4f] text-[#1d7a4f] bg-[rgba(29,122,79,0.08)]',
  amber:
    'border-[#8a6a00] text-[#8a6a00] bg-[rgba(138,106,0,0.08)]',
  red: 'border-[#b43c3c] text-[#b43c3c] bg-[rgba(180,60,60,0.08)]',
}

export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5',
        'text-xs font-[\'Space_Mono\'] border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
