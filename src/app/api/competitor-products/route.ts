import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const competitorId = searchParams.get('competitor_id')

  let query = supabase
    .from('competitor_products')
    .select('*, price_history(price, currency, recorded_at, source)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (competitorId) {
    query = query.eq('competitor_id', competitorId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as Record<string, unknown>

  // Validate competitor belongs to user
  const { data: competitor } = await supabase
    .from('competitors')
    .select('id')
    .eq('id', body.competitor_id)
    .eq('user_id', user.id)
    .single()

  if (!competitor) return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('competitor_products')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Add initial price to history
  await supabase.from('price_history').insert({
    competitor_product_id: data.id,
    price: data.current_price,
    currency: data.currency,
    source: 'manual',
  })

  return NextResponse.json(data, { status: 201 })
}
