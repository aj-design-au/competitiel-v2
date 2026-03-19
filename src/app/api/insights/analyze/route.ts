import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { analyzeCompetitorPricing } from '@/lib/gemini/analyzer'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY not configured. Please add it in Settings.' },
      { status: 400 }
    )
  }

  const { competitor_id } = await request.json() as { competitor_id?: string }

  // Get competitor data
  let competitorQuery = supabase
    .from('competitors')
    .select(`
      id, name,
      competitor_products(
        id, name, current_price, currency,
        price_history(price, currency, recorded_at)
      )
    `)
    .eq('user_id', user.id)

  if (competitor_id) {
    competitorQuery = competitorQuery.eq('id', competitor_id)
  }

  const { data: competitors, error: compError } = await competitorQuery
  if (compError) return NextResponse.json({ error: compError.message }, { status: 500 })
  if (!competitors || competitors.length === 0) {
    return NextResponse.json({ error: 'No competitors found' }, { status: 404 })
  }

  // Get user's products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, cost_price, target_margin, category, product_links(competitor_product_id)')
    .eq('user_id', user.id)

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  interface CompetitorData {
    id: string
    name: string
    competitor_products: Array<{
      id: string
      name: string
      current_price: number
      currency: string
      price_history: Array<{ price: number; currency: string; recorded_at: string }>
    }>
  }

  interface ProductData {
    id: string
    name: string
    price: number
    cost_price: number | null
    target_margin: number | null
    category: string | null
    product_links: Array<{ competitor_product_id: string }>
  }

  const analysisResults = []

  for (const competitor of (competitors as CompetitorData[])) {
    const competitorProducts = competitor.competitor_products.map((cp) => {
      const history = cp.price_history ?? []
      const history7d = history
        .filter(h => new Date(h.recorded_at) >= sevenDaysAgo)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      const history30d = history
        .filter(h => new Date(h.recorded_at) >= thirtyDaysAgo)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())

      return {
        name: cp.name,
        currentPrice: Number(cp.current_price),
        currency: cp.currency,
        priceHistory7d: history7d.map(h => ({ price: Number(h.price), recordedAt: h.recorded_at })),
        priceHistory30d: history30d.map(h => ({ price: Number(h.price), recordedAt: h.recorded_at })),
      }
    })

    const linkedProductIds = new Set(
      competitor.competitor_products.map(cp => cp.id)
    )

    const yourProducts = (products as ProductData[] ?? []).map((p) => {
      const linkedCpId = p.product_links.find(pl => linkedProductIds.has(pl.competitor_product_id))
      return {
        name: p.name,
        price: Number(p.price),
        costPrice: p.cost_price ? Number(p.cost_price) : null,
        targetMargin: p.target_margin ? Number(p.target_margin) : null,
        category: p.category,
        linkedCompetitorProduct: linkedCpId?.competitor_product_id ?? null,
      }
    })

    const analysis = await analyzeCompetitorPricing({
      competitorName: competitor.name,
      competitorProducts,
      yourProducts,
    })

    // Save to database
    const { data: saved } = await supabase
      .from('analysis_results')
      .insert({
        user_id: user.id,
        competitor_id: competitor.id,
        analysis,
      })
      .select()
      .single()

    analysisResults.push(saved)
  }

  return NextResponse.json({ results: analysisResults })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('analysis_results')
    .select('*, competitors(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
