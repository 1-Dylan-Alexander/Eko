'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  priceId: string
  label: string
  variant?: 'filled' | 'outlined'
  className?: string
}

export function PricingCheckoutButton({
  priceId,
  label,
  variant = 'filled',
  className = '',
}: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (res.status === 401) {
        router.push('/sign-in?redirect=/pricing')
        return
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(`${res.status}: ${body.error ?? 'Checkout failed'}`)
      }

      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setLoading(false)
      alert(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const base =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-[\'Space_Grotesk\'] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

  const variants = {
    filled:
      'bg-[#111110] text-white border border-[#111110] hover:bg-[#3a3935]',
    outlined:
      'bg-transparent text-[#111110] border border-[#dddbd6] hover:border-[#c8c5be]',
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={[base, variants[variant], className].join(' ')}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {loading ? 'Redirecting...' : label}
    </button>
  )
}
