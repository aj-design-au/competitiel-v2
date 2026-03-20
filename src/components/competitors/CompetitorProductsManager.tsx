'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/pricing'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Pencil, Trash2, Globe, RefreshCw, Loader2, TrendingDown, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { PriceSparkline } from '@/components/dashboard/PriceSparkline'

interface PriceHistoryPoint {
  price: number
  currency: string
  recorded_at: string
  source: string
}

interface CompetitorProduct {
  id: string
  name: string
  url: string | null
  current_price: number
  currency: string
  last_scraped_at: string | null
  scrape_enabled: boolean
  created_at: string
  updated_at: string
  price_history: PriceHistoryPoint[]
}

const CURRENCIES = ['AUD', 'USD', 'GBP', 'EUR', 'NZD', 'CAD']

interface AddProductDialogProps {
  competitorId: string
  userId: string
  onAdded: (product: CompetitorProduct) => void
}

function AddProductDialog({ competitorId, onAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    url: '',
    current_price: '',
    currency: 'AUD',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/competitor-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitor_id: competitorId,
        name: form.name,
        url: form.url || null,
        current_price: parseFloat(form.current_price),
        currency: form.currency,
      }),
    })

    if (!res.ok) {
      toast.error('Failed to add product')
      setLoading(false)
      return
    }

    const product = await res.json() as CompetitorProduct
    product.price_history = []
    onAdded(product)
    toast.success('Product added')
    setForm({ name: '', url: '', current_price: '', currency: 'AUD' })
    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Competitor Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="cp-name">Product name *</Label>
            <Input
              id="cp-name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Blue Widget 500ml"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-url">Product URL</Label>
            <Input
              id="cp-url"
              type="url"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://competitor.com/product"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cp-price">Price *</Label>
              <Input
                id="cp-price"
                type="number"
                step="0.01"
                min="0"
                value={form.current_price}
                onChange={e => setForm(f => ({ ...f, current_price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={val => setForm(f => ({ ...f, currency: val as string }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Add product
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface CompetitorProductsManagerProps {
  competitorId: string
  userId: string
  initialProducts: CompetitorProduct[]
}

export function CompetitorProductsManager({ competitorId, userId, initialProducts }: CompetitorProductsManagerProps) {
  const [products, setProducts] = useState<CompetitorProduct[]>(initialProducts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [scrapingId, setScrapingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAdded = (product: CompetitorProduct) => {
    setProducts(prev => [product, ...prev])
  }

  const startEdit = (product: CompetitorProduct) => {
    setEditingId(product.id)
    setEditPrice(String(product.current_price))
  }

  const savePrice = async (productId: string) => {
    const newPrice = parseFloat(editPrice)
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Invalid price')
      return
    }
    setSavingId(productId)

    const res = await fetch(`/api/competitor-products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_price: newPrice }),
    })

    if (!res.ok) {
      toast.error('Failed to update price')
      setSavingId(null)
      return
    }

    const updated = await res.json() as CompetitorProduct
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, current_price: updated.current_price, updated_at: updated.updated_at } : p))
    toast.success('Price updated')
    setEditingId(null)
    setSavingId(null)
  }

  const handleScrape = async (product: CompetitorProduct) => {
    if (!product.url) {
      toast.error('No URL set for this product')
      return
    }
    setScrapingId(product.id)
    toast.info('Scraping price... this may take a moment')

    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: product.url, competitor_product_id: product.id }),
    })

    const result = await res.json() as { price: number | null; currency: string; error: string | null }
    if (result.error || result.price === null) {
      toast.error(result.error ?? 'Could not scrape price')
    } else {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, current_price: result.price!, currency: result.currency } : p))
      toast.success(`Price updated: ${formatCurrency(result.price!, result.currency)}`)
    }
    setScrapingId(null)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product? This will also remove price history.')) return
    setDeletingId(productId)

    const res = await fetch(`/api/competitor-products/${productId}`, { method: 'DELETE' })

    if (!res.ok) {
      toast.error('Failed to delete product')
      setDeletingId(null)
      return
    }

    setProducts(prev => prev.filter(p => p.id !== productId))
    toast.success('Product deleted')
    setDeletingId(null)
  }

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-[#9CA3AF]">
          <p className="text-sm mb-4">No products tracked yet.</p>
          <AddProductDialog competitorId={competitorId} userId={userId} onAdded={handleAdded} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddProductDialog competitorId={competitorId} userId={userId} onAdded={handleAdded} />
      </div>

      <div className="space-y-3">
        {products.map((product) => {
          const isEditing = editingId === product.id
          const isSaving = savingId === product.id
          const isScraping = scrapingId === product.id
          const isDeleting = deletingId === product.id

          // Calculate price trend from history
          const history = product.price_history ?? []
          const sortedHistory = [...history]
            .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())

          const firstPrice = sortedHistory.length > 0 ? Number(sortedHistory[0].price) : null
          const currentPrice = Number(product.current_price)
          const priceTrend = firstPrice !== null && firstPrice !== currentPrice
            ? ((currentPrice - firstPrice) / firstPrice) * 100
            : null

          return (
            <div
              key={product.id}
              className="rounded-[24px] border border-[#E5E7EB] bg-[#F8F9FA] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-black truncate">{product.name}</h4>
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-0.5"
                    >
                      <Globe className="h-3 w-3" />
                      View product
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {product.url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-[#9CA3AF] hover:text-black"
                      onClick={() => handleScrape(product)}
                      disabled={isScraping}
                      title="Scrape price (best effort)"
                    >
                      {isScraping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-[#9CA3AF] hover:text-red-600"
                    onClick={() => startEdit(product)}
                    title="Edit price"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-[#9CA3AF] hover:text-red-500"
                    onClick={() => handleDelete(product.id)}
                    disabled={isDeleting}
                    title="Delete"
                  >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      className="w-28 h-7 text-sm"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') savePrice(product.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white" disabled={isSaving} onClick={() => savePrice(product.id)}>
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-bold text-black">
                      {formatCurrency(currentPrice, product.currency)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#9CA3AF]">
                        Updated {formatDistanceToNow(new Date(product.updated_at), { addSuffix: true })}
                      </p>
                      {priceTrend !== null && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${priceTrend > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}
                        >
                          {priceTrend > 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                          {Math.abs(priceTrend).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {sortedHistory.length > 1 && (
                  <div className="ml-auto">
                    <PriceSparkline
                      data={sortedHistory.map(h => ({ price: Number(h.price), recordedAt: h.recorded_at }))}
                      currentPrice={currentPrice}
                    />
                  </div>
                )}
              </div>

              {sortedHistory.length > 0 && (
                <p className="text-xs text-[#9CA3AF] mt-2">
                  {sortedHistory.length} price {sortedHistory.length === 1 ? 'record' : 'records'} in history
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
