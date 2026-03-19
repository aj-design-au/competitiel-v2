'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, X, Check, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface AlertData {
  id: string
  type: string
  message: string
  created_at: string
  dismissed: boolean
  actioned: boolean
  snoozed_until: string | null
  product_links: {
    products: { name: string }
    competitor_products: {
      name: string
      current_price: number
      currency: string
      competitors: { name: string }
    }
  } | null
}

const typeConfig: Record<string, { label: string; color: string }> = {
  price_change: { label: 'Price Change', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  margin_warning: { label: 'Margin Warning', color: 'bg-red-100 text-red-700 border-red-200' },
  undercut: { label: 'Undercut Alert', color: 'bg-orange-100 text-orange-700 border-orange-200' },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [showDismissed, setShowDismissed] = useState(false)

  const fetchAlerts = useCallback(async () => {
    const res = await fetch(`/api/alerts?dismissed=${showDismissed}`)
    if (res.ok) {
      const data = await res.json() as AlertData[]
      setAlerts(data)
    }
    setLoading(false)
  }, [showDismissed])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const updateAlert = async (id: string, updates: Record<string, unknown>) => {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      fetchAlerts()
    }
  }

  const dismissAlert = async (id: string) => {
    await updateAlert(id, { dismissed: true })
    toast.success('Alert dismissed')
  }

  const actionAlert = async (id: string) => {
    await updateAlert(id, { actioned: true, dismissed: true })
    toast.success('Alert marked as actioned')
  }

  const snoozeAlert = async (id: string) => {
    const snoozedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await updateAlert(id, { snoozed_until: snoozedUntil, dismissed: true })
    toast.success('Alert snoozed for 24 hours')
  }

  const dismissAll = async () => {
    await Promise.all(alerts.filter(a => !a.dismissed).map(a => updateAlert(a.id, { dismissed: true })))
    toast.success('All alerts dismissed')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    )
  }

  const activeAlerts = alerts.filter(a => !a.dismissed)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Price Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeAlerts.length} active {activeAlerts.length === 1 ? 'alert' : 'alerts'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="show-dismissed"
              checked={showDismissed}
              onCheckedChange={setShowDismissed}
            />
            <Label htmlFor="show-dismissed" className="text-sm">Show dismissed</Label>
          </div>
          {activeAlerts.length > 1 && (
            <Button variant="outline" size="sm" onClick={dismissAll}>
              Dismiss all
            </Button>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {showDismissed ? 'No alerts found' : 'No active alerts'}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {showDismissed
              ? 'No alerts in history.'
              : "You're all caught up! Alerts appear when competitor prices change significantly or your margins drop."}
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {showDismissed ? 'All Alerts' : 'Active Alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => {
              const type = typeConfig[alert.type] ?? { label: alert.type, color: 'bg-gray-100 text-gray-700' }
              const isActive = !alert.dismissed

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-opacity ${
                    isActive
                      ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60'
                  }`}
                >
                  <Bell className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={`text-xs border ${type.color}`}>
                        {type.label}
                      </Badge>
                      {alert.actioned && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                          Actioned
                        </Badge>
                      )}
                      {alert.dismissed && !alert.actioned && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          Dismissed
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>

                    {alert.product_links && (
                      <div className="mt-1 text-xs text-gray-400">
                        {alert.product_links.products.name} vs{' '}
                        {alert.product_links.competitor_products.competitors.name} —{' '}
                        {alert.product_links.competitor_products.name}
                      </div>
                    )}
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-green-600 hover:text-green-700"
                        onClick={() => actionAlert(alert.id)}
                        title="Mark as actioned"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-gray-400 hover:text-gray-600"
                        onClick={() => snoozeAlert(alert.id)}
                        title="Snooze 24h"
                      >
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-gray-400 hover:text-red-500"
                        onClick={() => dismissAlert(alert.id)}
                        title="Dismiss"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
