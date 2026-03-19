import { GoogleGenerativeAI } from '@google/generative-ai'

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

interface AnalysisInput {
  competitorName: string
  competitorProducts: CompetitorProductData[]
  yourProducts: YourProductData[]
}

export async function analyzeCompetitorPricing(
  input: AnalysisInput
): Promise<AnalysisOutput> {
  const apiKey = process.env.GEMINI_API_KEY

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

  const prompt = `You are a competitive pricing intelligence analyst. Analyze the following pricing data and provide actionable insights.

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
  "yourCompetitivePosition": "string - how you're positioned vs this competitor",
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

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const parsed = JSON.parse(text) as AnalysisOutput
    return parsed
  } catch {
    throw new Error('Failed to parse Gemini response as JSON')
  }
}
