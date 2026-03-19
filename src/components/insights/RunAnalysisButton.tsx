'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Competitor {
  id: string
  name: string
}

interface RunAnalysisButtonProps {
  competitors: Competitor[]
  onAnalysisComplete: () => void
}

export function RunAnalysisButton({ competitors, onAnalysisComplete }: RunAnalysisButtonProps) {
  const [loading, setLoading] = useState(false)
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all')

  const handleRun = async () => {
    setLoading(true)
    toast.info('Running AI analysis... this may take 30–60 seconds.')

    const body: { competitor_id?: string } = {}
    if (selectedCompetitor !== 'all') {
      body.competitor_id = selectedCompetitor
    }

    const res = await fetch('/api/insights/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json() as { error: string }
      if (err.error?.includes('GEMINI_API_KEY')) {
        toast.error('Gemini API key not configured. Please add it in Settings.')
      } else {
        toast.error(err.error ?? 'Analysis failed')
      }
      setLoading(false)
      return
    }

    toast.success('Analysis complete!')
    setLoading(false)
    onAnalysisComplete()
  }

  return (
    <div className="flex items-center gap-3">
      {competitors.length > 1 && (
        <Select value={selectedCompetitor} onValueChange={(v) => setSelectedCompetitor(v ?? 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select competitor..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All competitors</SelectItem>
            {competitors.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button
        onClick={handleRun}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white gap-2"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Analysing...</>
        ) : (
          <><Sparkles className="h-4 w-4" />Run Analysis</>
        )}
      </Button>
    </div>
  )
}
