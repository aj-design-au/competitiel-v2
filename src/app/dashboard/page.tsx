'use client'

import { useState, useEffect, useCallback } from 'react'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { ComparisonTable } from '@/components/dashboard/ComparisonTable'
import { AlertsFeed } from '@/components/dashboard/AlertsFeed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ComparisonRow } from '@/types'
import Link from 'next/link'
import { Plus, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface DashboardData {
  summary: {
    totalProducts: number
    activeCompetitors: number
    activeAlerts: number
    lastAnalysis: string | null
  }
  comparisonRows: ComparisonRow[]
  alerts: Array<{
    id: string
    type: string
    message: string
    createdAt: string
    dismissed: boolean
    actioned: boolean
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      const json = await res.json() as DashboardData
      setData(json)
    } catch (err) {
      toast.error('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    toast.success('Dashboard refreshed')
  }

  const handlePriceUpdate = async (competitorProductId: string, newPrice: number) => {
    const res = await fetch(`/api/competitor-products/${competitorProductId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_price: newPrice }),
    })
    if (!res.ok) throw new Error('Failed to update price')
    await fetchData()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  const hasData = data && (data.summary.totalProducts > 0 || data.summary.activeCompetitors > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Dashboard</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Your competitive pricing overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/insights">
            <Button size="sm" className="bg-black hover:opacity-90 text-white gap-2">
              <Sparkles className="h-4 w-4" />
              Run AI Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <SummaryCards
          totalProducts={data.summary.totalProducts}
          activeCompetitors={data.summary.activeCompetitors}
          activeAlerts={data.summary.activeAlerts}
          lastAnalysis={data.summary.lastAnalysis}
        />
      )}

      {/* Onboarding prompt */}
      {!hasData && (
        <Card className="border border-[#E5E7EB] bg-[#F8F9FA]">
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-xl font-bold text-black mb-2">Get started in 3 steps</h2>
            <p className="text-[#4B5563] mb-6 max-w-md mx-auto">
              Set up your competitive intelligence dashboard by following these steps.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products/new">
                <Button className="bg-black hover:opacity-90 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  1. Add your first product
                </Button>
              </Link>
              <Link href="/competitors/new">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  2. Add a competitor
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content tabs */}
      {hasData && data && (
        <Tabs defaultValue="comparison">
          <TabsList>
            <TabsTrigger value="comparison">Price Comparison</TabsTrigger>
            <TabsTrigger value="alerts" className="relative">
              Alerts
              {data.summary.activeAlerts > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-green-600 text-white text-xs font-bold">
                  {data.summary.activeAlerts > 9 ? '9+' : data.summary.activeAlerts}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-4">
            <ComparisonTable
              rows={data.comparisonRows}
              onPriceUpdate={handlePriceUpdate}
            />
            {data.comparisonRows.length === 0 && data.summary.totalProducts > 0 && (
              <div className="mt-4 text-center text-[#9CA3AF] text-sm">
                <p>You have products but no linked competitors.</p>
                <Link href="/products" className="text-black underline underline-offset-2 hover:opacity-70">
                  Go to Products
                </Link>{' '}
                to link competitors to your products.
              </div>
            )}
          </TabsContent>

          <TabsContent value="alerts" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Active Alerts</CardTitle>
                <Link href="/alerts">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <AlertsFeed initialAlerts={data.alerts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
