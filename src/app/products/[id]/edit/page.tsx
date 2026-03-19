import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ProductForm } from '@/components/products/ProductForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/products/${id}`} className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#4B5563] mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Product
        </Link>
        <h1 className="text-2xl font-bold text-black">Edit Product</h1>
      </div>
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-soft p-6">
        <ProductForm
          mode="edit"
          initialData={{
            id: product.id,
            name: product.name,
            description: product.description ?? '',
            price: String(product.price),
            cost_price: product.cost_price ? String(product.cost_price) : '',
            target_margin: product.target_margin ? String(product.target_margin) : '',
            category: product.category ?? '',
            active: product.active,
          }}
        />
      </div>
    </div>
  )
}
