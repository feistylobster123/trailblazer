import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  AreaChart,
  ResponsiveContainer,
} from 'recharts'

interface PaceChartProps {
  data: Array<{
    distanceKm: number
    paceMinPerKm: number
    gapMinPerKm: number
    elevationM?: number
  }>
  averagePace?: number
  height?: number
  className?: string
}

function formatPace(minPerKm: number): string {
  if (!isFinite(minPerKm) || minPerKm <= 0) return '--'
  const mins = Math.floor(minPerKm)
  const secs = Math.round((minPerKm - mins) * 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
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
      <p className="font-semibold text-text mb-2">{label != null ? `${label.toFixed(1)} km` : ''}</p>
      {payload.map((entry) => {
        if (entry.dataKey === 'elevationM') return null
        return (
          <p key={entry.dataKey} className="flex gap-2" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-mono">{formatPace(entry.value)}/km</span>
          </p>
        )
      })}
    </div>
  )
}

// Recharts Y-axis is lowest value at bottom by default.
// For pace, lower numbers = faster, so we reverse the domain
// (larger value at bottom, smaller at top) to make the chart
// read "faster = higher on screen".
function getPaceDomain(data: PaceChartProps['data']): [number, number] {
  const allPaces = data.flatMap((d) => [d.paceMinPerKm, d.gapMinPerKm]).filter(isFinite)
  if (allPaces.length === 0) return [0, 20]
  const min = Math.max(0, Math.min(...allPaces) - 1)
  const max = Math.max(...allPaces) + 1
  // Return [max, min] so the axis is inverted (faster = up)
  return [max, min]
}

export function PaceChart({
  data,
  averagePace,
  height = 320,
  className,
}: PaceChartProps) {
  const domain = getPaceDomain(data)

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <defs>
            <linearGradient id="paceGapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E76F51" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#E76F51" stopOpacity={0.05} />
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
            domain={domain}
            tickFormatter={formatPace}
            tick={{ fill: '#636E72', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
            reversed={false}
            label={{
              value: 'min/km',
              angle: -90,
              position: 'insideLeft',
              offset: -4,
              style: { fill: '#636E72', fontSize: 11 },
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '8px', fontSize: '13px', color: '#636E72' }}
          />

          {averagePace != null && (
            <ReferenceLine
              y={averagePace}
              stroke="#1B4332"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: `Avg ${formatPace(averagePace)}/km`,
                position: 'insideTopRight',
                style: { fill: '#1B4332', fontSize: 11 },
              }}
            />
          )}

          {/* Shaded area between actual pace and GAP */}
          <Area
            type="monotone"
            dataKey="gapMinPerKm"
            name="Grade-Adjusted Pace"
            stroke="#E76F51"
            strokeWidth={2}
            fill="url(#paceGapGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#E76F51', strokeWidth: 0 }}
          />

          {/* Actual pace line on top */}
          <Line
            type="monotone"
            dataKey="paceMinPerKm"
            name="Actual Pace"
            stroke="#1B4332"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#1B4332', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
