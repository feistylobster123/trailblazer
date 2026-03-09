import type { CourseData, ElevationPoint, AidStation, GeoJSONFeatureCollection } from '@/types/race'

/**
 * Generates realistic course data for races that don't have handcrafted course files.
 * Uses the race's properties (distance, elevation gain, coordinates, course type)
 * to create plausible aid stations, elevation profiles, and GeoJSON routes.
 */

const MI_TO_KM = 1.60934
const FT_TO_M = 0.3048

// Seeded PRNG for deterministic output per raceId
function seededRNG(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0
  }
  return function () {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    return h / 0x7fffffff
  }
}

const aidStationSuppliesBasic = [
  'water', 'electrolyte drink', 'cola', 'ginger ale',
  'PB&J sandwiches', 'boiled potatoes', 'watermelon',
  'oranges', 'bananas', 'chips', 'pretzels', 'cookies',
  'candy', 'ice',
]

const aidStationSuppliesFull = [
  ...aidStationSuppliesBasic,
  'broth', 'soup', 'quesadillas', 'grilled cheese',
  'ramen noodles', 'mashed potatoes',
]

interface RaceParams {
  id: string
  name: string
  distanceMi: number
  elevationGainFt: number
  lat: number
  lng: number
  startElevationFt: number
  courseType?: 'loop' | 'point-to-point' | 'out-and-back'
  difficulty?: 'moderate' | 'hard' | 'extreme'
}

// Aid station name pools by terrain type
const desertStationNames = [
  'Saguaro Flats', 'Rattlesnake Wash', 'Prickly Pear', 'Desert Willow',
  'Ironwood', 'Mesquite Flat', 'Cottonwood Creek', 'Hawk Watch',
  'Sunset Ridge', 'Canyon Rim', 'Dry Creek', 'Ocotillo',
  'Barrel Cactus', 'Jackrabbit Junction', 'Diamondback', 'Apache Pass',
  'Sidewinder', 'Tortilla Flat', 'Superstition', 'Goldfield',
  'Lost Dutchman', 'Weaver Needle', 'Peralta', 'Boulder Canyon',
]

const mountainStationNames = [
  'Timberline', 'Summit Ridge', 'Alpine Meadow', 'Pine Creek',
  'Aspen Grove', 'Granite Pass', 'Elk Saddle', 'Bear Creek',
  'Eagle Point', 'Snowmelt', 'Ridgeline', 'Switchback',
  'Treeline', 'High Camp', 'Mountain View', 'Cedar Flat',
  'Wildflower', 'Cloud Peak', 'Storm Pass', 'Sunrise Saddle',
  'Thunder Ridge', 'Crystal Lake', 'Rim Trail', 'Highline',
]

const forestStationNames = [
  'Old Growth', 'Fern Gully', 'Moss Creek', 'Cedar Falls',
  'Hemlock', 'Douglas Fir', 'Salal', 'Trillium',
  'Mushroom Hollow', 'River Bend', 'Bridge Creek', 'Logger Camp',
  'Meadow Springs', 'Canopy', 'Understory', 'Root Trail',
  'Watershed', 'Clearcut', 'Second Growth', 'Vine Maple',
]

function getStationNames(lat: number, elevFt: number): string[] {
  // Desert: Arizona, low elevation, southern latitude
  if (lat < 35 && elevFt < 6000) return desertStationNames
  // Mountain: high elevation
  if (elevFt > 7000) return mountainStationNames
  // Forest: everything else
  return forestStationNames
}

