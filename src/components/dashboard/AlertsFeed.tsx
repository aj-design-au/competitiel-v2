'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, X, Check, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Alert {
  id: string
  type: string
  message: string
  createdAt: string
  dismissed: boolean
  actioned: boolean
}

interface AlertsFeedProps {
  initialAlerts: Alert[]
}

export function AlertsFeed({ initialAlerts }: AlertsFeedProps) {
  const [alerts, setAlerts] = useState(initialAlerts)

  const updateAlert = async (id: string, updates: Partial<Alert>) => {
    const response = await fetch(`/api/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (response.ok) {
      setAlerts(prev => prev.filter(a => a.id !== id))
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
    await updateAlert(id, { snoozed_until: snoozedUntil } as unknown as Partial<Alert>)
    toast.success('Alert snoozed for 24 hours')
  }

  const typeConfig = {
    price_change: { label: 'Price Change', color: 'bg-blue-100 text-blue-700' },
    margin_warning: { label: 'Margin Warning', color: 'bg-red-100 text-red-700' },
    undercut: { label: 'Undercut Alert', color: 'bg-orange-100 text-orange-700' },
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-[#9CA3AF]">
        <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No active alerts. You&apos;re all caught up!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const type = typeConfig[alert.type as keyof typeof typeConfig] ?? { label: alert.type, color: 'bg-[#F3F4F6] text-[#4B5563]' }
        return (
          <div
            key={alert.id}
            className="flex items-start gap-3 border-b border-[#F3F4F6] px-4 py-3"
          >
            <Bell className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`text-xs ${type.color}`}>{type.label}</Badge>
                <span className="text-xs text-[#9CA3AF]">
                  {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-[#4B5563]">{alert.message}</p>
            </div>
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
                className="h-7 w-7 text-[#9CA3AF] hover:text-[#4B5563]"
                onClick={() => snoozeAlert(alert.id)}
                title="Snooze 24h"
              >
                <Clock className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-[#9CA3AF] hover:text-red-500"
                onClick={() => dismissAlert(alert.id)}
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
