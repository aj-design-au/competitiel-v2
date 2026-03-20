'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Users,
  Sparkles,
  Bell,
  Settings,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/insights', label: 'AI Insights', icon: Sparkles },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="bg-white border-r border-[#E5E7EB] w-64 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 border-b border-[#E5E7EB] px-6 flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-black" />
        <span className="text-lg font-bold text-black">
          Competitiel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#F3F4F6] text-black font-semibold rounded-xl'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-black'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E5E7EB] p-4">
        <p className="text-xs text-[#9CA3AF]">Competitive Pricing Intelligence</p>
      </div>
    </div>
  )
}
