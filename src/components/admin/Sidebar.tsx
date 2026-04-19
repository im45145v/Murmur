'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Inbox, ImageIcon, Layout, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/queue', label: 'Queue', icon: Inbox },
  { href: '/admin/posts', label: 'Posts', icon: ImageIcon },
  { href: '/admin/templates', label: 'Templates', icon: Layout },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold text-indigo-700 tracking-tight">Murmur</h1>
        <p className="text-xs text-gray-400">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <p className="text-xs text-gray-400">v1.0.0</p>
      </div>
    </aside>
  )
}
