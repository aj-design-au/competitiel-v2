'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, Bell, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SummaryCardsProps {
  totalProducts: number
  activeCompetitors: number
  activeAlerts: number
  lastAnalysis: string | null
}

export function SummaryCards({
  totalProducts,
  activeCompetitors,
  activeAlerts,
  lastAnalysis,
}: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Products',
      value: totalProducts,
      description: 'In your portfolio',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Competitors',
      value: activeCompetitors,
      description: 'Being tracked',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Price Alerts',
      value: activeAlerts,
      description: activeAlerts === 1 ? 'Alert needs attention' : 'Alerts need attention',
      icon: Bell,
      color: activeAlerts > 0 ? 'text-orange-600' : 'text-gray-600',
      bg: activeAlerts > 0 ? 'bg-orange-50' : 'bg-gray-50',
    },
    {
      title: 'Last Analysis',
      value: lastAnalysis
        ? formatDistanceToNow(new Date(lastAnalysis), { addSuffix: true })
        : 'Never',
      description: 'AI insights run',
      icon: Sparkles,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="bg-white dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
