import * as React from 'react'

type AlertVariant = 'default' | 'green' | 'amber' | 'red'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<
  AlertVariant,
  { border: string; title: string; text: string; bg: string }
> = {
  default: {
    border: 'border-l-[#c8c5be]',
    bg: 'bg-white',
    title: 'text-[#111110]',
    text: 'text-[#3a3935]',
  },
  green: {
    border: 'border-l-[#1d7a4f]',
    bg: 'bg-[rgba(29,122,79,0.08)]',
    title: 'text-[#1d7a4f]',
    text: 'text-[#1d7a4f]',
  },
  amber: {
    border: 'border-l-[#8a6a00]',
    bg: 'bg-[rgba(138,106,0,0.08)]',
    title: 'text-[#8a6a00]',
    text: 'text-[#8a6a00]',
  },
  red: {
    border: 'border-l-[#b43c3c]',
    bg: 'bg-[rgba(180,60,60,0.08)]',
    title: 'text-[#b43c3c]',
    text: 'text-[#b43c3c]',
  },
}

export function Alert({
  variant = 'default',
  title,
  children,
  className = '',
}: AlertProps) {
  const styles = variantClasses[variant]

  return (
    <div
      className={[
        'border border-[#dddbd6] border-l-[3px] px-4 py-3',
        styles.border,
        styles.bg,
        className,
      ].join(' ')}
    >
      {title && (
        <p
          className={[
            'text-sm font-[\'Space_Grotesk\'] font-semibold mb-1',
            styles.title,
          ].join(' ')}
        >
          {title}
        </p>
      )}
      <p
        className={[
          'text-sm font-[\'Space_Grotesk\']',
          styles.text,
        ].join(' ')}
      >
        {children}
      </p>
    </div>
  )
}
