import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, business_role, onboarding_complete, gemini_api_key')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return profile with a safe indicator for the key — don't expose full key in the response
  return NextResponse.json({
    ...data,
    has_gemini_key: !!(data?.gemini_api_key),
    // Mask the key — only return the last 4 chars for display
    gemini_api_key_preview: data?.gemini_api_key
      ? `...${(data.gemini_api_key as string).slice(-4)}`
      : null,
    gemini_api_key: undefined,
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    business_role?: string
    onboarding_complete?: boolean
    gemini_api_key?: string | null
  }

  const updates: Record<string, unknown> = {}
  if (body.business_role !== undefined) updates.business_role = body.business_role
  if (body.onboarding_complete !== undefined) updates.onboarding_complete = body.onboarding_complete
  if (body.gemini_api_key !== undefined) {
    updates.gemini_api_key = body.gemini_api_key || null
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, full_name, business_role, onboarding_complete, gemini_api_key')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ...data,
    has_gemini_key: !!(data?.gemini_api_key),
    gemini_api_key_preview: data?.gemini_api_key
      ? `...${(data.gemini_api_key as string).slice(-4)}`
      : null,
    gemini_api_key: undefined,
  })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    full_name?: string
    gemini_api_key?: string | null
  }

  const updates: Record<string, unknown> = {}
  if (body.full_name !== undefined) updates.full_name = body.full_name
  if (body.gemini_api_key !== undefined) {
    // Allow clearing the key by passing null or empty string
    updates.gemini_api_key = body.gemini_api_key || null
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select('id, email, full_name, business_role, onboarding_complete, gemini_api_key')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ...data,
    has_gemini_key: !!(data?.gemini_api_key),
    gemini_api_key_preview: data?.gemini_api_key
      ? `...${(data.gemini_api_key as string).slice(-4)}`
      : null,
    gemini_api_key: undefined,
  })
}
