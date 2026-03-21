import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { scrapePrice } from '@/lib/scraper'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all competitor products with a URL
  const { data: products, error } = await supabase
    .from('competitor_products')
    .select('id, name, url, currency')
    .eq('user_id', user.id)
    .not('url', 'is', null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!products || products.length === 0) {
    return NextResponse.json({ results: [], message: 'No products with URLs found' })
  }

  interface ScrapeResultEntry {
    id: string
    name: string
    success: boolean
    price: number | null
    currency: string
    error: string | null
  }

  // Scrape sequentially to avoid rate limits
  const mapped: ScrapeResultEntry[] = []
  for (const product of products) {
    try {
      const result = await scrapePrice(product.url as string)
      const entry: ScrapeResultEntry = {
        id: product.id,
        name: product.name,
        success: result.price !== null && !result.error,
        price: result.price,
        currency: result.currency,
        error: result.error,
      }

      if (result.price !== null && !result.error) {
        await supabase
          .from('competitor_products')
          .update({
            current_price: result.price,
            currency: result.currency,
            last_scraped_at: new Date().toISOString(),
          })
          .eq('id', product.id)

        await supabase.from('price_history').insert({
          competitor_product_id: product.id,
          price: result.price,
          currency: result.currency,
          source: 'scrape',
        })
      }

      mapped.push(entry)
    } catch {
      mapped.push({
        id: product.id,
        name: product.name,
        success: false,
        price: null,
        currency: product.currency,
        error: 'Scrape job failed',
      })
    }
  }

  const successCount = mapped.filter(r => r.success).length
  return NextResponse.json({
    results: mapped,
    summary: {
      total: mapped.length,
      success: successCount,
      failed: mapped.length - successCount,
    },
  })
}
