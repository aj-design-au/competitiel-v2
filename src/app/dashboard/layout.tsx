import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { MobileNav } from '@/components/layout/MobileNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top nav */}
        <div className="flex items-center gap-4 h-16 border-b border-[#E5E7EB] bg-white px-4 md:px-6">
          <MobileNav />
          <div className="flex-1" />
          <TopNav
            userEmail={profile?.email ?? user.email}
            userName={profile?.full_name ?? undefined}
          />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
