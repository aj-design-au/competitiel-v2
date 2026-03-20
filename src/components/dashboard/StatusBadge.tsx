import { Badge } from '@/components/ui/badge'
import type { PricingStatus } from '@/types'

interface StatusBadgeProps {
  status: PricingStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    Underpriced: {
      label: 'Underpriced',
      className: 'bg-[#F3F4F6] text-black',
    },
    Competitive: {
      label: 'Competitive',
      className: 'bg-[#F3F4F6] text-[#4B5563]',
    },
    Premium: {
      label: 'Premium',
      className: 'bg-[#F3F4F6] text-[#4B5563]',
    },
  }

  const { label, className } = config[status]

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
