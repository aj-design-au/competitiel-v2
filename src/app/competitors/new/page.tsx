import { CompetitorForm } from '@/components/competitors/CompetitorForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'New Competitor' }

export default function NewCompetitorPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/competitors" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Competitors
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Competitor</h1>
        <p className="text-sm text-gray-500 mt-1">Add a competitor to track their pricing</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <CompetitorForm mode="create" />
      </div>
    </div>
  )
}
