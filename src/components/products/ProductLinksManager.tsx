'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/pricing'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ExistingLink {
  id: string
  competitor_products: {
    id: string
    name: string
    current_price: number
    currency: string
    updated_at: string
    competitors: { id: string; name: string }
  }
}

interface CompetitorData {
  id: string
  name: string
  competitor_products: Array<{
    id: string
    name: string
    current_price: number
    currency: string
  }>
}

interface ProductLinksManagerProps {
  productId: string
  existingLinks: ExistingLink[]
  competitors: CompetitorData[]
}

export function ProductLinksManager({ productId, existingLinks, competitors }: ProductLinksManagerProps) {
  const router = useRouter()
  const [links, setLinks] = useState(existingLinks)
  const [selectedCpId, setSelectedCpId] = useState('')
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const linkedCpIds = new Set(links.map(l => l.competitor_products.id))

  // Flatten competitor products for select
  const availableCPs = competitors.flatMap(c =>
    c.competitor_products
      .filter(cp => !linkedCpIds.has(cp.id))
      .map(cp => ({
        ...cp,
        competitorName: c.name,
        competitorId: c.id,
      }))
  )

  const handleAdd = async () => {
    if (!selectedCpId) return
    setAdding(true)

    const res = await fetch('/api/product-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        competitor_product_id: selectedCpId,
      }),
    })

    if (!res.ok) {
      toast.error('Failed to link competitor product')
      setAdding(false)
      return
    }

    toast.success('Competitor product linked')
    setSelectedCpId('')
    setAdding(false)
    router.refresh()
  }

  const handleDelete = async (linkId: string) => {
    setDeletingId(linkId)

    const res = await fetch(`/api/product-links/${linkId}`, { method: 'DELETE' })

    if (!res.ok) {
      toast.error('Failed to remove link')
      setDeletingId(null)
      return
    }

    setLinks(prev => prev.filter(l => l.id !== linkId))
    toast.success('Link removed')
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {links.length === 0 ? (
        <p className="text-sm text-[#9CA3AF]">
          No competitor products linked yet.
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-3 rounded-[24px] border border-[#E5E7EB] bg-[#F8F9FA]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="outline" className="text-xs">
                    {link.competitor_products.competitors.name}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-black truncate">
                  {link.competitor_products.name}
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  {formatCurrency(Number(link.competitor_products.current_price), link.competitor_products.currency)}
                  {' · '}
                  {formatDistanceToNow(new Date(link.competitor_products.updated_at), { addSuffix: true })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#9CA3AF] hover:text-red-500 flex-shrink-0"
                onClick={() => handleDelete(link.id)}
                disabled={deletingId === link.id}
              >
                {deletingId === link.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {availableCPs.length > 0 && (
        <div className="flex gap-2">
          <Select value={selectedCpId} onValueChange={(v) => setSelectedCpId(v ?? '')}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select competitor product to link..." />
            </SelectTrigger>
            <SelectContent>
              {competitors.map(c => {
                const available = c.competitor_products.filter(cp => !linkedCpIds.has(cp.id))
                if (available.length === 0) return null
                return available.map(cp => (
                  <SelectItem key={cp.id} value={cp.id}>
                    {c.name} — {cp.name} ({formatCurrency(Number(cp.current_price), cp.currency)})
                  </SelectItem>
                ))
              })}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAdd}
            disabled={!selectedCpId || adding}
            size="sm"
            className="bg-black hover:opacity-90 text-white gap-2"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Link
          </Button>
        </div>
      )}

      {availableCPs.length === 0 && (
        <p className="text-xs text-[#9CA3AF]">
          All competitor products are already linked, or add competitor products first.
        </p>
      )}
    </div>
  )
}
