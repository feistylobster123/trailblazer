import { useCallback, useMemo } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import type { RunnerPosition, RunnerTrackingStatus } from '@/types/tracking.ts'

interface RunnerMarkerProps {
  position: RunnerPosition
  isSelected?: boolean
  onClick?: () => void
}

const DOT_SIZE = 8
const SELECTED_DOT_SIZE = 14

const STATUS_COLORS: Record<RunnerTrackingStatus, string> = {
  not_started: '#B2BEC3',
  on_course: '#1B4332',
  at_aid_station: '#E76F51',
  finished: '#52B788',
  dnf: '#E63946',
  dns: '#B2BEC3',
}

function createRunnerIcon(
  status: RunnerTrackingStatus,
  isSelected: boolean,
  runnerName: string,
): L.DivIcon {
  const size = isSelected ? SELECTED_DOT_SIZE : DOT_SIZE
  const color = STATUS_COLORS[status]
  const isFinished = status === 'finished'

  const pulseRing = isSelected
    ? `<span style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${size + 12}px;
        height: ${size + 12}px;
        margin-top: -${(size + 12) / 2}px;
        margin-left: -${(size + 12) / 2}px;
        border-radius: 50%;
        border: 2px solid ${color};
        opacity: 0.5;
        animation: runner-pulse 1.5s ease-out infinite;
      "></span>`
    : ''

  const checkmark = isFinished
    ? `<span style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: ${isSelected ? 10 : 6}px;
        color: #FFFFFF;
        line-height: 1;
        font-weight: bold;
      ">&#10003;</span>`
    : ''

  const nameLabel = isSelected
    ? `<span style="
        position: absolute;
        top: ${size + 4}px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        font-size: 11px;
        font-weight: 600;
        color: #2D3436;
        background: rgba(255,255,255,0.92);
        padding: 1px 6px;
        border-radius: 3px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        pointer-events: none;
      ">${runnerName}</span>`
    : ''

  // We need the animation keyframes injected once; Leaflet markers are disposable
  // so we include it inline in a <style> scoped to the marker wrapper.
  const animationStyle = isSelected
    ? `<style>
        @keyframes runner-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      </style>`
    : ''

  const totalWidth = isSelected ? size + 12 : size
  const totalHeight = isSelected ? size + 30 : size

  return L.divIcon({
    className: 'runner-marker',
    iconSize: [totalWidth, totalHeight],
    iconAnchor: [totalWidth / 2, size / 2],
    html: `
      ${animationStyle}
      <div style="
        position: relative;
        width: ${totalWidth}px;
        height: ${totalHeight}px;
      ">
        ${pulseRing}
        <div style="
          position: absolute;
          top: ${isSelected ? (totalWidth - size) / 2 : 0}px;
          left: ${isSelected ? (totalWidth - size) / 2 : 0}px;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        ">
          ${checkmark}
        </div>
        ${nameLabel}
      </div>
    `,
  })
}

export function RunnerMarker({ position, isSelected = false, onClick }: RunnerMarkerProps) {
  const icon = useMemo(
    () => createRunnerIcon(position.status, isSelected, position.runnerName),
    [position.status, isSelected, position.runnerName],
  )

  const latLng: L.LatLngExpression = [position.location.lat, position.location.lng]

  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const eventHandlers = useMemo(
    () => ({
      click: handleClick,
    }),
    [handleClick],
  )

  // Selected runners render at a higher z-index so they appear on top
  const zIndexOffset = isSelected ? 1000 : 0

  return (
    <Marker
      position={latLng}
      icon={icon}
      eventHandlers={eventHandlers}
      zIndexOffset={zIndexOffset}
    >
      {!isSelected && (
        <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
          <div style={{ fontSize: 12 }}>
            <div style={{ fontWeight: 700 }}>{position.runnerName}</div>
            <div style={{ color: '#636E72' }}>Bib #{position.bibNumber}</div>
          </div>
        </Tooltip>
      )}
    </Marker>
  )
}
