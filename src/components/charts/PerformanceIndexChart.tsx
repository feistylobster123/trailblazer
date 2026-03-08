import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts'

interface PerformanceIndexChartProps {
  data: Array<{ date: string; value: number; raceName?: string }>
  height?: number
  className?: string
}

const PI_BANDS = [
  { y1: 0, y2: 299, fill: '#F5F5F5', label: 'Newcomer' },
  { y1: 300, y2: 399, fill: '#F0FDF4', label: 'Trail Runner' },
  { y1: 400, y2: 499, fill: '#EFF6FF', label: 'Competitive' },
  { y1: 500, y2: 599, fill: '#FFF7ED', label: 'Expert' },
  { y1: 600, y2: 799, fill: '#FAF5FF', label: 'Elite' },
  { y1: 800, y2: 1000, fill: '#FEFCE8', label: 'World Class' },
]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

interface TooltipPayloadItem {
  value: number
  payload: { date: string; value: number; raceName?: string }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const entry = payload[0].payload

  return (
    <div className="bg-surface border border-border rounded-lg shadow p-3 text-sm">
      <p className="font-semibold text-text">{entry.raceName ?? 'Race'}</p>
      <p className="text-text-secondary">{formatDate(entry.date)}</p>
      <p className="text-primary font-bold mt-1">PI: {entry.value}</p>
    </div>
  )
}

export function PerformanceIndexChart({
  data,
  height = 320,
  className,
}: PerformanceIndexChartProps) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={sorted}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          {PI_BANDS.map((band) => (
            <ReferenceArea
              key={band.label}
              y1={band.y1}
              y2={band.y2}
              fill={band.fill}
              fillOpacity={1}
              ifOverflow="hidden"
            />
          ))}

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DA" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: '#636E72', fontSize: 12 }}
            axisLine={{ stroke: '#E5E1DA' }}
            tickLine={false}
          />

          <YAxis
            domain={[0, 1000]}
            tick={{ fill: '#636E72', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#1B4332"
            strokeWidth={2}
            dot={{ r: 5, fill: '#1B4332', strokeWidth: 0 }}
            activeDot={{ r: 7, fill: '#E76F51', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 px-2">
        {PI_BANDS.map((band) => (
          <span key={band.label} className="flex items-center gap-1 text-xs text-text-secondary">
            <span
              className="inline-block w-3 h-3 rounded-sm border border-border"
              style={{ background: band.fill }}
            />
            {band.label}
          </span>
        ))}
      </div>
    </div>
  )
}
