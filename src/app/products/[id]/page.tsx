import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/pricing'
import { ProductLinksManager } from '@/components/products/ProductLinksManager'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_links(
        id,
        competitor_products(
          id, name, current_price, currency, updated_at,
          competitors(id, name)
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!product) notFound()

  const margin = product.cost_price
    ? (((product.price - product.cost_price) / product.price) * 100).toFixed(1)
    : null

  // Get competitors for linking
  const { data: competitors } = await supabase
    .from('competitors')
    .select('id, name, competitor_products(id, name, current_price, currency)')
    .eq('user_id', user!.id)
    .eq('active', true)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            {product.category && (
              <Badge variant="secondary" className="mt-1">{product.category}</Badge>
            )}
          </div>
          <Link href={`/products/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {product.description && (
              <>
                <p className="text-gray-600 dark:text-gray-400">{product.description}</p>
                <Separator />
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Selling price</span>
              <span className="font-semibold">{formatCurrency(Number(product.price))}</span>
            </div>
            {product.cost_price && (
              <div className="flex justify-between">
                <span className="text-gray-500">Cost price</span>
                <span>{formatCurrency(Number(product.cost_price))}</span>
              </div>
            )}
            {margin && (
              <div className="flex justify-between">
                <span className="text-gray-500">Current margin</span>
                <span className={`font-semibold ${
                  product.target_margin && parseFloat(margin) < product.target_margin
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {margin}%
                </span>
              </div>
            )}
            {product.target_margin && (
              <div className="flex justify-between">
                <span className="text-gray-500">Target margin</span>
                <span>{product.target_margin}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <Badge variant={product.active ? 'default' : 'secondary'}>
                {product.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Linked competitors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked Competitor Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductLinksManager
              productId={id}
              existingLinks={(product.product_links as Array<{
                id: string
                competitor_products: {
                  id: string
                  name: string
                  current_price: number
                  currency: string
                  updated_at: string
                  competitors: { id: string; name: string }
                }
              }>)}
              competitors={(competitors as Array<{
                id: string
                name: string
                competitor_products: Array<{ id: string; name: string; current_price: number; currency: string }>
              }>) ?? []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
