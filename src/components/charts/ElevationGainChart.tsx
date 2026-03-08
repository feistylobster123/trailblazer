import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

interface ElevationGainChartProps {
  data: Array<{ distanceKm: number; cumulativeGainM: number }>
  plannedData?: Array<{ distanceKm: number; cumulativeGainM: number }>
  height?: number
  className?: string
}

interface MergedPoint {
  distanceKm: number
  actual?: number
  planned?: number
}

function mergeData(
  actual: ElevationGainChartProps['data'],
  planned: ElevationGainChartProps['plannedData']
): MergedPoint[] {
  const map = new Map<number, MergedPoint>()

  for (const pt of actual) {
    map.set(pt.distanceKm, { distanceKm: pt.distanceKm, actual: pt.cumulativeGainM })
  }

  if (planned) {
    for (const pt of planned) {
      const existing = map.get(pt.distanceKm)
      if (existing) {
        existing.planned = pt.cumulativeGainM
      } else {
        map.set(pt.distanceKm, { distanceKm: pt.distanceKm, planned: pt.cumulativeGainM })
      }
    }
  }

  return [...map.values()].sort((a, b) => a.distanceKm - b.distanceKm)
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-surface border border-border rounded-lg shadow p-3 text-sm">
      <p className="font-semibold text-text mb-2">
        {label != null ? `${Number(label).toFixed(1)} km` : ''}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex gap-2" style={{ color: entry.color }}>
          <span>{entry.name}:</span>
          <span className="font-mono">{Math.round(entry.value)}m</span>
        </p>
      ))}
    </div>
  )
}

export function ElevationGainChart({
  data,
  plannedData,
  height = 280,
  className,
}: ElevationGainChartProps) {
  const chartData = mergeData(data, plannedData)
  const hasPlanned = plannedData != null && plannedData.length > 0

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DA" vertical={false} />

          <XAxis
            dataKey="distanceKm"
            tickFormatter={(v: number) => `${v.toFixed(0)}km`}
            tick={{ fill: '#636E72', fontSize: 12 }}
            axisLine={{ stroke: '#E5E1DA' }}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(v: number) => `${v.toFixed(0)}m`}
            tick={{ fill: '#636E72', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />

          <Tooltip content={<CustomTooltip />} />

          {hasPlanned && (
            <Legend
              wrapperStyle={{ paddingTop: '8px', fontSize: '13px', color: '#636E72' }}
            />
          )}

          {/* Actual cumulative gain as area */}
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual Gain"
            stroke="#1B4332"
            strokeWidth={2}
            fill="url(#elevGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#1B4332', strokeWidth: 0 }}
            connectNulls
          />

          {/* Planned gain as a stepped line overlay */}
          {hasPlanned && (
            <Line
              type="stepAfter"
              dataKey="planned"
              name="Planned Gain"
              stroke="#E76F51"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              activeDot={{ r: 5, fill: '#E76F51', strokeWidth: 0 }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
