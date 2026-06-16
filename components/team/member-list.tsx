'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Badge } from '@/components/ui'

interface Member {
  id: string
  email: string
  role: 'admin' | 'member'
  status: 'pending' | 'active' | 'inactive'
  full_name: string | null
}

interface Props {
  members: Member[]
  currentProfileId: string
}

export function MemberList({ members, currentProfileId: _ }: Props) {
  const router = useRouter()
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleRemove(id: string) {
    if (!confirm('Remove this member from the team?')) return
    setRemovingId(id)
    try {
      const res = await fetch(`/api/team/members/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to remove member')
      }
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRemovingId(null)
    }
  }

  const statusBadge = (status: string) => {
    if (status === 'active') return <Badge variant="green">Active</Badge>
    if (status === 'pending') return <Badge variant="amber">Invited</Badge>
    return <Badge>Inactive</Badge>
  }

  return (
    <div className="border border-[#dddbd6] bg-white divide-y divide-[#dddbd6]">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-[#f5f4f1]">
        {['Member', 'Role', 'Status', ''].map((h) => (
          <span key={h} className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
            {h}
          </span>
        ))}
      </div>

      {members.map((member) => (
        <div
          key={member.id}
          className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center"
        >
          <div>
            {member.full_name && (
              <p className="text-sm font-['Space_Grotesk'] font-medium text-[#111110]">
                {member.full_name}
              </p>
            )}
            <p className={`font-['Space_Grotesk'] text-[#7a7870] ${member.full_name ? 'text-xs' : 'text-sm text-[#111110]'}`}>
              {member.email}
            </p>
          </div>
          <span className="text-sm font-['Space_Grotesk'] text-[#3a3935] capitalize">
            {member.role}
          </span>
          <div>{statusBadge(member.status)}</div>
          <Button
            variant="ghost"
            size="sm"
            loading={removingId === member.id}
            onClick={() => handleRemove(member.id)}
            className="text-[#b43c3c] hover:text-[#b43c3c] hover:bg-[rgba(180,60,60,0.06)]"
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  )
}
