'use client'

import { useState } from 'react'

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Portal request failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
      alert('Could not open billing portal. Please try again.')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-['Space_Grotesk'] text-[#111110] underline underline-offset-2 hover:text-[#3a3935] transition-colors disabled:opacity-60"
    >
      {loading ? 'Opening...' : 'Manage billing'}
    </button>
  )
}
