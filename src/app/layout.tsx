import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Murmur',
  description: 'Anonymous campus confession platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
