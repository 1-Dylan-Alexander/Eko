interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

import * as React from 'react'

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b border-[#dddbd6] px-8 py-6">
      <div>
        <h1 className="font-['Space_Grotesk'] text-xl font-semibold text-[#111110]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm font-['Space_Grotesk'] text-[#7a7870]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  )
}
