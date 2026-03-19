'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, User, Key, Bell, Check, Info } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  email: string
  full_name: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [fullName, setFullName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
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

  const hasGeminiKey = process.env.NEXT_PUBLIC_GEMINI_CONFIGURED === 'true' || false

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
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
              className="bg-green-600 hover:bg-green-700 text-white"
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
          <CardDescription>Configure Gemini AI for price analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-[24px] border border-[#E5E7EB]">
            <div>
              <p className="text-sm font-medium text-black">Gemini API Key</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Required for AI insights</p>
            </div>
            <Badge
              variant="outline"
              className={hasGeminiKey ? 'text-green-600 border-green-200' : 'text-orange-600 border-orange-200'}
            >
              {hasGeminiKey ? 'Configured' : 'Not configured'}
            </Badge>
          </div>

          {!hasGeminiKey && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">To enable AI insights:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Get a free API key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Google AI Studio</a></li>
                  <li>Add <code className="bg-[#F3F4F6] px-1 py-0.5 rounded text-xs font-mono">GEMINI_API_KEY=your-key</code> to your environment variables</li>
                  <li>Redeploy the application</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
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
              <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
            </div>
          </div>

          <p className="text-xs text-[#9CA3AF]">
            Note: Alert threshold settings will be saved per-account in a future update.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#4B5563] mb-4">
            Permanently delete your account and all data.
          </p>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
