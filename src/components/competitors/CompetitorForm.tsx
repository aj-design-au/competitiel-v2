'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PLATFORMS } from '@/types'

interface CompetitorFormData {
  name: string
  website_url: string
  platform: string
  notes: string
  active: boolean
}

interface CompetitorFormProps {
  initialData?: Partial<CompetitorFormData> & { id?: string }
  mode: 'create' | 'edit'
}

export function CompetitorForm({ initialData, mode }: CompetitorFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CompetitorFormData>({
    name: initialData?.name ?? '',
    website_url: initialData?.website_url ?? '',
    platform: initialData?.platform ?? '',
    notes: initialData?.notes ?? '',
    active: initialData?.active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name: form.name,
      website_url: form.website_url || null,
      platform: form.platform || null,
      notes: form.notes || null,
      active: form.active,
    }

    const url = mode === 'edit' && initialData?.id
      ? `/api/competitors/${initialData.id}`
      : '/api/competitors'

    const res = await fetch(url, {
      method: mode === 'edit' ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json() as { error: string }
      toast.error(err.error ?? 'Failed to save competitor')
      setLoading(false)
      return
    }

    const saved = await res.json() as { id: string }
    toast.success(mode === 'edit' ? 'Competitor updated' : 'Competitor added')
    router.push(`/competitors/${saved.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Competitor name *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Acme Store"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          type="url"
          value={form.website_url}
          onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-2">
        <Label>Platform</Label>
        <Select
          value={form.platform}
          onValueChange={val => setForm(f => ({ ...f, platform: val as string }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select platform..." />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Any notes about this competitor..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="active"
          checked={form.active}
          onCheckedChange={checked => setForm(f => ({ ...f, active: checked }))}
        />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="bg-black hover:opacity-90 text-white"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{mode === 'edit' ? 'Saving...' : 'Adding...'}</>
          ) : (
            mode === 'edit' ? 'Save changes' : 'Add competitor'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
