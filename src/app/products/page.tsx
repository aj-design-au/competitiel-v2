import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Package, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/pricing'

export const metadata = { title: 'Products' }

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('*, product_links(count)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Products</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Your product portfolio</p>
        </div>
        <Link href="/products/new">
          <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </Link>
      </div>

      {(!products || products.length === 0) ? (
        <div className="rounded-[24px] border-2 border-dashed border-[#E5E7EB] p-12 text-center">
          <Package className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">
            No products yet
          </h3>
          <p className="text-[#9CA3AF] mb-6 max-w-sm mx-auto">
            Add your first product to start tracking it against competitors.
          </p>
          <Link href="/products/new">
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              Add your first product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const linkCount = (product.product_links as Array<{ count: number }>)[0]?.count ?? 0
            const margin = product.cost_price
              ? (((product.price - product.cost_price) / product.price) * 100).toFixed(1)
              : null
            const marginBelowTarget = margin && product.target_margin
              ? parseFloat(margin) < product.target_margin
              : false

            return (
              <Card key={product.id} className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-soft hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black truncate">
                        {product.name}
                      </h3>
                      {product.category && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                    <Badge variant={product.active ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                      {product.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Selling price</span>
                      <span className="font-semibold text-black">
                        {formatCurrency(Number(product.price))}
                      </span>
                    </div>
                    {product.cost_price && (
                      <div className="flex justify-between">
                        <span className="text-[#9CA3AF]">Cost price</span>
                        <span className="text-[#4B5563]">
                          {formatCurrency(Number(product.cost_price))}
                        </span>
                      </div>
                    )}
                    {margin && (
                      <div className="flex justify-between">
                        <span className="text-[#9CA3AF]">Margin</span>
                        <span className={`font-medium ${marginBelowTarget ? 'text-red-600' : 'text-green-600'}`}>
                          {margin}%
                          {product.target_margin && (
                            <span className="text-[#9CA3AF] font-normal text-xs ml-1">
                              (target: {product.target_margin}%)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#9CA3AF]">Linked competitors</span>
                      <span className="text-[#4B5563]">{linkCount}</span>
                    </div>
                  </div>

                  <Link href={`/products/${product.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ExternalLink className="h-3.5 w-3.5" />
                      View details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
