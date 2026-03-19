'use client'

import { useState, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from './StatusBadge'
import { PriceSparkline } from './PriceSparkline'
import { formatCurrency, formatPercent } from '@/lib/utils/pricing'
import type { ComparisonRow } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Check,
  X,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'

interface ComparisonTableProps {
  rows: ComparisonRow[]
  onPriceUpdate?: (competitorProductId: string, newPrice: number) => Promise<void>
}

type SortKey = 'yourProduct' | 'yourPrice' | 'competitor' | 'theirPrice' | 'priceDiff' | 'priceDiffPct' | 'yourMargin' | 'status'
type SortDirection = 'asc' | 'desc'

export function ComparisonTable({ rows, onPriceUpdate }: ComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('priceDiffPct')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterCompetitor, setFilterCompetitor] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const categories = Array.from(new Set(rows.map(r => r.yourProduct.category).filter(Boolean))) as string[]
  const competitors = Array.from(new Set(rows.map(r => r.competitor.name)))

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3 text-green-600" />
      : <ArrowDown className="ml-1 h-3 w-3 text-green-600" />
  }

  const sorted = [...rows]
    .filter(r => filterCategory === 'all' || r.yourProduct.category === filterCategory)
    .filter(r => filterCompetitor === 'all' || r.competitor.name === filterCompetitor)
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sortKey) {
        case 'yourProduct': aVal = a.yourProduct.name; bVal = b.yourProduct.name; break
        case 'yourPrice': aVal = a.yourProduct.price; bVal = b.yourProduct.price; break
        case 'competitor': aVal = a.competitor.name; bVal = b.competitor.name; break
        case 'theirPrice': aVal = a.competitorProduct.price; bVal = b.competitorProduct.price; break
        case 'priceDiff': aVal = a.priceDiff; bVal = b.priceDiff; break
        case 'priceDiffPct': aVal = a.priceDiffPct; bVal = b.priceDiffPct; break
        case 'yourMargin': aVal = a.yourMargin ?? -999; bVal = b.yourMargin ?? -999; break
        case 'status': aVal = a.status; bVal = b.status; break
        default: return 0
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

  const startEdit = (row: ComparisonRow) => {
    setEditingId(row.competitorProduct.id)
    setEditValue(row.competitorProduct.price.toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = useCallback(async (competitorProductId: string) => {
    const newPrice = parseFloat(editValue)
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setSavingId(competitorProductId)
    try {
      await onPriceUpdate?.(competitorProductId, newPrice)
      setEditingId(null)
      setEditValue('')
      toast.success('Price updated successfully')
    } catch {
      toast.error('Failed to update price')
    } finally {
      setSavingId(null)
    }
  }, [editValue, onPriceUpdate])

  const exportCSV = () => {
    const headers = [
      'Your Product',
      'Your Price',
      'Competitor',
      'Competitor Product',
      'Their Price',
      'Price Diff',
      'Price Diff %',
      'Your Margin %',
      'Status',
      'Last Updated',
    ]

    const csvRows = sorted.map(r => [
      r.yourProduct.name,
      r.yourProduct.price.toFixed(2),
      r.competitor.name,
      r.competitorProduct.name,
      r.competitorProduct.price.toFixed(2),
      r.priceDiff.toFixed(2),
      r.priceDiffPct.toFixed(1) + '%',
      r.yourMargin ? r.yourMargin.toFixed(1) + '%' : 'N/A',
      r.status,
      new Date(r.competitorProduct.updatedAt).toLocaleDateString(),
    ])

    const csv = [headers, ...csvRows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `price-comparison-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported to CSV')
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="text-lg font-semibold text-black mb-2">
          No price comparisons yet
        </h3>
        <p className="text-[#9CA3AF] max-w-sm mx-auto">
          Add your products and competitors, then link them together to see price comparisons here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters & Export */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category filter */}
        {categories.length > 0 && (
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? 'all')}>
            <SelectTrigger className="h-8 w-40 text-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Competitor filter */}
        {competitors.length > 1 && (
          <Select value={filterCompetitor} onValueChange={(v) => setFilterCompetitor(v ?? 'all')}>
            <SelectTrigger className="h-8 w-44 text-sm">
              <SelectValue placeholder="All Competitors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Competitors</SelectItem>
              {competitors.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status filter */}
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? 'all')}>
          <SelectTrigger className="h-8 w-36 text-sm">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Underpriced">Underpriced</SelectItem>
            <SelectItem value="Competitive">Competitive</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
          </SelectContent>
        </Select>

        {/* Results count */}
        <Badge variant="secondary" className="ml-auto">
          {sorted.length} {sorted.length === 1 ? 'comparison' : 'comparisons'}
        </Badge>

        {/* Export */}
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-soft overflow-x-auto overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8F9FA] hover:bg-[#F8F9FA]">
              <TableHead
                className="cursor-pointer whitespace-nowrap font-semibold"
                onClick={() => handleSort('yourProduct')}
              >
                <span className="flex items-center">Your Product <SortIcon col="yourProduct" /></span>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap font-semibold text-right"
                onClick={() => handleSort('yourPrice')}
              >
                <span className="flex items-center justify-end">Your Price <SortIcon col="yourPrice" /></span>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap font-semibold"
                onClick={() => handleSort('competitor')}
              >
                <span className="flex items-center">Competitor <SortIcon col="competitor" /></span>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap font-semibold text-right"
                onClick={() => handleSort('theirPrice')}
              >
                <span className="flex items-center justify-end">Their Price <SortIcon col="theirPrice" /></span>
              </TableHead>
              <TableHead className="whitespace-nowrap font-semibold text-center">
                Trend
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap font-semibold text-right"
                onClick={() => handleSort('priceDiff')}
              >
                <span className="flex items-center justify-end">Δ Price <SortIcon col="priceDiff" /></span>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap font-semibold text-right"
                onClick={() => handleSort('priceDiffPct')}
              >
                <span className="flex items-center justify-end">Δ% <SortIcon col="priceDiffPct" /></span>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap font-semibold text-right"
                onClick={() => handleSort('yourMargin')}
              >
                <span className="flex items-center justify-end">Your Margin <SortIcon col="yourMargin" /></span>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap font-semibold"
                onClick={() => handleSort('status')}
              >
                <span className="flex items-center">Status <SortIcon col="status" /></span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => {
              const isEditing = editingId === row.competitorProduct.id
              const isSaving = savingId === row.competitorProduct.id
              const diffColor = row.priceDiff > 0 ? 'text-green-600' : row.priceDiff < 0 ? 'text-red-600' : 'text-[#9CA3AF]'

              return (
                <TableRow
                  key={row.productLinkId}
                  className="border-b border-[#F3F4F6] hover:bg-[#F8F9FA] transition-colors"
                >
                  {/* Your Product */}
                  <TableCell>
                    <div>
                      <div className="font-medium text-black">
                        {row.yourProduct.name}
                      </div>
                      {row.yourProduct.category && (
                        <div className="text-xs text-[#9CA3AF] mt-0.5">{row.yourProduct.category}</div>
                      )}
                    </div>
                  </TableCell>

                  {/* Your Price */}
                  <TableCell className="text-right font-semibold text-black">
                    {formatCurrency(row.yourProduct.price)}
                  </TableCell>

                  {/* Competitor */}
                  <TableCell>
                    <div>
                      <div className="font-medium text-black">
                        {row.competitor.name}
                      </div>
                      <div className="text-xs text-[#9CA3AF] mt-0.5">
                        {row.competitorProduct.name}
                      </div>
                    </div>
                  </TableCell>

                  {/* Their Price - editable */}
                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-24 h-7 text-sm text-right"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(row.competitorProduct.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600"
                          disabled={isSaving}
                          onClick={() => saveEdit(row.competitorProduct.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-gray-500"
                          onClick={cancelEdit}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="group flex items-center justify-end gap-1">
                        <div>
                          <div className="font-semibold">
                            {formatCurrency(row.competitorProduct.price, row.competitorProduct.currency)}
                          </div>
                          <div className="text-xs text-[#9CA3AF]">
                            {formatDistanceToNow(new Date(row.competitorProduct.updatedAt), { addSuffix: true })}
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => startEdit(row)}
                          title="Edit price"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>

                  {/* Trend Sparkline */}
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <PriceSparkline
                        data={row.competitorProduct.priceHistory}
                        currentPrice={row.competitorProduct.price}
                        color={row.priceDiff >= 0 ? '#16A34A' : '#DC2626'}
                      />
                    </div>
                  </TableCell>

                  {/* Price Diff */}
                  <TableCell className={`text-right font-medium ${diffColor}`}>
                    {formatCurrency(Math.abs(row.priceDiff))}
                    {row.priceDiff > 0 ? ' more' : row.priceDiff < 0 ? ' less' : ''}
                  </TableCell>

                  {/* Price Diff % */}
                  <TableCell className={`text-right font-medium ${diffColor}`}>
                    {formatPercent(row.priceDiffPct)}
                  </TableCell>

                  {/* Your Margin */}
                  <TableCell className="text-right">
                    {row.yourMargin !== null ? (
                      <span
                        className={
                          row.yourProduct.targetMargin && row.yourMargin < row.yourProduct.targetMargin
                            ? 'text-red-600 font-medium'
                            : 'text-[#4B5563]'
                        }
                      >
                        {row.yourMargin.toFixed(1)}%
                        {row.yourProduct.targetMargin && (
                          <span className="text-xs text-[#9CA3AF] ml-1">
                            (target: {row.yourProduct.targetMargin}%)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF] text-sm">N/A</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
