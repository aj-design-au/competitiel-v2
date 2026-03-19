'use client'

import { useState, useEffect, useCallback } from 'react'
import { RunAnalysisButton } from '@/components/insights/RunAnalysisButton'
import { AnalysisCard } from '@/components/insights/AnalysisCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Info } from 'lucide-react'
import type { AnalysisOutput } from '@/types'
import { toast } from 'sonner'

interface AnalysisResult {
  id: string
  created_at: string
  competitor_id: string | null
  analysis: AnalysisOutput
  competitors: { name: string } | null
}

interface Competitor {
  id: string
  name: string
}

export default function InsightsPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [hasGeminiKey, setHasGeminiKey] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [analysisRes, competitorRes] = await Promise.all([
        fetch('/api/insights/analyze'),
        fetch('/api/competitors'),
      ])

      if (analysisRes.ok) {
        const data = await analysisRes.json() as AnalysisResult[]
        setAnalyses(data)
      }

      if (competitorRes.ok) {
        const data = await competitorRes.json() as Competitor[]
        setCompetitors(data)
      }
    } catch (err) {
      toast.error('Failed to load insights')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Check for Gemini key (we'll detect from error response)
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAnalysisComplete = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-72" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
          <p className="text-sm text-gray-500 mt-1">
            Powered by Google Gemini 2.0 Flash
          </p>
        </div>

        {competitors.length > 0 ? (
          <RunAnalysisButton
            competitors={competitors}
            onAnalysisComplete={handleAnalysisComplete}
          />
        ) : null}
      </div>

      {!hasGeminiKey && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Gemini API key not configured. Add <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> to your environment variables to enable AI insights.
          </AlertDescription>
        </Alert>
      )}

      {competitors.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No competitors found. Add competitors and their products first, then run an analysis.
          </AlertDescription>
        </Alert>
      )}

      {analyses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No analyses yet
          </h3>
          <p className="text-gray-500 mb-2 max-w-sm mx-auto">
            Run your first AI analysis to get pricing insights and recommendations.
          </p>
          {competitors.length > 0 && (
            <div className="mt-6">
              <RunAnalysisButton
                competitors={competitors}
                onAnalysisComplete={() => { setHasGeminiKey(true); handleAnalysisComplete() }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((result) => (
            <AnalysisCard
              key={result.id}
              analysis={{
                id: result.id,
                createdAt: result.created_at,
                competitorName: result.competitors?.name ?? undefined,
                analysis: result.analysis,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
