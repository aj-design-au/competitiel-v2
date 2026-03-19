export interface Profile {
  id: string
  email: string
  fullName: string | null
  createdAt: Date
}

export interface Product {
  id: string
  userId: string
  name: string
  description: string | null
  price: number
  costPrice: number | null
  targetMargin: number | null
  category: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Competitor {
  id: string
  userId: string
  name: string
  websiteUrl: string | null
  platform: string | null
  notes: string | null
  active: boolean
  createdAt: Date
}

export interface CompetitorProduct {
  id: string
  competitorId: string
  userId: string
  name: string
  url: string | null
  currentPrice: number
  currency: string
  lastScrapedAt: Date | null
  scrapeEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PriceHistory {
  id: string
  competitorProductId: string
  price: number
  currency: string
  recordedAt: Date
  source: string
}

export interface ProductLink {
  id: string
  productId: string
  competitorProductId: string
  createdAt: Date
}

export interface PriceAlert {
  id: string
  userId: string
  productLinkId: string | null
  type: 'price_change' | 'margin_warning' | 'undercut'
  message: string
  thresholdPct: number | null
  dismissed: boolean
  actioned: boolean
  snoozedUntil: Date | null
  createdAt: Date
}

export interface AnalysisResult {
  id: string
  userId: string
  competitorId: string | null
  analysis: AnalysisOutput
  createdAt: Date
}

export interface AnalysisOutput {
  competitorName: string
  analysisDate: string
  changesDetected: PriceChange[]
  reasoningForChanges: string
  yourCompetitivePosition: string
  recommendedAdjustments: ProductRecommendation[]
  patternsDetected: string[]
  marketInsightsSummary: string
  overallRiskLevel: 'low' | 'medium' | 'high'
}

export interface PriceChange {
  productName: string
  previousPrice: number
  currentPrice: number
  changePercent: number
  currency: string
}

export interface ProductRecommendation {
  yourProductName: string
  currentYourPrice: number
  recommendedPrice: number
  reasoning: string
  urgency: 'low' | 'medium' | 'high'
}

export type PricingStatus = 'Underpriced' | 'Competitive' | 'Premium'

export interface ComparisonRow {
  productLinkId: string
  yourProduct: {
    id: string
    name: string
    price: number
    costPrice: number | null
    targetMargin: number | null
    category: string | null
  }
  competitor: {
    id: string
    name: string
  }
  competitorProduct: {
    id: string
    name: string
    price: number
    currency: string
    updatedAt: Date
    priceHistory: PriceHistoryPoint[]
  }
  priceDiff: number
  priceDiffPct: number
  yourMargin: number | null
  status: PricingStatus
}

export interface PriceHistoryPoint {
  price: number
  recordedAt: Date
}

export type Platform = 'Shopify' | 'WooCommerce' | 'Amazon' | 'eBay' | 'Other'

export const PLATFORMS: Platform[] = ['Shopify', 'WooCommerce', 'Amazon', 'eBay', 'Other']
