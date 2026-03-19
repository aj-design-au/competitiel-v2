import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership via products table
  const { data: link } = await supabase
    .from('product_links')
    .select('id, products!inner(user_id)')
    .eq('id', id)
    .single()

  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('product_links').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
