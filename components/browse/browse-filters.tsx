'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface BrowseFiltersProps {
  categories: string[]
  pricingOptions: { value: string; label: string }[]
  currentCategory?: string
  currentPricing?: string
  currentSearch?: string
}

export function BrowseFilters({
  categories,
  pricingOptions,
  currentCategory,
  currentPricing,
  currentSearch,
}: BrowseFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearAll = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const hasFilters = currentCategory || currentPricing || currentSearch

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <input
        type="text"
        placeholder="Search tools..."
        defaultValue={currentSearch}
        onChange={(e) => {
          const v = e.target.value.trim() || undefined
          updateParam('q', v)
        }}
        className="h-9 px-3 bg-white border border-[#dddbd6] text-sm font-['Space_Grotesk'] text-[#111110] placeholder:text-[#b0aea8] outline-none focus:border-[#3a3935] transition-colors w-48"
      />

      {/* Category filter */}
      <select
        value={currentCategory ?? ''}
        onChange={(e) => updateParam('category', e.target.value || undefined)}
        className="h-9 px-3 bg-white border border-[#dddbd6] text-sm font-['Space_Grotesk'] text-[#111110] outline-none focus:border-[#3a3935] transition-colors appearance-none pr-8"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Pricing filter */}
      <select
        value={currentPricing ?? ''}
        onChange={(e) => updateParam('pricing', e.target.value || undefined)}
        className="h-9 px-3 bg-white border border-[#dddbd6] text-sm font-['Space_Grotesk'] text-[#111110] outline-none focus:border-[#3a3935] transition-colors appearance-none pr-8"
      >
        <option value="">All pricing</option>
        {pricingOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="h-9 px-3 text-xs font-['Space_Mono'] text-[#7a7870] hover:text-[#111110] border border-transparent hover:border-[#dddbd6] transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
