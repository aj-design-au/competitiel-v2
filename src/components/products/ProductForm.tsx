'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProductFormData {
  name: string
  description: string
  price: string
  cost_price: string
  target_margin: string
  category: string
  active: boolean
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData> & { id?: string }
  mode: 'create' | 'edit'
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? '',
    cost_price: initialData?.cost_price ?? '',
    target_margin: initialData?.target_margin ?? '',
    category: initialData?.category ?? '',
    active: initialData?.active ?? true,
  })

  const calculatedMargin =
    form.price && form.cost_price
      ? (((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.price)) * 100).toFixed(1)
      : null

  const marginGap =
    calculatedMargin && form.target_margin
      ? (parseFloat(calculatedMargin) - parseFloat(form.target_margin)).toFixed(1)
      : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
      target_margin: form.target_margin ? parseFloat(form.target_margin) : null,
      category: form.category || null,
      active: form.active,
    }

    const url = mode === 'edit' && initialData?.id
      ? `/api/products/${initialData.id}`
      : '/api/products'

    const res = await fetch(url, {
      method: mode === 'edit' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json() as { error: string }
      toast.error(err.error ?? 'Failed to save product')
      setLoading(false)
      return
    }

    const saved = await res.json() as { id: string }
    toast.success(mode === 'edit' ? 'Product updated' : 'Product created')
    router.push(`/products/${saved.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Product name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Blue Widget 500ml"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Optional description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Your selling price *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">$</span>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="pl-7"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_price">Cost price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">$</span>
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              min="0"
              value={form.cost_price}
              onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))}
              className="pl-7"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Calculated margin display */}
      {calculatedMargin && (
        <div className="rounded-[24px] bg-[#F8F9FA] border border-[#E5E7EB] p-4 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-[#4B5563]">Current margin:</span>
            <span className={`font-semibold ${parseFloat(calculatedMargin) < 0 ? 'text-red-600' : 'text-[#4B5563]'}`}>
              {calculatedMargin}%
            </span>
          </div>
          {marginGap !== null && (
            <div className="flex justify-between">
              <span className="text-[#4B5563]">vs target:</span>
              <span className={`font-semibold ${parseFloat(marginGap) < 0 ? 'text-red-600' : 'text-[#4B5563]'}`}>
                {parseFloat(marginGap) > 0 ? '+' : ''}{marginGap}%
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target_margin">Target margin %</Label>
          <div className="relative">
            <Input
              id="target_margin"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={form.target_margin}
              onChange={e => setForm(f => ({ ...f, target_margin: e.target.value }))}
              placeholder="e.g. 30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            placeholder="e.g. Beverages"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="active"
          checked={form.active}
          onCheckedChange={checked => setForm(f => ({ ...f, active: checked }))}
        />
        <Label htmlFor="active">Active (visible in comparisons)</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="bg-black hover:opacity-90 text-white"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === 'edit' ? 'Saving...' : 'Creating...'}</>
          ) : (
            mode === 'edit' ? 'Save changes' : 'Create product'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
