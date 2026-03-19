import { ProductForm } from '@/components/products/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'New Product' }

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#4B5563] mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-black">Add Product</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">Add a product to your portfolio</p>
      </div>
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-soft p-6">
        <ProductForm mode="create" />
      </div>
    </div>
  )
}
