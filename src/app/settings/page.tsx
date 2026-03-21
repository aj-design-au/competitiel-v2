'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Key, Bell, Check, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  email: string
  full_name: string | null
  has_gemini_key: boolean
  gemini_api_key_preview: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [fullName, setFullName] = useState('')
  const [geminiKey, setGeminiKey] = useState('')
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingGeminiKey, setSavingGeminiKey] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json() as ProfileData
          setProfile(data)
          setFullName(data.full_name ?? '')
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [supabase.auth])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName }),
    })

    if (res.ok) {
      toast.success('Profile updated')
      const updated = await res.json() as ProfileData
      setProfile(updated)
    } else {
      toast.error('Failed to update profile')
    }
    setSavingProfile(false)
  }

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingGeminiKey(true)

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemini_api_key: geminiKey || null }),
    })

    if (res.ok) {
      const updated = await res.json() as ProfileData
      setProfile(updated)
      setGeminiKey('')
      toast.success(geminiKey ? 'Gemini API key saved' : 'Gemini API key removed')
    } else {
      toast.error('Failed to save API key')
    }
    setSavingGeminiKey(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#E5E7EB] rounded animate-pulse" />
        <div className="h-64 bg-[#E5E7EB] rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-black">Settings</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email ?? ''}
                disabled
                className="bg-[#F8F9FA]"
              />
              <p className="text-xs text-[#9CA3AF]">Email cannot be changed here.</p>
            </div>
            <Button
              type="submit"
              className="bg-black hover:opacity-90 text-white"
              disabled={savingProfile}
            >
              {savingProfile ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <><Check className="mr-2 h-4 w-4" />Save changes</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" />
            AI Configuration
          </CardTitle>
          <CardDescription>
            Add your Gemini API key to enable AI price analysis. Each user can bring their own key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-[24px] border border-[#E5E7EB]">
            <div>
              <p className="text-sm font-medium text-black">Gemini API Key</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                {profile?.has_gemini_key
                  ? `Key configured (${profile.gemini_api_key_preview})`
                  : 'Not configured'}
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[#4B5563] border-[#E5E7EB]"
            >
              {profile?.has_gemini_key ? 'Active' : 'Not set'}
            </Badge>
          </div>

          <form onSubmit={handleSaveGeminiKey} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="geminiKey">
                {profile?.has_gemini_key ? 'Replace API key' : 'Enter API key'}
              </Label>
              <div className="relative">
                <Input
                  id="geminiKey"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black transition-colors"
                  onClick={() => setShowGeminiKey(v => !v)}
                  aria-label={showGeminiKey ? 'Hide key' : 'Show key'}
                >
                  {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Get a free key at{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline underline-offset-2 hover:opacity-70"
                >
                  Google AI Studio
                </a>
                . Leave blank to use the server-level key if configured.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-black hover:opacity-90 text-white"
                disabled={savingGeminiKey || !geminiKey}
              >
                {savingGeminiKey ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Check className="mr-2 h-4 w-4" />Save key</>
                )}
              </Button>
              {profile?.has_gemini_key && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingGeminiKey}
                  onClick={async () => {
                    setSavingGeminiKey(true)
                    const res = await fetch('/api/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ gemini_api_key: null }),
                    })
                    if (res.ok) {
                      const updated = await res.json() as ProfileData
                      setProfile(updated)
                      setGeminiKey('')
                      toast.success('API key removed')
                    } else {
                      toast.error('Failed to remove key')
                    }
                    setSavingGeminiKey(false)
                  }}
                >
                  Remove key
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Alert Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alert Preferences
          </CardTitle>
          <CardDescription>Configure when you receive price alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-[24px] border border-[#E5E7EB]">
              <div>
                <p className="text-sm font-medium text-black">Price change threshold</p>
                <p className="text-xs text-[#9CA3AF]">Alert when competitor price changes by more than this %</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  defaultValue="5"
                  className="w-20 text-right"
                />
                <span className="text-sm text-[#9CA3AF]">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-[24px] border border-[#E5E7EB]">
              <div>
                <p className="text-sm font-medium text-black">Margin warning</p>
                <p className="text-xs text-[#9CA3AF]">Alert when your margin drops below target</p>
              </div>
              <Badge variant="outline" className="text-[#4B5563] border-[#E5E7EB]">Active</Badge>
            </div>
          </div>

          <p className="text-xs text-[#9CA3AF]">
            Note: Alert threshold settings will be saved per-account in a future update.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Account */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-base text-[#4B5563]">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563] mb-4">
            Permanently delete your account and all data.
          </p>
          <Button variant="outline" className="border-[#E5E7EB] text-[#4B5563] hover:text-black hover:border-[#9CA3AF]">
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
