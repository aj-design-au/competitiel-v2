'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { AnalysisOutput } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, BarChart2 } from 'lucide-react'

interface AnalysisCardProps {
  analysis: {
    id: string
    createdAt: string
    competitorName?: string
    analysis: AnalysisOutput
  }
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(false)
  const data = analysis.analysis

  const riskColors = {
    low: 'bg-[#F3F4F6] text-[#4B5563]',
    medium: 'bg-[#F3F4F6] text-[#4B5563]',
    high: 'bg-[#F3F4F6] text-black',
  }

  const urgencyColors = {
    low: 'text-[#4B5563]',
    medium: 'text-[#4B5563]',
    high: 'text-black font-semibold',
  }

  return (
    <Card className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-soft">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">
                {analysis.competitorName ?? 'Portfolio Analysis'}
              </CardTitle>
              <Badge className={`text-xs ${riskColors[data.overallRiskLevel]}`}>
                {data.overallRiskLevel.charAt(0).toUpperCase() + data.overallRiskLevel.slice(1)} risk
              </Badge>
              {data.changesDetected.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {data.changesDetected.length} price {data.changesDetected.length === 1 ? 'change' : 'changes'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Summary always visible */}
        <p className="text-sm text-[#4B5563] mt-2 leading-relaxed">
          {data.marketInsightsSummary}
        </p>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6 pt-0">
          <Separator />

          {/* Price Changes */}
          {data.changesDetected.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-[#4B5563]" />
                Price Changes Detected
              </h4>
              <div className="space-y-2">
                {data.changesDetected.map((change, i) => (
                  <div key={i} className="flex items-center justify-between text-sm p-2 rounded-xl bg-[#F8F9FA]">
                    <span className="text-[#4B5563]">{change.productName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[#9CA3AF] line-through">
                        ${change.previousPrice.toFixed(2)}
                      </span>
                      <span className="font-semibold">${change.currentPrice.toFixed(2)}</span>
                      <span className={`flex items-center gap-1 ${change.changePercent > 0 ? 'text-black' : 'text-[#4B5563]'}`}>
                        {change.changePercent > 0
                          ? <TrendingUp className="h-3.5 w-3.5" />
                          : <TrendingDown className="h-3.5 w-3.5" />
                        }
                        {Math.abs(change.changePercent).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning */}
          <div>
            <h4 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#4B5563]" />
              Why Prices Likely Changed
            </h4>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {data.reasoningForChanges}
            </p>
          </div>

          {/* Your Position */}
          <div>
            <h4 className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#4B5563]" />
              Your Competitive Position
            </h4>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              {data.yourCompetitivePosition}
            </p>
          </div>

          {/* Recommendations */}
          {data.recommendedAdjustments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#4B5563]" />
                Recommended Adjustments
              </h4>
              <div className="space-y-3">
                {data.recommendedAdjustments.map((rec, i) => (
                  <div key={i} className="p-3 rounded-[24px] border border-[#E5E7EB]">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-black">
                        {rec.yourProductName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs flex-shrink-0 ${urgencyColors[rec.urgency]}`}
                      >
                        {rec.urgency} urgency
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="text-[#9CA3AF]">Current: ${rec.currentYourPrice.toFixed(2)}</span>
                      <span className="text-[#9CA3AF]">→</span>
                      <span className="font-semibold text-black">${rec.recommendedPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {data.patternsDetected.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-black mb-2">
                Patterns Detected
              </h4>
              <ul className="space-y-1.5">
                {data.patternsDetected.map((pattern, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#4B5563]">
                    <span className="text-[#9CA3AF] mt-0.5">•</span>
                    {pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
