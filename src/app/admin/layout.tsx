'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { useStore } from '@/lib/store'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const fetchSubmissions = useStore((s) => s.fetchSubmissions)
  const fetchSettings = useStore((s) => s.fetchSettings)
  const fetchPosts = useStore((s) => s.fetchPosts)

  const isLogin = pathname === '/admin/login'

  useEffect(() => {
    if (isLogin) return
    fetchSubmissions()
    fetchSettings()
    fetchPosts()

    // Poll for new submissions every 15 seconds
    const interval = setInterval(() => {
      fetchSubmissions()
    }, 15_000)
    return () => clearInterval(interval)
  }, [isLogin, fetchSubmissions, fetchSettings, fetchPosts])

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
