import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const showDismissed = searchParams.get('dismissed') === 'true'

  let query = supabase
    .from('price_alerts')
    .select('*, product_links(*, products!inner(name), competitor_products!inner(name, current_price, currency, competitors!inner(name)))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!showDismissed) {
    query = query.eq('dismissed', false)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
