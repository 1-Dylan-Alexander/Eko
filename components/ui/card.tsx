import * as React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={[
        'bg-white border border-[#dddbd6]',
        padding ? 'p-6' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div
      className={[
        'px-6 py-4 border-b border-[#dddbd6]',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3
      className={[
        'font-[\'Space_Grotesk\'] text-sm font-semibold text-[#111110]',
        className,
      ].join(' ')}
    >
      {children}
    </h3>
  )
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={['p-6', className].join(' ')}>
      {children}
    </div>
  )
}
