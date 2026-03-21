import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_ROLES = ['retailer', 'wholesaler', 'brand_owner'] as const
type BusinessRole = typeof VALID_ROLES[number]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { business_role } = await request.json() as { business_role: string }

  if (!VALID_ROLES.includes(business_role as BusinessRole)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Save to profiles table
  const { error } = await supabase
    .from('profiles')
    .update({
      business_role,
      onboarding_complete: true,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update Supabase auth user metadata so middleware can check without a DB call
  await supabase.auth.updateUser({
    data: { business_role, onboarding_complete: true },
  })

  return NextResponse.json({ success: true })
}
