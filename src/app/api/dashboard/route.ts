import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getPricingStatus, calculateMargin, calculatePriceDiff, calculatePriceDiffPct } from '@/lib/utils/pricing'

interface SupabaseLink {
  id: string
  product_id: string
  competitor_product_id: string
  products: {
    id: string
    name: string
    price: number
    cost_price: number | null
    target_margin: number | null
    category: string | null
  }
  competitor_products: {
    id: string
    name: string
    current_price: number
    currency: string
    updated_at: string
    last_scraped_at: string | null
    competitor_id: string
    competitors: {
      id: string
      name: string
    }
    price_history: Array<{ price: number; currency: string; recorded_at: string }>
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get products first (needed for product_links query)
  const productsRes = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)

  const products = productsRes.data ?? []
  const productIds = products.map((p: { id: string }) => p.id)

  // Get rest of data in parallel
  const [competitorsRes, alertsRes, linksRes, analysisRes, profileRes] = await Promise.all([
    supabase.from('competitors').select('*').eq('user_id', user.id).eq('active', true),
    supabase.from('price_alerts').select('*').eq('user_id', user.id).eq('dismissed', false),
    productIds.length > 0
      ? supabase.from('product_links').select(`
          id,
          product_id,
          competitor_product_id,
          products!inner(id, name, price, cost_price, target_margin, category),
          competitor_products!inner(
            id, name, current_price, currency, updated_at, last_scraped_at, competitor_id,
            competitors!inner(id, name),
            price_history(price, currency, recorded_at)
          )
        `).in('product_id', productIds)
      : Promise.resolve({ data: [] }),
    supabase.from('analysis_results').select('created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
    supabase.from('profiles').select('business_role').eq('id', user.id).single(),
  ])

  const competitors = competitorsRes.data ?? []
  const alerts = alertsRes.data ?? []
  const links = (linksRes.data ?? []) as unknown as SupabaseLink[]
  const lastAnalysis = analysisRes.data?.[0]?.created_at ?? null
  const businessRole = (profileRes.data?.business_role as string | null) ?? null

  const comparisonRows = links.map((link) => {
    const product = link.products
    const cp = link.competitor_products
    const competitor = cp.competitors
    const history = cp.price_history ?? []

    const yourPrice = Number(product.price)
    const theirPrice = Number(cp.current_price)

    const sortedHistory = [...history]
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-30)
      .map(h => ({ price: Number(h.price), recordedAt: h.recorded_at }))

    return {
      productLinkId: link.id,
      yourProduct: {
        id: product.id,
        name: product.name,
        price: yourPrice,
        costPrice: product.cost_price ? Number(product.cost_price) : null,
        targetMargin: product.target_margin ? Number(product.target_margin) : null,
        category: product.category,
      },
      competitor: {
        id: competitor.id,
        name: competitor.name,
      },
      competitorProduct: {
        id: cp.id,
        name: cp.name,
        price: theirPrice,
        currency: cp.currency,
        updatedAt: cp.updated_at,
        lastScrapedAt: cp.last_scraped_at,
        priceHistory: sortedHistory,
      },
      priceDiff: calculatePriceDiff(yourPrice, theirPrice),
      priceDiffPct: calculatePriceDiffPct(yourPrice, theirPrice),
      yourMargin: product.cost_price
        ? calculateMargin(yourPrice, Number(product.cost_price))
        : null,
      status: getPricingStatus(
        yourPrice,
        theirPrice,
        product.target_margin ? Number(product.target_margin) : null,
        product.cost_price ? Number(product.cost_price) : null
      ),
    }
  })

  // Compute role-specific insights
  const aboveMarketRows = comparisonRows.filter(r => r.status === 'Premium')
  const aboveMarketCount = aboveMarketRows.length

  // Margin uplift for wholesaler: sum potential savings where a cheaper competitor exists
  const marginUplift = comparisonRows.reduce((acc, r) => {
    if (r.status === 'Premium' && r.yourProduct.costPrice) {
      // Competitor is cheaper — potential savings is the price gap per unit
      return acc + Math.abs(r.priceDiff)
    }
    return acc
  }, 0)

  const roleInsights = {
    aboveMarketCount,
    undercutCount: aboveMarketCount,
    mapViolations: aboveMarketCount,
    marginUplift: Math.round(marginUplift * 100) / 100,
  }

  return NextResponse.json({
    summary: {
      totalProducts: products.length,
      activeCompetitors: competitors.length,
      activeAlerts: alerts.length,
      lastAnalysis,
    },
    comparisonRows,
    alerts: alerts.slice(0, 5),
    businessRole,
    roleInsights,
  })
}
