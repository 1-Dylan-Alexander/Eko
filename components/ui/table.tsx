import * as React from 'react'

export function Table({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={['w-full overflow-x-auto', className].join(' ')}>
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-[#dddbd6]">{children}</thead>
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableRow({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <tr
      onClick={onClick}
      className={[
        'border-b border-[#dddbd6] last:border-0',
        onClick ? 'cursor-pointer hover:bg-[#f9f8f6]' : '',
        className,
      ].join(' ')}
    >
      {children}
    </tr>
  )
}

export function TableHeader({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={[
        'px-4 py-3 text-left',
        'text-xs font-[\'Space_Mono\'] font-normal text-[#7a7870] uppercase tracking-wider',
        'whitespace-nowrap',
        className,
      ].join(' ')}
    >
      {children}
    </th>
  )
}

export function TableCell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td
      className={[
        'px-4 py-3',
        'text-sm font-[\'Space_Grotesk\'] text-[#3a3935]',
        className,
      ].join(' ')}
    >
      {children}
    </td>
  )
}
