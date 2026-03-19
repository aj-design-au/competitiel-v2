'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <span className="font-extrabold text-2xl tracking-tight text-black">Competitiel</span>
        </div>

        <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-card p-8 md:p-10">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black mb-2">Check your email</h2>
              <p className="text-[#4B5563] mb-6">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <Link
                href="/login"
                className="block w-full text-center rounded-full bg-green-600 hover:bg-green-700 text-white py-3.5 font-semibold transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-black mb-2">Reset password</h2>
              <p className="text-sm text-[#4B5563] mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
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
                    className="rounded-2xl border border-[#E5E7EB] bg-[#F3F4F6] px-4 py-3 text-sm w-full focus:outline-none focus:border-green-600 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-green-600 hover:bg-green-700 text-white w-full py-3.5 font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#4B5563]">
                Remember your password?{' '}
                <Link href="/login" className="font-medium text-green-600 hover:text-green-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
