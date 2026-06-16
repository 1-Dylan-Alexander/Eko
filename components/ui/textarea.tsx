import * as React from 'react'

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-['Space_Grotesk'] font-medium text-[#3a3935]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            'px-3 py-2 min-h-[80px]',
            'bg-white border text-sm font-[\'Space_Grotesk\'] text-[#111110]',
            'placeholder:text-[#b0aea8]',
            'outline-none transition-colors resize-y',
            error
              ? 'border-[#b43c3c] focus:border-[#b43c3c]'
              : 'border-[#dddbd6] focus:border-[#3a3935]',
            'disabled:bg-[#f9f8f6] disabled:text-[#b0aea8] disabled:cursor-not-allowed',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <p className="text-xs font-['Space_Grotesk'] text-[#b43c3c]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs font-['Space_Grotesk'] text-[#7a7870]">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
