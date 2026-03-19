import { ProductForm } from '@/components/products/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = { title: 'New Product' }

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/products" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Product</h1>
        <p className="text-sm text-gray-500 mt-1">Add a product to your portfolio</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <ProductForm mode="create" />
      </div>
    </div>
  )
}
