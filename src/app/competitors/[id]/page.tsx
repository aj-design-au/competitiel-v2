import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompetitorProductsManager } from '@/components/competitors/CompetitorProductsManager'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CompetitorDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: competitor } = await supabase
    .from('competitors')
    .select(`
      *,
      competitor_products(
        *,
        price_history(price, currency, recorded_at, source)
      )
    `)
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!competitor) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/competitors" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Competitors
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{competitor.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {competitor.platform && (
                <Badge variant="secondary">{competitor.platform}</Badge>
              )}
              <Badge variant={competitor.active ? 'default' : 'secondary'}>
                {competitor.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <Link href={`/competitors/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Competitor info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {competitor.website_url && (
              <div>
                <p className="text-gray-500 mb-1">Website</p>
                <a
                  href={competitor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-green-600 hover:text-green-700"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Visit site
                </a>
              </div>
            )}
            {competitor.notes && (
              <div>
                <p className="text-gray-500 mb-1">Notes</p>
                <p className="text-gray-700 dark:text-gray-300">{competitor.notes}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 mb-1">Products tracked</p>
              <p className="font-semibold">{competitor.competitor_products?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Products & Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <CompetitorProductsManager
              competitorId={id}
              userId={user!.id}
              initialProducts={competitor.competitor_products ?? []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
