import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { scrapePrice } from '@/lib/scraper'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, competitor_product_id } = await request.json() as { url: string; competitor_product_id?: string }

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const result = await scrapePrice(url)

  // If we have a competitor_product_id and a valid price, update the product
  if (competitor_product_id && result.price !== null && !result.error) {
    const { data: cp } = await supabase
      .from('competitor_products')
      .select('id')
      .eq('id', competitor_product_id)
      .eq('user_id', user.id)
      .single()

    if (cp) {
      await supabase
        .from('competitor_products')
        .update({
          current_price: result.price,
          currency: result.currency,
          last_scraped_at: new Date().toISOString(),
        })
        .eq('id', competitor_product_id)

      // Add to history
      await supabase.from('price_history').insert({
        competitor_product_id,
        price: result.price,
        currency: result.currency,
        source: 'scrape',
      })
    }
  }

  return NextResponse.json(result)
}
