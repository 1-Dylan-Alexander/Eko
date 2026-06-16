import * as React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-['Space_Grotesk'] font-medium text-[#3a3935]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'h-9 px-3',
            'bg-white border text-sm font-[\'Space_Grotesk\'] text-[#111110]',
            'placeholder:text-[#b0aea8]',
            'outline-none transition-colors',
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

Input.displayName = 'Input'
