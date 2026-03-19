import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, Shield, Zap, ChevronRight, Check } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-7 w-7 text-green-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Competitiel
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Get started free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
              <Zap className="h-4 w-4" />
              Powered by Gemini AI
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Stop guessing.
              <br />
              <span className="text-green-600">Start winning</span> on price.
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Track competitor prices, spot trends, and get AI-powered recommendations to
              optimise your pricing strategy — all in one dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  Start for free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Everything you need to compete
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Built for small business owners with 10–50 SKUs tracking 3–5 competitors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Price Comparison Table
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Side-by-side comparison of your prices vs competitors with status badges,
                trend sparklines, and inline editing.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Gemini AI analyses your pricing data and delivers actionable recommendations,
                pattern detection, and competitive positioning.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Smart Price Alerts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get notified when competitor prices change significantly or when your
                margins drop below target.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Simple, transparent pricing
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="bg-green-600 px-8 py-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">Free</span>
                <span className="text-green-200">during beta</span>
              </div>
              <p className="mt-2 text-green-100">Full access, no credit card required</p>
            </div>
            <div className="px-8 py-6">
              <ul className="space-y-3">
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
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Get started free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-gray-900 dark:text-white">Competitiel</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Competitiel. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
