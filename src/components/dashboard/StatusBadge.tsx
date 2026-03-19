import { Badge } from '@/components/ui/badge'
import type { PricingStatus } from '@/types'

interface StatusBadgeProps {
  status: PricingStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    Underpriced: {
      label: 'Underpriced',
      className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
      emoji: '🔴',
    },
    Competitive: {
      label: 'Competitive',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      emoji: '🟡',
    },
    Premium: {
      label: 'Premium',
      className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
      emoji: '🟢',
    },
  }

  const { label, className, emoji } = config[status]

  return (
    <Badge variant="outline" className={`font-medium text-xs ${className}`}>
      {emoji} {label}
    </Badge>
  )
}
