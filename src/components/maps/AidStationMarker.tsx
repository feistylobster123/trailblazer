import { useCallback, useMemo } from 'react'
import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import type { AidStation } from '@/types/race.ts'

interface AidStationMarkerProps {
  station: AidStation
  onClick?: () => void
  isSelected?: boolean
}

const MARKER_SIZE = 20
const SELECTED_MARKER_SIZE = 28

function createAidStationIcon(isSelected: boolean, hasCrewAccess: boolean): L.DivIcon {
  const size = isSelected ? SELECTED_MARKER_SIZE : MARKER_SIZE
  const borderColor = isSelected ? '#E76F51' : '#1B4332'
  const borderWidth = isSelected ? 3 : 2
  const bgColor = '#FFFFFF'
  const fontSize = isSelected ? 14 : 11

  let crewIndicator = ''
  if (hasCrewAccess) {
    const crewSize = isSelected ? 12 : 10
    const crewOffset = isSelected ? -3 : -2
    crewIndicator = `<span style="
      position: absolute;
      top: ${crewOffset}px;
      right: ${crewOffset}px;
      width: ${crewSize}px;
      height: ${crewSize}px;
      background: #F4A261;
      border-radius: 50%;
      border: 1.5px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${crewSize - 4}px;
      color: #FFFFFF;
      font-weight: bold;
      line-height: 1;
    ">C</span>`
  }

  return L.divIcon({
    className: 'aid-station-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${bgColor};
        border: ${borderWidth}px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        transition: transform 0.15s ease;
      ">
        <span style="
          font-size: ${fontSize}px;
          font-weight: bold;
          color: ${borderColor};
          line-height: 1;
          user-select: none;
        ">+</span>
        ${crewIndicator}
      </div>
    `,
  })
}

export function AidStationMarker({ station, onClick, isSelected = false }: AidStationMarkerProps) {
  const icon = useMemo(
    () => createAidStationIcon(isSelected, station.crewAccess),
    [isSelected, station.crewAccess],
  )

  const position: L.LatLngExpression = [station.location.lat, station.location.lng]

  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const eventHandlers = useMemo(
    () => ({
      click: handleClick,
    }),
    [handleClick],
  )

  return (
    <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
      <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
        <div style={{ minWidth: 140 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1B4332', marginBottom: 4 }}>
            {station.name}
          </div>
          <div style={{ fontSize: 12, color: '#636E72', lineHeight: 1.6 }}>
            <div>Distance: {station.distanceKm.toFixed(1)} km / {station.distanceMi.toFixed(1)} mi</div>
            <div>Elevation: {station.elevationM.toLocaleString()} m / {station.elevationFt.toLocaleString()} ft</div>
            {station.cutoffTime && <div>Cutoff: {station.cutoffTime}</div>}
            {station.crewAccess && <div style={{ color: '#E76F51', fontWeight: 600 }}>Crew Access</div>}
            {station.pacerAccess && <div style={{ color: '#2D6A4F', fontWeight: 600 }}>Pacer Access</div>}
            {station.dropBags && <div>Drop Bags Available</div>}
          </div>
        </div>
      </Tooltip>
    </Marker>
  )
}
