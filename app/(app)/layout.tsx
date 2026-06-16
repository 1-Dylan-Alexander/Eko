import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/quiz', label: 'Discover' },
  { href: '/browse', label: 'Browse' },
  { href: '/compare', label: 'Compare' },
  { href: '/team', label: 'Team' },
  { href: '/settings', label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f5f4f1]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[#dddbd6] bg-white flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[#dddbd6]">
          <span className="font-['Space_Grotesk'] font-semibold text-[#111110] tracking-tight text-lg">
            Ēko
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-['Space_Grotesk'] text-[#3a3935] hover:text-[#111110] hover:bg-[#f5f4f1] rounded transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#dddbd6] flex items-center gap-3">
          <UserButton />
          <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Account</span>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
