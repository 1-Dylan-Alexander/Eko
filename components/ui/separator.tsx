interface SeparatorProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Separator({
  className = '',
  orientation = 'horizontal',
}: SeparatorProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={['w-px bg-[#dddbd6] self-stretch', className].join(' ')}
      />
    )
  }

  return (
    <hr className={['border-0 border-t border-[#dddbd6]', className].join(' ')} />
  )
}