function generateElevationProfile(params: RaceParams, rng: () => number): ElevationPoint[] {
  const totalDistanceKm = params.distanceMi * MI_TO_KM
  const totalGainM = params.elevationGainFt * FT_TO_M
  const startElevM = params.startElevationFt * FT_TO_M

  // Generate points every 2km
  const numPoints = Math.ceil(totalDistanceKm / 2) + 1
  const points: ElevationPoint[] = []

  // Determine elevation characteristics based on difficulty and gain
  const gainPerKm = totalGainM / totalDistanceKm
  const isHilly = gainPerKm > 40 // > 40m/km is quite hilly

  // Generate a realistic-looking profile using sine waves with noise
  // More gain = more dramatic oscillations
  const numWaves = Math.max(2, Math.floor(params.distanceMi / 15))
  const amplitude = totalGainM / (numWaves * 1.5)

  let cumulativeGain = 0
  let prevElev = startElevM

  for (let i = 0; i < numPoints; i++) {
    const distKm = Math.min((i / (numPoints - 1)) * totalDistanceKm, totalDistanceKm)
    const progress = i / (numPoints - 1)

    // Base elevation: sine waves create hills
    let elev = startElevM
    for (let w = 0; w < numWaves; w++) {
      const phase = (w * Math.PI * 0.7) + rng() * 0.5
      const freq = ((w + 1) * Math.PI * 2) / totalDistanceKm
      const waveAmp = amplitude * (1 - w * 0.15) * (0.7 + rng() * 0.6)
      elev += Math.sin(distKm * freq + phase) * waveAmp
    }

    // Add noise
    elev += (rng() - 0.5) * amplitude * 0.3

    // For loop courses, end elevation should match start
    if (params.courseType === 'loop') {
      const returnFactor = Math.sin(progress * Math.PI)
      elev = startElevM + (elev - startElevM) * returnFactor
    }

    // For out-and-back, mirror the second half
    if (params.courseType === 'out-and-back' && progress > 0.5) {
      const mirrorProgress = 1 - progress
      const mirrorIdx = Math.round(mirrorProgress * (numPoints - 1))
      if (mirrorIdx < points.length) {
        elev = points[mirrorIdx].elevationM + (rng() - 0.5) * 20
      }
    }

    // Ensure we stay above a reasonable minimum
    const minElev = startElevM * 0.5
    elev = Math.max(minElev, elev)

    // Calculate grade
    const grade = i > 0
      ? ((elev - prevElev) / (2000)) * 100 // per 2km segment
      : 0

    if (i > 0 && elev > prevElev) {
      cumulativeGain += elev - prevElev
    }

    points.push({
      distanceKm: Math.round(distKm * 10) / 10,
      elevationM: Math.round(elev),
      grade: Math.round(grade * 10) / 10,
    })

    prevElev = elev
  }

  // Scale the profile so total gain approximately matches the race's stated gain
  if (cumulativeGain > 0) {
    const scaleFactor = totalGainM / cumulativeGain
    let prev = points[0].elevationM
    for (let i = 1; i < points.length; i++) {
      const diff = points[i].elevationM - prev
      const scaledDiff = diff * scaleFactor
      points[i].elevationM = Math.round(prev + scaledDiff)
      // Recalculate grade
      const segDist = (points[i].distanceKm - points[i - 1].distanceKm) * 1000
      points[i].grade = segDist > 0
        ? Math.round(((points[i].elevationM - prev) / segDist) * 100 * 10) / 10
        : 0
      prev = points[i].elevationM
    }
  }

  return points
}

