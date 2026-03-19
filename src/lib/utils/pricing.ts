import type { PricingStatus } from '@/types'

export function calculateMargin(price: number, costPrice: number): number {
  if (costPrice <= 0) return 0
  return ((price - costPrice) / price) * 100
}

export function calculatePriceDiff(yourPrice: number, competitorPrice: number): number {
  return yourPrice - competitorPrice
}

export function calculatePriceDiffPct(yourPrice: number, competitorPrice: number): number {
  if (competitorPrice === 0) return 0
  return ((yourPrice - competitorPrice) / competitorPrice) * 100
}

export function getPricingStatus(
  yourPrice: number,
  competitorPrice: number,
  targetMargin: number | null,
  costPrice: number | null
): PricingStatus {
  const diffPct = calculatePriceDiffPct(yourPrice, competitorPrice)

  // If you're more than 5% cheaper, you're underpriced
  if (diffPct < -5) return 'Underpriced'

  // If you're more than 10% more expensive, you're premium
  if (diffPct > 10) return 'Premium'

  // Check margin warning
  if (targetMargin !== null && costPrice !== null) {
    const currentMargin = calculateMargin(yourPrice, costPrice)
    if (currentMargin < targetMargin) return 'Underpriced'
  }

  return 'Competitive'
}

export function formatCurrency(amount: number, currency = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}
