'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Package,
  Users,
  Sparkles,
  Bell,
  Settings,
  TrendingUp,
  Menu,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/insights', label: 'AI Insights', icon: Sparkles },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden inline-flex items-center justify-center text-[#4B5563] hover:bg-[#F3F4F6] hover:text-black rounded-xl p-2">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-white border-r border-[#E5E7EB]">
        <div className="h-16 border-b border-[#E5E7EB] px-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <span className="text-lg font-bold text-black">Competitiel</span>
        </div>
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
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-black'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
