'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Welcome back!')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="font-extrabold text-2xl tracking-tight text-black">Competitiel</span>
        </div>

        <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-card p-8 md:p-10">
          <h2 className="text-2xl font-bold text-black mb-6">Sign in</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-3 text-sm w-full focus:outline-none focus:border-green-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#4B5563] hover:text-black transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-3 text-sm w-full focus:outline-none focus:border-green-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white w-full py-3.5 font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#4B5563]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-green-600 hover:text-green-700 transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
