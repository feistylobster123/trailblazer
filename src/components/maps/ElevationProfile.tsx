import { useMemo } from 'react'
import type { ElevationPoint, AidStation } from '@/types/race.ts'

interface ElevationProfileProps {
  elevationData: ElevationPoint[]
  aidStations?: AidStation[]
  runnerDistanceKm?: number
  height?: number
  className?: string
  unit?: 'metric' | 'imperial'
}

const PADDING = { top: 20, right: 20, bottom: 40, left: 50 }
const VIEWBOX_WIDTH = 800
const PRIMARY = '#1B4332'
const PRIMARY_LIGHT = '#2D6A4F'
const TEXT_SECONDARY = '#636E72'
const TEXT_MUTED = '#B2BEC3'
const ACCENT = '#E76F51'
const BORDER = '#E5E1DA'

const KM_TO_MI = 0.621371
const M_TO_FT = 3.28084

function formatDistance(km: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    return `${(km * KM_TO_MI).toFixed(1)}`
  }
  return `${km.toFixed(1)}`
}

function formatElevation(m: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'imperial') {
    return `${Math.round(m * M_TO_FT).toLocaleString()}`
  }
  return `${Math.round(m).toLocaleString()}`
}

export function ElevationProfile({
  elevationData,
  aidStations = [],
  runnerDistanceKm,
  height = 200,
  className = '',
  unit = 'metric',
}: ElevationProfileProps) {
  const computed = useMemo(() => {
    if (elevationData.length === 0) {
      return null
    }

    const plotWidth = VIEWBOX_WIDTH - PADDING.left - PADDING.right
    const plotHeight = height - PADDING.top - PADDING.bottom

    const maxDist = elevationData[elevationData.length - 1].distanceKm
    const elevations = elevationData.map((p) => p.elevationM)
    const minElev = Math.min(...elevations)
    const maxElev = Math.max(...elevations)

    // Add 5% padding to elevation range
    const elevRange = maxElev - minElev || 1
    const elevPadding = elevRange * 0.05
    const yMin = minElev - elevPadding
    const yMax = maxElev + elevPadding

    const toX = (km: number) => PADDING.left + (km / maxDist) * plotWidth
    const toY = (m: number) => PADDING.top + plotHeight - ((m - yMin) / (yMax - yMin)) * plotHeight

    // Build the area path (filled) and line path
    const linePoints = elevationData.map((p) => `${toX(p.distanceKm)},${toY(p.elevationM)}`)
    const linePath = `M${linePoints.join(' L')}`

    const areaPath = `${linePath} L${toX(maxDist)},${PADDING.top + plotHeight} L${PADDING.left},${PADDING.top + plotHeight} Z`

    // X-axis ticks (roughly 6-8 ticks)
    const xTickCount = Math.min(8, Math.max(3, Math.floor(maxDist / 10)))
    const xTickInterval = maxDist / xTickCount
    const xTicks: number[] = []
    for (let i = 0; i <= xTickCount; i++) {
      xTicks.push(i * xTickInterval)
    }

    // Y-axis ticks (roughly 4-5 ticks)
    const yTickCount = 4
    const yTickInterval = (yMax - yMin) / yTickCount
    const yTicks: number[] = []
    for (let i = 0; i <= yTickCount; i++) {
      yTicks.push(yMin + i * yTickInterval)
    }

    // Aid station lines
    const aidLines = aidStations
      .filter((s) => s.distanceKm <= maxDist)
      .map((s) => ({
        x: toX(s.distanceKm),
        name: s.name,
        distanceKm: s.distanceKm,
      }))

    // Runner position
    let runnerX: number | null = null
    let runnerY: number | null = null
    if (runnerDistanceKm != null && runnerDistanceKm >= 0 && runnerDistanceKm <= maxDist) {
      runnerX = toX(runnerDistanceKm)
      // Interpolate elevation at runner position
      let interpElev = elevationData[0].elevationM
      for (let i = 1; i < elevationData.length; i++) {
        if (elevationData[i].distanceKm >= runnerDistanceKm) {
          const prev = elevationData[i - 1]
          const curr = elevationData[i]
          const t = (runnerDistanceKm - prev.distanceKm) / (curr.distanceKm - prev.distanceKm || 1)
          interpElev = prev.elevationM + t * (curr.elevationM - prev.elevationM)
          break
        }
      }
      runnerY = toY(interpElev)
    }

    return {
      plotWidth,
      plotHeight,
      linePath,
      areaPath,
      xTicks,
      yTicks,
      aidLines,
      runnerX,
      runnerY,
      maxDist,
      yMin,
      yMax,
      toX,
      toY,
    }
  }, [elevationData, aidStations, runnerDistanceKm, height, unit])

  if (!computed || elevationData.length === 0) {
    return (
      <div
        className={className}
        style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_MUTED }}
      >
        No elevation data available
      </div>
    )
  }

  const { linePath, areaPath, xTicks, yTicks, aidLines, runnerX, runnerY, plotHeight } = computed
  const distUnit = unit === 'imperial' ? 'mi' : 'km'
  const elevUnit = unit === 'imperial' ? 'ft' : 'm'

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height={height}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="elev-fill-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PRIMARY_LIGHT} stopOpacity={0.35} />
          <stop offset="100%" stopColor={PRIMARY_LIGHT} stopOpacity={0.05} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick, i) => {
        const y = computed.toY(tick)
        return (
          <line
            key={`grid-y-${i}`}
            x1={PADDING.left}
            y1={y}
            x2={PADDING.left + computed.plotWidth}
            y2={y}
            stroke={BORDER}
            strokeWidth={0.5}
          />
        )
      })}

      {/* Filled area */}
      <path d={areaPath} fill="url(#elev-fill-gradient)" />

      {/* Elevation line */}
      <path d={linePath} fill="none" stroke={PRIMARY} strokeWidth={2} strokeLinejoin="round" />

      {/* Aid station vertical lines */}
      {aidLines.map((aid, i) => (
        <g key={`aid-${i}`}>
          <line
            x1={aid.x}
            y1={PADDING.top}
            x2={aid.x}
            y2={PADDING.top + plotHeight}
            stroke={TEXT_MUTED}
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          <text
            x={aid.x}
            y={PADDING.top - 4}
            textAnchor="middle"
            fontSize={8}
            fill={TEXT_SECONDARY}
          >
            {aid.name.length > 12 ? `${aid.name.slice(0, 12)}...` : aid.name}
          </text>
        </g>
      ))}

      {/* Runner position indicator */}
      {runnerX != null && runnerY != null && (
        <g>
          <line
            x1={runnerX}
            y1={PADDING.top}
            x2={runnerX}
            y2={PADDING.top + plotHeight}
            stroke={ACCENT}
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <circle cx={runnerX} cy={runnerY} r={5} fill={ACCENT} stroke="#FFFFFF" strokeWidth={2} />
        </g>
      )}

      {/* X-axis ticks and labels */}
      {xTicks.map((tick, i) => {
        const x = computed.toX(tick)
        return (
          <g key={`x-tick-${i}`}>
            <line
              x1={x}
              y1={PADDING.top + plotHeight}
              x2={x}
              y2={PADDING.top + plotHeight + 4}
              stroke={TEXT_MUTED}
              strokeWidth={1}
            />
            <text
              x={x}
              y={PADDING.top + plotHeight + 16}
              textAnchor="middle"
              fontSize={10}
              fill={TEXT_SECONDARY}
            >
              {formatDistance(tick, unit)}
            </text>
          </g>
        )
      })}

      {/* X-axis label */}
      <text
        x={PADDING.left + computed.plotWidth / 2}
        y={height - 4}
        textAnchor="middle"
        fontSize={11}
        fill={TEXT_SECONDARY}
      >
        Distance ({distUnit})
      </text>

      {/* Y-axis ticks and labels */}
      {yTicks.map((tick, i) => {
        const y = computed.toY(tick)
        return (
          <g key={`y-tick-${i}`}>
            <line
              x1={PADDING.left - 4}
              y1={y}
              x2={PADDING.left}
              y2={y}
              stroke={TEXT_MUTED}
              strokeWidth={1}
            />
            <text x={PADDING.left - 8} y={y + 3} textAnchor="end" fontSize={10} fill={TEXT_SECONDARY}>
              {formatElevation(tick, unit)}
            </text>
          </g>
        )
      })}

      {/* Y-axis label */}
      <text
        x={12}
        y={PADDING.top + plotHeight / 2}
        textAnchor="middle"
        fontSize={11}
        fill={TEXT_SECONDARY}
        transform={`rotate(-90, 12, ${PADDING.top + plotHeight / 2})`}
      >
        Elev ({elevUnit})
      </text>

      {/* Bottom axis line */}
      <line
        x1={PADDING.left}
        y1={PADDING.top + plotHeight}
        x2={PADDING.left + computed.plotWidth}
        y2={PADDING.top + plotHeight}
        stroke={BORDER}
        strokeWidth={1}
      />

      {/* Left axis line */}
      <line
        x1={PADDING.left}
        y1={PADDING.top}
        x2={PADDING.left}
        y2={PADDING.top + plotHeight}
        stroke={BORDER}
        strokeWidth={1}
      />
    </svg>
  )
}
