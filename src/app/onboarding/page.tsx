'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const ROLES = [
  {
    value: 'retailer',
    title: 'Retailer',
    description: 'Match or beat competitor prices to win more sales and protect your market share.',
  },
  {
    value: 'wholesaler',
    title: 'Wholesaler / Distributor',
    description: 'Find the lowest supplier prices to maximise your margin on every order.',
  },
  {
    value: 'brand_owner',
    title: 'Brand Owner',
    description: 'Monitor who is selling your products and whether they are complying with your pricing policy.',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleContinue = async () => {
    if (!selected) return
    setSaving(true)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_role: selected }),
    })

    if (!res.ok) {
      toast.error('Failed to save your role. Please try again.')
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-black tracking-tight">How will you use Competitiel?</h1>
        <p className="text-[#9CA3AF] mt-2 text-base">
          Choose the option that best describes your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map((role) => {
          const isSelected = selected === role.value
          return (
            <button
              key={role.value}
              onClick={() => setSelected(role.value)}
              className={`text-left rounded-[32px] border-2 p-8 cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-black bg-white'
                  : 'border-[#E5E7EB] bg-white hover:border-black'
              }`}
            >
              <p className="font-bold text-xl text-black">
                {role.title}
              </p>
              <p className="text-sm mt-3 text-[#4B5563] leading-relaxed">
                {role.description}
              </p>
            </button>
          )
        })}
      </div>

      <div className="mt-8">
        <button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="rounded-full bg-black text-white px-8 py-4 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          {saving ? 'Setting up...' : 'Get Started'}
        </button>
      </div>
    </div>
  )
}
