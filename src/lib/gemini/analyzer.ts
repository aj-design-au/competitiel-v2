import { GoogleGenerativeAI } from '@google/generative-ai'

export type BusinessRole = 'retailer' | 'wholesaler' | 'brand_owner' | null

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

interface CompetitorProductData {
  name: string
  currentPrice: number
  currency: string
  priceHistory7d: Array<{ price: number; recordedAt: string }>
  priceHistory30d: Array<{ price: number; recordedAt: string }>
}

interface YourProductData {
  name: string
  price: number
  costPrice: number | null
  targetMargin: number | null
  category: string | null
  linkedCompetitorProduct: string | null
}

export interface AnalysisInput {
  competitorName: string
  competitorProducts: CompetitorProductData[]
  yourProducts: YourProductData[]
  businessRole?: BusinessRole
  apiKey?: string
}

function getRoleSpecificGuidance(role: BusinessRole): string {
  switch (role) {
    case 'retailer':
      return `
ROLE CONTEXT: The user is a Retailer. Focus your analysis on:
- Which products are priced above or below the market average
- Where the user is being undercut and by how much
- Which prices should be adjusted to stay competitive without reducing margin
- What pricing patterns the competitor uses (e.g. always 5% below, psychological pricing like .99 endings)
- Frame "yourCompetitivePosition" in terms of: how competitive are you in the market right now
- Frame recommendations around protecting or growing market share`

    case 'wholesaler':
      return `
ROLE CONTEXT: The user is a Wholesaler/Distributor. Focus your analysis on:
- Which supplier or competitor has the lowest price on each product
- What the potential margin uplift is if sourcing from the cheapest available option
- Products where the user is currently overpaying significantly
- Price trends: is this supplier trending cheaper or more expensive over time
- Frame "yourCompetitivePosition" in terms of: margin opportunity and sourcing efficiency
- Frame recommendations around reducing cost of goods and improving purchase margins`

    case 'brand_owner':
      return `
ROLE CONTEXT: The user is a Brand Owner. Focus your analysis on:
- Whether any sellers are pricing below the MAP (Minimum Advertised Price) — treat your listed price as the MAP
- Who the highest and lowest price sellers are for each product
- Whether any sellers appear unauthorised (price significantly below RRP suggests grey market activity)
- Price consistency across the channel: is the brand being heavily discounted
- Frame "yourCompetitivePosition" in terms of: brand price integrity and channel compliance
- Frame recommendations around protecting brand equity and enforcing pricing standards`

    default:
      return `
Focus on competitive positioning, price gaps, and actionable pricing recommendations.`
  }
}

export async function analyzeCompetitorPricing(
  input: AnalysisInput
): Promise<AnalysisOutput> {
  const apiKey = input.apiKey || process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const roleGuidance = getRoleSpecificGuidance(input.businessRole ?? null)

  const prompt = `You are a competitive pricing intelligence analyst. Analyze the following pricing data and provide actionable insights.
${roleGuidance}

Competitor: ${input.competitorName}
Analysis Date: ${new Date().toISOString()}

Competitor Products & Price History:
${JSON.stringify(input.competitorProducts, null, 2)}

Your Products:
${JSON.stringify(input.yourProducts, null, 2)}

Provide a comprehensive analysis in the following JSON format:
{
  "competitorName": "string",
  "analysisDate": "ISO date string",
  "changesDetected": [
    {
      "productName": "string",
      "previousPrice": number,
      "currentPrice": number,
      "changePercent": number,
      "currency": "string"
    }
  ],
  "reasoningForChanges": "string - explain why competitor likely changed prices",
  "yourCompetitivePosition": "string - how you're positioned vs this competitor (role-specific framing)",
  "recommendedAdjustments": [
    {
      "yourProductName": "string",
      "currentYourPrice": number,
      "recommendedPrice": number,
      "reasoning": "string",
      "urgency": "low|medium|high"
    }
  ],
  "patternsDetected": ["string - e.g. weekend drops, seasonal pricing, aggressive discounting"],
  "marketInsightsSummary": "string - 2-3 sentence executive summary",
  "overallRiskLevel": "low|medium|high"
}

Be specific, actionable, and data-driven. Focus on practical recommendations.`

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Gemini analysis timed out after 25 seconds')), 25000)
  })

  const analysisPromise = model.generateContent(prompt)
  const result = await Promise.race([analysisPromise, timeoutPromise])
  const text = result.response.text()

  try {
    const parsed = JSON.parse(text) as AnalysisOutput
    return parsed
  } catch {
    throw new Error('Failed to parse Gemini response as JSON')
  }
}