function generateAidStations(
  params: RaceParams,
  elevProfile: ElevationPoint[],
  rng: () => number,
): AidStation[] {
  const totalDistanceKm = params.distanceMi * MI_TO_KM
  const totalDistanceMi = params.distanceMi

  // Aid station spacing: shorter races = closer stations
  let spacingMi: number
  if (totalDistanceMi <= 35) spacingMi = 4 + rng() * 2 // 4-6 mi for 50K
  else if (totalDistanceMi <= 65) spacingMi = 5 + rng() * 3 // 5-8 mi for 100K
  else if (totalDistanceMi <= 105) spacingMi = 6 + rng() * 4 // 6-10 mi for 100mi
  else spacingMi = 8 + rng() * 5 // 8-13 mi for 200+

  const numStations = Math.max(3, Math.floor(totalDistanceMi / spacingMi))
  const stationNames = getStationNames(params.lat, params.startElevationFt)
  const stations: AidStation[] = []

  // Shuffle station names deterministically
  const shuffled = [...stationNames]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  for (let i = 0; i < numStations; i++) {
    const progress = (i + 1) / (numStations + 1)
    const distanceMi = Math.round(progress * totalDistanceMi * 10) / 10
    const distanceKm = distanceMi * MI_TO_KM

    // Interpolate elevation from profile
    const profileIdx = elevProfile.findIndex(p => p.distanceKm >= distanceKm)
    let elevM: number
    if (profileIdx <= 0) {
      elevM = elevProfile[0].elevationM
    } else {
      const p0 = elevProfile[profileIdx - 1]
      const p1 = elevProfile[profileIdx]
      const t = (distanceKm - p0.distanceKm) / (p1.distanceKm - p0.distanceKm)
      elevM = p0.elevationM + (p1.elevationM - p0.elevationM) * t
    }
    elevM = Math.round(elevM)
    const elevationFt = Math.round(elevM / FT_TO_M)

    // Generate slightly offset coordinates from the race start
    const bearing = progress * Math.PI * 2 * 0.4 + rng() * 0.5
    const distDeg = (distanceMi / 69) * (0.3 + rng() * 0.4) // rough miles to degrees
    const stationLat = params.lat + Math.cos(bearing) * distDeg
    const stationLng = params.lng + Math.sin(bearing) * distDeg

    // Crew/drop bag access: roughly every 3rd-4th station for longer races
    const isMajor = (i + 1) % 3 === 0 || i === Math.floor(numStations / 2)
    const crewAccess = isMajor && totalDistanceMi >= 50
    const dropBags = isMajor && totalDistanceMi >= 50
    const pacerAccess = crewAccess && progress >= 0.5 && totalDistanceMi >= 80

    // Cutoff times for major stations in long races
    let cutoffTime: string | undefined
    if (totalDistanceMi >= 80 && isMajor) {
      const hours = Math.round(progress * totalDistanceMi / 3.5 + 2) // ~3.5mph pace + buffer
      const h = Math.floor(hours)
      cutoffTime = `${h}:00`
    }

    stations.push({
      id: `${params.id}-as-${String(i + 1).padStart(2, '0')}`,
      name: shuffled[i % shuffled.length],
      distanceKm: Math.round(distanceKm * 10) / 10,
      distanceMi,
      elevationM: elevM,
      elevationFt,
      location: {
        lat: Math.round(stationLat * 10000) / 10000,
        lng: Math.round(stationLng * 10000) / 10000,
        elevation: elevM,
      },
      cutoffTime,
      crewAccess,
      pacerAccess,
      dropBags,
      supplies: isMajor ? aidStationSuppliesFull : aidStationSuppliesBasic,
      description: '',
    })
  }

  return stations
}

function generateRouteGeoJSON(
  params: RaceParams,
  elevProfile: ElevationPoint[],
  aidStations: AidStation[],
  rng: () => number,
): GeoJSONFeatureCollection {
  // Create a route line from the elevation profile points
  // Use aid station coordinates as anchor points, interpolate between them

  const coordinates: Array<[number, number, number]> = []
  const totalDistanceKm = params.distanceMi * MI_TO_KM

  // Start point
  coordinates.push([
    params.lng,
    params.lat,
    elevProfile[0].elevationM,
  ])

  // Generate intermediate points along the route
  const numRoutePoints = Math.min(40, Math.max(15, Math.floor(params.distanceMi / 3)))

  for (let i = 1; i < numRoutePoints; i++) {
    const progress = i / numRoutePoints
    const distKm = progress * totalDistanceKm

    // Find elevation at this distance
    const profIdx = elevProfile.findIndex(p => p.distanceKm >= distKm)
    let elev: number
    if (profIdx <= 0) {
      elev = elevProfile[0].elevationM
    } else {
      const p0 = elevProfile[profIdx - 1]
      const p1 = elevProfile[profIdx]
      const t = (distKm - p0.distanceKm) / (p1.distanceKm - p0.distanceKm)
      elev = p0.elevationM + (p1.elevationM - p0.elevationM) * t
    }

    // Calculate position with some wander
    let lat: number, lng: number

    if (params.courseType === 'loop') {
      const angle = progress * Math.PI * 2
      const radius = (params.distanceMi / 69) * 0.12
      lat = params.lat + Math.sin(angle) * radius * (1 + (rng() - 0.5) * 0.3)
      lng = params.lng + Math.cos(angle) * radius * (1 + (rng() - 0.5) * 0.3)
    } else if (params.courseType === 'out-and-back') {
      const direction = progress <= 0.5 ? progress * 2 : (1 - progress) * 2
      const bearing = rng() * 0.4 + 0.3 // mostly one direction
      const dist = direction * (params.distanceMi / 69) * 0.15
      lat = params.lat + Math.cos(bearing) * dist + (rng() - 0.5) * 0.01
      lng = params.lng + Math.sin(bearing) * dist + (rng() - 0.5) * 0.01
    } else {
      // Point-to-point: generally one direction with meander
      const bearing = 0.5 + rng() * 0.3
      const dist = progress * (params.distanceMi / 69) * 0.15
      lat = params.lat + Math.cos(bearing) * dist + (rng() - 0.5) * 0.008
      lng = params.lng + Math.sin(bearing) * dist + (rng() - 0.5) * 0.008
    }

    coordinates.push([
      Math.round(lng * 10000) / 10000,
      Math.round(lat * 10000) / 10000,
      Math.round(elev),
    ])
  }

  // End point (for loops, return to start)
  if (params.courseType === 'loop') {
    coordinates.push([params.lng, params.lat, elevProfile[0].elevationM])
  } else {
    const lastElev = elevProfile[elevProfile.length - 1].elevationM
    const lastCoord = coordinates[coordinates.length - 1]
    coordinates.push([
      lastCoord[0] + (rng() - 0.5) * 0.005,
      lastCoord[1] + (rng() - 0.5) * 0.005,
      lastElev,
    ])
  }

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {
          name: params.name,
        },
      },
    ],
  }
}

