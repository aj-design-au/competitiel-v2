import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CompetitorForm } from '@/components/competitors/CompetitorForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCompetitorPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: competitor } = await supabase
    .from('competitors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!competitor) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/competitors/${id}`} className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#4B5563] mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Competitor
        </Link>
        <h1 className="text-2xl font-bold text-black">Edit Competitor</h1>
      </div>
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-soft p-6">
        <CompetitorForm
          mode="edit"
          initialData={{
            id: competitor.id,
            name: competitor.name,
            website_url: competitor.website_url ?? '',
            platform: competitor.platform ?? '',
            notes: competitor.notes ?? '',
            active: competitor.active,
          }}
        />
      </div>
    </div>
  )
}
