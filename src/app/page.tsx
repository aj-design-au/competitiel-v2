import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Check } from 'lucide-react'

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
          <span className="text-base font-extrabold text-black tracking-tight">Competitel</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border-2 border-[#E5E7EB] text-black px-5 py-2 text-sm font-semibold hover:border-black transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-green-600 hover:bg-green-700 text-white px-5 py-2 text-sm font-semibold transition-colors"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="text-xs font-bold tracking-widest text-[#9CA3AF] uppercase mb-4">01</div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-black leading-none mb-6">
            Stop guessing.
            <br />
            <span className="text-green-600">Start winning</span> on price.
          </h1>
          <p className="text-[18px] text-[#4B5563] max-w-xl mx-auto mb-10 leading-relaxed">
            Track competitor prices, spot trends, and get AI-powered recommendations to
            optimise your pricing strategy — all in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-base font-semibold transition-colors"
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
      <section className="bg-[#F1F3F5] py-24 px-6">
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
            {/* Card 1 */}
            <div className="bg-white rounded-[32px] shadow-card border border-[#F3F4F6] p-8 md:p-10 flex flex-col">
              <div className="text-5xl font-black text-green-50 mb-6 leading-none select-none">01</div>
              <h3 className="text-lg font-semibold text-black mb-3">Price Comparison Table</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Side-by-side comparison of your prices vs competitors with status badges,
                trend sparklines, and inline editing.
              </p>
            </div>

            {/* Card 2 — inverse */}
            <div className="bg-black rounded-[32px] shadow-card border border-[#F3F4F6] p-8 md:p-10 flex flex-col">
              <div className="text-5xl font-black text-white/10 mb-6 leading-none select-none">02</div>
              <h3 className="text-lg font-semibold text-white mb-3">AI-Powered Insights</h3>
              <p className="text-white/60 leading-relaxed">
                Gemini AI analyses your pricing data and delivers actionable recommendations,
                pattern detection, and competitive positioning.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[32px] shadow-card border border-[#F3F4F6] p-8 md:p-10 flex flex-col">
              <div className="text-5xl font-black text-green-50 mb-6 leading-none select-none">03</div>
              <h3 className="text-lg font-semibold text-black mb-3">Smart Price Alerts</h3>
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
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-12">
            <h2
              className="font-bold text-black"
              style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.02em' }}
            >
              Simple, transparent pricing
            </h2>
          </div>
          <div className="rounded-[32px] shadow-card border border-[#E5E7EB] overflow-hidden">
            <div className="bg-green-600 px-8 py-8">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-white">Free</span>
                <span className="text-white/60 text-sm font-medium">during beta</span>
              </div>
              <p className="mt-2 text-white/60 text-sm">Full access, no credit card required</p>
            </div>
            <div className="bg-white p-8">
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
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-[#4B5563]">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="block w-full text-center rounded-full bg-green-600 hover:bg-green-700 text-white py-4 font-semibold transition-colors"
                >
                  Get started free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-20 px-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between gap-8">
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white mb-2">Competitel</div>
              <p className="text-white/40 text-sm">Track prices. Win on value.</p>
            </div>
            <div className="flex gap-8 text-sm text-white/60">
              <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Get started</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-8 text-sm text-white/40">
            &copy; {new Date().getFullYear()} Competitel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