export function generateCourseData(params: RaceParams): CourseData {
  const rng = seededRNG(params.id)
  const totalDistanceKm = params.distanceMi * MI_TO_KM
  const totalGainM = params.elevationGainFt * FT_TO_M
  const startElevM = params.startElevationFt * FT_TO_M

  // Generate elevation profile
  const elevProfile = generateElevationProfile(params, rng)

  // Calculate actual stats from generated profile
  let totalGainGen = 0
  let totalLossGen = 0
  let highest = elevProfile[0].elevationM
  let lowest = elevProfile[0].elevationM

  for (let i = 1; i < elevProfile.length; i++) {
    const diff = elevProfile[i].elevationM - elevProfile[i - 1].elevationM
    if (diff > 0) totalGainGen += diff
    else totalLossGen += Math.abs(diff)
    highest = Math.max(highest, elevProfile[i].elevationM)
    lowest = Math.min(lowest, elevProfile[i].elevationM)
  }

  // Generate aid stations
  const aidStations = generateAidStations(params, elevProfile, rng)

  // Generate route GeoJSON
  const routeGeoJSON = generateRouteGeoJSON(params, elevProfile, aidStations, rng)

  return {
    raceId: params.id,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalElevationGainM: Math.round(totalGainGen),
    totalElevationLossM: Math.round(totalLossGen),
    highestPointM: highest,
    lowestPointM: lowest,
    routeGeoJSON,
    aidStations,
    elevationProfile: elevProfile,
  }
}

// Race course type mappings based on tags and known info
const courseTypes: Record<string, 'loop' | 'point-to-point' | 'out-and-back'> = {
  'cascade-crest-100': 'loop',
  'tahoe-200': 'loop',
  'cocodona-250': 'point-to-point',
  'javelina-jundred': 'loop',
  'black-canyon-100k': 'point-to-point',
  'black-canyon-60k': 'point-to-point',
  'coldwater-rumble-100k': 'loop',
  'coldwater-rumble-50k': 'loop',
  'mogollon-monster-100': 'point-to-point',
  'aravaipa-stronghold': 'out-and-back',
  'whiskey-basin-88k': 'loop',
  'mesquite-canyon-50k': 'loop',
  'tushars-mountain-100k': 'point-to-point',
  'silverton-alpine-50': 'loop',
  'anza-trail-50k': 'point-to-point',
  'san-tan-scramble-50k': 'loop',
  'dead-dog-50k': 'loop',
  'grand-mesa-100': 'loop',
}

export function getCourseType(raceId: string, tags?: string[]): 'loop' | 'point-to-point' | 'out-and-back' {
  if (courseTypes[raceId]) return courseTypes[raceId]
  if (tags) {
    if (tags.includes('loop')) return 'loop'
    if (tags.includes('point-to-point')) return 'point-to-point'
    if (tags.includes('out-and-back')) return 'out-and-back'
  }
  return 'loop' // default
}
