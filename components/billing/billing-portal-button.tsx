'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

interface Props {
  className?: string
}

export function BillingPortalButton({ className }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to open billing portal')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setLoading(false)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <Button
      variant="outlined"
      size="sm"
      loading={loading}
      onClick={handleClick}
      className={className}
    >
      Manage billing
    </Button>
  )
}
