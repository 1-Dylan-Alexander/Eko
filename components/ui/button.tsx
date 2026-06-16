import * as React from 'react'

type ButtonVariant = 'filled' | 'outlined' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  filled:
    'bg-[#111110] text-white border border-[#111110] hover:bg-[#3a3935] hover:border-[#3a3935] disabled:bg-[#b0aea8] disabled:border-[#b0aea8]',
  outlined:
    'bg-transparent text-[#111110] border border-[#dddbd6] hover:border-[#c8c5be] hover:bg-[#f5f4f1] disabled:text-[#b0aea8] disabled:border-[#dddbd6]',
  ghost:
    'bg-transparent text-[#3a3935] border border-transparent hover:bg-[#f5f4f1] hover:text-[#111110] disabled:text-[#b0aea8]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
}

export function Button({
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-[\'Space_Grotesk\'] font-medium',
        'transition-colors cursor-pointer',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
