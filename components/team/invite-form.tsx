'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

export function InviteForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'member' | 'admin'>('member')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to send invite')
      setEmail('')
      setRole('member')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "px-3 py-2 text-sm font-['Space_Grotesk'] text-[#111110] bg-white border border-[#dddbd6] focus:outline-none focus:border-[#111110] transition-colors"

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1.5">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          required
          className={`${inputClass} w-full`}
        />
      </div>
      <div>
        <label className="block text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1.5">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
          className={inputClass}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <Button type="submit" variant="filled" size="sm" loading={loading}>
        Send invite
      </Button>
    </form>
  )
}
