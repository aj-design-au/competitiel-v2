import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TrendingUp, BarChart3, Shield, Zap, Check } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-wash" style={{ fontFamily: 'var(--font-inter), var(--font-geist-sans), sans-serif' }}>

      {/* Floating pill header */}
      <header className="sticky top-0 z-50 flex justify-center px-6 pt-4 pb-2">
        <nav
          className="w-full max-w-5xl flex items-center justify-between rounded-full bg-white border border-[#E5E7EB] px-5 py-3"
          style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-black" />
            <span className="text-base font-bold text-black">Competitiel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border-2 border-[#E5E7EB] text-black px-5 py-2 text-sm font-semibold hover:border-black transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-black text-white px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] px-4 py-1.5 text-sm font-medium text-[#4B5563] mb-8">
            <Zap className="h-3.5 w-3.5" />
            Powered by Gemini AI
          </div>
          <h1
            className="font-extrabold text-black leading-none mb-6"
            style={{ fontSize: 'clamp(40px, 7vw, 72px)', letterSpacing: '-0.04em' }}
          >
            Stop guessing.
            <br />
            Start winning on price.
          </h1>
          <p className="text-[18px] text-[#4B5563] max-w-2xl mx-auto mb-10 leading-relaxed">
            Track competitor prices, spot trends, and get AI-powered recommendations to
            optimise your pricing strategy — all in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-black text-white px-8 py-4 text-base font-semibold hover:opacity-90 transition-opacity"
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="rounded-full border-2 border-[#E5E7EB] text-black px-8 py-4 text-base font-semibold hover:border-black transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2
              className="font-bold text-black mb-4"
              style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.02em' }}
            >
              Everything you need to compete
            </h2>
            <p className="text-[18px] text-[#4B5563]">
              Built for small business owners with 10–50 SKUs tracking 3–5 competitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="bg-white rounded-[32px] border border-[#F3F4F6] p-8 md:p-10"
              style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)' }}
            >
              <div className="bg-[#F3F4F6] rounded-2xl p-3 w-12 h-12 flex items-center justify-center mb-6">
                <BarChart3 className="h-5 w-5 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Price Comparison Table</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Side-by-side comparison of your prices vs competitors with status badges,
                trend sparklines, and inline editing.
              </p>
            </div>

            <div
              className="bg-white rounded-[32px] border border-[#F3F4F6] p-8 md:p-10"
              style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)' }}
            >
              <div className="bg-[#F3F4F6] rounded-2xl p-3 w-12 h-12 flex items-center justify-center mb-6">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">AI-Powered Insights</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Gemini AI analyses your pricing data and delivers actionable recommendations,
                pattern detection, and competitive positioning.
              </p>
            </div>

            <div
              className="bg-white rounded-[32px] border border-[#F3F4F6] p-8 md:p-10"
              style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)' }}
            >
              <div className="bg-[#F3F4F6] rounded-2xl p-3 w-12 h-12 flex items-center justify-center mb-6">
                <Shield className="h-5 w-5 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Smart Price Alerts</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Get notified when competitor prices change significantly or when your
                margins drop below target.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2
              className="font-bold text-black"
              style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.02em' }}
            >
              Simple, transparent pricing
            </h2>
          </div>
          <div
            className="bg-white rounded-[32px] border border-[#E5E7EB] overflow-hidden"
            style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)' }}
          >
            <div className="bg-black px-8 py-8">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-white">Free</span>
                <span className="text-white/60 text-sm font-medium">during beta</span>
              </div>
              <p className="mt-2 text-white/60 text-sm">Full access, no credit card required</p>
            </div>
            <div className="px-8 py-8">
              <ul className="space-y-4">
                {[
                  'Up to 50 products',
                  'Up to 5 competitors',
                  'Price history & trend charts',
                  'AI insights (Gemini 2.0)',
                  'Price alerts & notifications',
                  'Export to CSV',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-black flex-shrink-0" />
                    <span className="text-[#4B5563]">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="block w-full text-center rounded-full bg-black text-white px-8 py-4 font-semibold hover:opacity-90 transition-opacity"
                >
                  Get started free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div
            className="rounded-[32px] border border-white/10 p-10 md:p-12 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: 'rgba(0,0,0,0.95)' }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-white" />
              <span className="font-semibold text-white">Competitiel</span>
            </div>
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} Competitiel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
