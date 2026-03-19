import { CompetitorForm } from '@/components/competitors/CompetitorForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'New Competitor' }

export default function NewCompetitorPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/competitors" className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#4B5563] mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Competitors
        </Link>
        <h1 className="text-2xl font-bold text-black">Add Competitor</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Add a competitor to track their pricing</p>
      </div>
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-soft p-6">
        <CompetitorForm mode="create" />
      </div>
    </div>
  )
}
