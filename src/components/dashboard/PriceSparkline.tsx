'use client'

import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts'

interface PriceHistoryPoint {
  price: number
  recordedAt: string | Date
}

interface PriceSparklineProps {
  data: PriceHistoryPoint[]
  currentPrice: number
  color?: string
}

export function PriceSparkline({ data, currentPrice, color = '#16A34A' }: PriceSparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center h-10 w-24 text-xs text-gray-400">
        No history
      </div>
    )
  }

  // Add current price as the latest point if not already there
  const chartData = [
    ...data.map(d => ({
      price: Number(d.price),
      date: new Date(d.recordedAt).toLocaleDateString(),
    })),
    { price: currentPrice, date: 'Now' },
  ]

  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 11, padding: '4px 8px' }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
            labelFormatter={(label) => String(label)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
