import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts'

interface SplitComparisonChartProps {
  runnerSplits: Array<{ stationName: string; timeMinutes: number }>
  medianSplits: Array<{ stationName: string; timeMinutes: number }>
  runnerName?: string
  height?: number
  className?: string
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = Math.floor(mins % 60)
  const s = Math.round((mins % 1) * 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
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
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="bg-surface border border-border rounded-lg shadow p-3 text-sm">
      <p className="font-semibold text-text mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="flex gap-2">
          <span>{entry.name}:</span>
          <span className="font-mono">{formatMinutes(entry.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function SplitComparisonChart({
  runnerSplits,
  medianSplits,
  runnerName = 'Runner',
  height = 320,
  className,
}: SplitComparisonChartProps) {
  const medianMap = new Map(medianSplits.map((s) => [s.stationName, s.timeMinutes]))

  const chartData = runnerSplits.map((split) => {
    const median = medianMap.get(split.stationName) ?? split.timeMinutes
    return {
      stationName: split.stationName,
      runner: split.timeMinutes,
      median,
      fasterThanMedian: split.timeMinutes < median,
    }
  })

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 0, bottom: 48 }}
          barCategoryGap="20%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DA" horizontal vertical={false} />

          <XAxis
            dataKey="stationName"
            tick={{ fill: '#636E72', fontSize: 11 }}
            axisLine={{ stroke: '#E5E1DA' }}
            tickLine={false}
            angle={-35}
            textAnchor="end"
            interval={0}
            height={60}
          />

          <YAxis
            tickFormatter={formatMinutes}
            tick={{ fill: '#636E72', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '8px', fontSize: '13px', color: '#636E72' }}
          />

          <Bar dataKey="runner" name={runnerName} radius={[3, 3, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`runner-${index}`}
                fill={entry.fasterThanMedian ? '#52B788' : '#F4A261'}
              />
            ))}
          </Bar>

          <Bar
            dataKey="median"
            name="Median"
            fill="#E5E1DA"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-4 justify-center mt-2 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#52B788' }} />
          Faster than median
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#F4A261' }} />
          Slower than median
        </span>
      </div>
    </div>
  )
}
