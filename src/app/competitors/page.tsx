import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Users, ExternalLink, Globe } from 'lucide-react'

export const metadata = { title: 'Competitors' }

export default async function CompetitorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: competitors } = await supabase
    .from('competitors')
    .select('*, competitor_products(count)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Competitors</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Track competitors and their pricing</p>
        </div>
        <Link href="/competitors/new">
          <Button className="bg-black hover:opacity-90 text-white gap-2">
            <Plus className="h-4 w-4" />
            Add competitor
          </Button>
        </Link>
      </div>

      {(!competitors || competitors.length === 0) ? (
        <div className="rounded-[32px] border border-[#E5E7EB] bg-white shadow-soft p-12 text-center">
          <Users className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">
            No competitors yet
          </h3>
          <p className="text-[#9CA3AF] mb-6 max-w-sm mx-auto">
            Add your first competitor to start tracking their prices.
          </p>
          <Link href="/competitors/new">
            <Button className="bg-black hover:opacity-90 text-white gap-2">
              <Plus className="h-4 w-4" />
              Add your first competitor
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitors.map((competitor) => {
            const productCount = (competitor.competitor_products as Array<{ count: number }>)[0]?.count ?? 0
            return (
              <Card key={competitor.id} className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-soft hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black truncate">
                        {competitor.name}
                      </h3>
                      {competitor.platform && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {competitor.platform}
                        </Badge>
                      )}
                    </div>
                    <Badge variant={competitor.active ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                      {competitor.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    {competitor.website_url && (
                      <a
                        href={competitor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#4B5563] hover:text-black truncate"
                      >
                        <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                        {competitor.website_url.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                    <div className="flex justify-between text-[#9CA3AF]">
                      <span>Tracked products</span>
                      <span className="font-medium text-black">{productCount}</span>
                    </div>
                  </div>

                  {competitor.notes && (
                    <p className="text-xs text-[#9CA3AF] mb-4 line-clamp-2">{competitor.notes}</p>
                  )}

                  <Link href={`/competitors/${competitor.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
