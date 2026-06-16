import * as React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className = '', id, ...props },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-['Space_Grotesk'] font-medium text-[#3a3935]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'h-9 px-3',
            'bg-white border text-sm font-[\'Space_Grotesk\'] text-[#111110]',
            'outline-none transition-colors appearance-none',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%237a7870\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_10px_center]',
            error
              ? 'border-[#b43c3c] focus:border-[#b43c3c]'
              : 'border-[#dddbd6] focus:border-[#3a3935]',
            'disabled:bg-[#f9f8f6] disabled:text-[#b0aea8] disabled:cursor-not-allowed',
            className,
          ].join(' ')}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select'
