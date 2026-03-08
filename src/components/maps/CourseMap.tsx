import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { GeoJSONFeatureCollection, AidStation } from '@/types/race'

interface RunnerPositionData {
  runnerId: string
  lat: number
  lng: number
  status: string
}

interface CourseMapProps {
  courseGeoJSON?: GeoJSONFeatureCollection
  aidStations?: AidStation[]
  runnerPositions?: RunnerPositionData[]
  selectedRunnerId?: string
  onRunnerClick?: (runnerId: string) => void
  onAidStationClick?: (stationId: string) => void
  height?: string
  className?: string
  interactive?: boolean
}

function extractCoordinates(geoJSON: GeoJSONFeatureCollection): [number, number][] {
  const coords: [number, number][] = []
  for (const feature of geoJSON.features) {
    if (feature.geometry.type === 'LineString') {
      for (const c of feature.geometry.coordinates) {
        coords.push([c[1], c[0]]) // GeoJSON is [lng,lat], Leaflet wants [lat,lng]
      }
    }
  }
  return coords
}

function FitBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap()
  const fitted = useRef(false)

  useEffect(() => {
    if (coordinates.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(coordinates.map(c => L.latLng(c[0], c[1])))
      map.fitBounds(bounds, { padding: [30, 30] })
      fitted.current = true
    }
  }, [coordinates, map])

  return null
}

function AidStationMarkers({
  stations,
  onClick,
}: {
  stations: AidStation[]
  onClick?: (id: string) => void
}) {
  const map = useMap()

  useEffect(() => {
    const markers: L.Marker[] = []

    for (const station of stations) {
      const icon = L.divIcon({
        className: 'aid-station-marker',
        html: `<div style="
          width: 12px; height: 12px; border-radius: 50%;
          background: #E76F51; border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      const marker = L.marker([station.location.lat, station.location.lng], { icon })
      marker.bindTooltip(
        `<strong>${station.name}</strong><br/>
         ${station.distanceKm.toFixed(1)} km / ${station.distanceMi.toFixed(1)} mi<br/>
         ${station.elevationM}m elevation
         ${station.crewAccess ? '<br/>Crew access' : ''}`,
        { direction: 'top', offset: [0, -8] }
      )
      if (onClick) {
        marker.on('click', () => onClick(station.id))
      }
      marker.addTo(map)
      markers.push(marker)
    }

    return () => {
      markers.forEach(m => m.remove())
    }
  }, [stations, map, onClick])

  return null
}

function RunnerPositionMarkers({
  positions,
  selectedId,
  onClick,
}: {
  positions: RunnerPositionData[]
  selectedId?: string
  onClick?: (id: string) => void
}) {
  const map = useMap()

  useEffect(() => {
    const markers: L.Marker[] = []

    for (const pos of positions) {
      const isSelected = pos.runnerId === selectedId
      const size = isSelected ? 14 : 8
      const color = pos.status === 'dnf' ? '#E63946'
        : pos.status === 'finished' ? '#52B788'
        : pos.status === 'at_aid' ? '#E76F51'
        : '#1B4332'

      const icon = L.divIcon({
        className: 'runner-marker',
        html: `<div style="
          width: ${size}px; height: ${size}px; border-radius: 50%;
          background: ${color}; border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          ${isSelected ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const marker = L.marker([pos.lat, pos.lng], { icon })
      if (onClick) {
        marker.on('click', () => onClick(pos.runnerId))
      }
      marker.addTo(map)
      markers.push(marker)
    }

    return () => {
      markers.forEach(m => m.remove())
    }
  }, [positions, selectedId, map, onClick])

  return null
}

export function CourseMap({
  courseGeoJSON,
  aidStations = [],
  runnerPositions = [],
  selectedRunnerId,
  onRunnerClick,
  onAidStationClick,
  height = '500px',
  className = '',
  interactive = true,
}: CourseMapProps) {
  const coordinates = courseGeoJSON ? extractCoordinates(courseGeoJSON) : []
  const center: [number, number] = coordinates.length > 0
    ? coordinates[Math.floor(coordinates.length / 2)]
    : [39.0, -120.0]

  return (
    <div className={`rounded-xl overflow-hidden border border-border ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Shadow line */}
        {coordinates.length > 0 && (
          <Polyline
            positions={coordinates}
            pathOptions={{ color: '#2D6A4F', weight: 6, opacity: 0.3 }}
          />
        )}

        {/* Main route line */}
        {coordinates.length > 0 && (
          <Polyline
            positions={coordinates}
            pathOptions={{ color: '#1B4332', weight: 3, opacity: 0.9 }}
          />
        )}

        {coordinates.length > 0 && <FitBounds coordinates={coordinates} />}

        <AidStationMarkers stations={aidStations} onClick={onAidStationClick} />

        {runnerPositions.length > 0 && (
          <RunnerPositionMarkers
            positions={runnerPositions}
            selectedId={selectedRunnerId}
            onClick={onRunnerClick}
          />
        )}
      </MapContainer>
    </div>
  )
}
