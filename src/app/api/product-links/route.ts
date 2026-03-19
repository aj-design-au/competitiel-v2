import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')

  let query = supabase
    .from('product_links')
    .select(`
      *,
      products!inner(id, name, price, cost_price, target_margin, category),
      competitor_products!inner(id, name, current_price, currency, updated_at, competitor_id, competitors!inner(id, name))
    `)

  // Filter by products owned by the user
  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { product_id: string; competitor_product_id: string }

  // Validate ownership
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('id', body.product_id)
    .eq('user_id', user.id)
    .single()

  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('product_links')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
