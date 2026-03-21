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

interface RoleInsights {
  aboveMarketCount: number
  undercutCount: number
  mapViolations: number
  marginUplift: number
}

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
  businessRole: string | null
  roleInsights: RoleInsights
}

function PositionBanner({ role }: { role: string | null }) {
  let message: string
  switch (role) {
    case 'retailer':
      message = 'Track competitor prices and get alerts when you are being undercut.'
      break
    case 'wholesaler':
    case 'distributor':
      message = 'Find the best source prices and maximise your margin.'
      break
    case 'brand_owner':
      message = 'Monitor your brand pricing across all sellers.'
      break
    default:
      message = 'Complete setup to unlock AI-powered pricing insights.'
  }

  return (
    <div className="bg-[#F8F9FA] rounded-[24px] border border-[#E5E7EB] px-6 py-4 text-sm text-[#4B5563]">
      {message}
    </div>
  )
}

function RoleBanner({ role, insights }: { role: string | null; insights: RoleInsights }) {
  if (!role || insights.aboveMarketCount === 0) return null

  let message: string
  switch (role) {
    case 'retailer':
      message = insights.undercutCount === 1
        ? `1 competitor is undercutting you. Review your prices to stay competitive.`
        : `${insights.undercutCount} competitors are undercutting you. Review your prices to stay competitive.`
      break
    case 'wholesaler':
      message = insights.aboveMarketCount === 1
        ? `1 product has a lower competitor price available. Potential saving: $${insights.marginUplift.toFixed(2)}.`
        : `${insights.aboveMarketCount} products have lower competitor prices available. Potential saving: $${insights.marginUplift.toFixed(2)}.`
      break
    case 'brand_owner':
      message = insights.mapViolations === 1
        ? `1 potential MAP violation detected where a seller is pricing below your listed price.`
        : `${insights.mapViolations} potential MAP violations detected where sellers are pricing below your listed price.`
      break
    default:
      return null
  }

  return (
    <div className="rounded-[24px] border border-[#E5E7EB] bg-white px-6 py-4 flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-black">{message}</p>
      <Link href="/insights">
        <Button size="sm" variant="outline" className="shrink-0">
          Run analysis
        </Button>
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshingPrices, setRefreshingPrices] = useState(false)

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

  const handleRefreshAllPrices = async () => {
    setRefreshingPrices(true)
    toast.info('Refreshing all prices...')

    try {
      const res = await fetch('/api/scrape/batch', { method: 'POST' })
      const result = await res.json() as { summary?: { success: number; total: number }; message?: string }
      if (res.ok && result.summary) {
        toast.success(`Updated ${result.summary.success} of ${result.summary.total} prices`)
        await fetchData()
      } else {
        toast.error(result.message ?? 'Batch scrape failed')
      }
    } catch {
      toast.error('Failed to refresh prices')
    } finally {
      setRefreshingPrices(false)
    }
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

  const dashboardTitle = () => {
    switch (data?.businessRole) {
      case 'retailer': return 'Your competitive position'
      case 'wholesaler': return 'Your margin opportunity'
      case 'brand_owner': return 'MAP compliance'
      default: return 'Dashboard'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">{dashboardTitle()}</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Your competitive pricing overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAllPrices}
            disabled={refreshingPrices}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshingPrices ? 'animate-spin' : ''}`} />
            Refresh All Prices
          </Button>
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

      {/* Static role guidance banner */}
      {data && (
        <PositionBanner role={data.businessRole} />
      )}

      {/* Role-aware competitive position banner */}
      {data && hasData && (
        <RoleBanner role={data.businessRole} insights={data.roleInsights} />
      )}

      {/* Empty state — step-by-step guide */}
      {!hasData && (
        <Card className="border border-[#E5E7EB] bg-white rounded-[32px]">
          <CardContent className="py-12 px-10">
            <h2 className="text-xl font-bold text-black mb-1">Get started</h2>
            <p className="text-[#4B5563] mb-8 max-w-md">
              Follow these steps to set up your competitive intelligence dashboard.
            </p>
            <div className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'Add your products',
                  description: 'Enter the products you sell with their current prices and cost prices.',
                  href: '/products/new',
                  action: 'Add a product',
                },
                {
                  step: '2',
                  title: 'Add competitors',
                  description: 'Add the businesses you want to track pricing for.',
                  href: '/competitors/new',
                  action: 'Add a competitor',
                },
                {
                  step: '3',
                  title: 'Link products to competitors',
                  description: 'Connect your products to the equivalent competitor products so prices can be compared.',
                  href: '/products',
                  action: 'Go to products',
                },
                {
                  step: '4',
                  title: 'Run AI analysis',
                  description: 'Get role-specific pricing intelligence and recommendations from Gemini AI.',
                  href: '/insights',
                  action: 'Go to insights',
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F3F4F6] text-black text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black text-sm">{item.title}</p>
                    <p className="text-sm text-[#4B5563] mt-0.5">{item.description}</p>
                  </div>
                  <Link href={item.href} className="flex-shrink-0">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      {item.action}
                    </Button>
                  </Link>
                </div>
              ))}
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
                <span className="ml-2 inline-flex items-center justify-center h-4 w-4 rounded-full bg-black text-white text-xs font-bold">
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
