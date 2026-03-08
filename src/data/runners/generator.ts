// Deterministic runner and race-result generator
// Seeded with master seed 42; every call returns the same data.

import type { Runner, RunnerStats, RaceHistoryEntry, PersonalRecord, PerformanceIndexPoint } from '@/services/interfaces/runner.service.ts'
import type { RaceResult, Split } from '@/services/interfaces/results.service.ts'
import { createPRNG, seededGaussian, seededRandom, seededShuffle, seededChoice } from './prng.ts'
import { generateRunnerName, generateAge, generateHometown } from './name-pool.ts'
import { races } from '@/data/races.ts'
import { calculatePI } from '@/utils/performance-index.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MASTER_SEED = 42
const RUNNER_COUNT = 200

const FIELD_SIZES: Record<string, number> = {
  'western-states-100': 369,
  'utmb': 300,
  'hardrock-100': 145,
  'leadville-100': 300,
  'cascade-crest-100': 200,
  'tahoe-200': 100,
}

// Simplified aid-station distance arrays (distance in miles from start)
const AID_STATIONS: Record<string, Array<{ id: string; name: string; distanceMi: number }>> = {
  'western-states-100': [
    { id: 'ws-lyon-ridge', name: 'Lyon Ridge', distanceMi: 10.3 },
    { id: 'ws-red-star', name: 'Red Star Ridge', distanceMi: 15.8 },
    { id: 'ws-duncan-canyon', name: 'Duncan Canyon', distanceMi: 23.8 },
    { id: 'ws-robinson-flat', name: 'Robinson Flat', distanceMi: 29.7 },
    { id: 'ws-dusty-corners', name: 'Dusty Corners', distanceMi: 38.0 },
    { id: 'ws-last-chance', name: 'Last Chance', distanceMi: 43.3 },
    { id: 'ws-devils-thumb', name: "Devil's Thumb", distanceMi: 47.8 },
    { id: 'ws-el-dorado', name: 'El Dorado Creek', distanceMi: 52.9 },
    { id: 'ws-michigan-bluff', name: 'Michigan Bluff', distanceMi: 55.7 },
    { id: 'ws-foresthill', name: 'Foresthill', distanceMi: 62.0 },
    { id: 'ws-cal-1', name: 'Cal 1 (Peachstone)', distanceMi: 65.7 },
    { id: 'ws-rucky-chucky', name: 'Rucky Chucky', distanceMi: 78.0 },
    { id: 'ws-green-gate', name: 'Green Gate', distanceMi: 79.8 },
    { id: 'ws-auburn-lake', name: 'Auburn Lake Trails', distanceMi: 85.2 },
    { id: 'ws-quarry-road', name: 'Quarry Road', distanceMi: 90.7 },
    { id: 'ws-pointed-rocks', name: 'Pointed Rocks', distanceMi: 94.3 },
    { id: 'ws-no-hands', name: 'No Hands Bridge', distanceMi: 96.8 },
  ],
  'utmb': [
    { id: 'utmb-les-houches', name: 'Les Houches', distanceMi: 5.0 },
    { id: 'utmb-saint-gervais', name: 'Saint-Gervais', distanceMi: 13.0 },
    { id: 'utmb-les-contamines', name: 'Les Contamines', distanceMi: 19.0 },
    { id: 'utmb-la-balme', name: 'La Balme', distanceMi: 25.5 },
    { id: 'utmb-les-chapieux', name: 'Les Chapieux', distanceMi: 31.0 },
    { id: 'utmb-lac-combal', name: 'Lac Combal', distanceMi: 39.0 },
    { id: 'utmb-courmayeur', name: 'Courmayeur', distanceMi: 49.5 },
    { id: 'utmb-refuge-bertone', name: 'Refuge Bertone', distanceMi: 53.5 },
    { id: 'utmb-arnuva', name: 'Arnuva', distanceMi: 60.5 },
    { id: 'utmb-la-fouly', name: 'La Fouly', distanceMi: 68.5 },
    { id: 'utmb-champex', name: 'Champex-Lac', distanceMi: 76.5 },
    { id: 'utmb-trient', name: 'Trient', distanceMi: 84.0 },
    { id: 'utmb-vallorcine', name: 'Vallorcine', distanceMi: 91.0 },
    { id: 'utmb-argentiere', name: 'Argentiere', distanceMi: 96.5 },
    { id: 'utmb-la-flegere', name: 'La Flegere', distanceMi: 101.0 },
  ],
  'hardrock-100': [
    { id: 'hr-cunningham', name: 'Cunningham Gulch', distanceMi: 7.1 },
    { id: 'hr-maggie', name: 'Maggie Gulch', distanceMi: 15.9 },
    { id: 'hr-pole-creek', name: 'Pole Creek', distanceMi: 23.2 },
    { id: 'hr-sherman', name: 'Sherman', distanceMi: 27.6 },
    { id: 'hr-burrows', name: 'Burrows Park', distanceMi: 32.8 },
    { id: 'hr-engineer', name: 'Engineer', distanceMi: 38.5 },
    { id: 'hr-ouray', name: 'Ouray', distanceMi: 43.9 },
    { id: 'hr-governor', name: "Governor's Basin", distanceMi: 50.3 },
    { id: 'hr-kroger', name: 'Kroger Canteen', distanceMi: 58.4 },
    { id: 'hr-telluride', name: 'Telluride', distanceMi: 72.8 },
    { id: 'hr-chapman', name: 'Chapman Gulch', distanceMi: 82.4 },
    { id: 'hr-putnam', name: 'Putnam Station', distanceMi: 91.3 },
  ],
  'leadville-100': [
    { id: 'lv-may-queen', name: 'May Queen', distanceMi: 13.5 },
    { id: 'lv-outward-bound', name: 'Outward Bound', distanceMi: 23.5 },
    { id: 'lv-half-moon', name: 'Half Moon', distanceMi: 30.0 },
    { id: 'lv-twin-lakes', name: 'Twin Lakes', distanceMi: 39.5 },
    { id: 'lv-hope-pass-summit', name: 'Hope Pass Summit', distanceMi: 44.0 },
    { id: 'lv-winfield', name: 'Winfield', distanceMi: 50.0 },
    { id: 'lv-hope-pass-return', name: 'Hope Pass (Return)', distanceMi: 56.0 },
    { id: 'lv-twin-lakes-return', name: 'Twin Lakes (Return)', distanceMi: 60.5 },
    { id: 'lv-half-moon-return', name: 'Half Moon (Return)', distanceMi: 70.0 },
    { id: 'lv-outward-bound-return', name: 'Outward Bound (Return)', distanceMi: 76.5 },
    { id: 'lv-may-queen-return', name: 'May Queen (Return)', distanceMi: 86.5 },
  ],
  'cascade-crest-100': [
    { id: 'cc-hyak', name: 'Hyak', distanceMi: 8.5 },
    { id: 'cc-ollalie', name: 'Ollalie Meadow', distanceMi: 18.3 },
    { id: 'cc-tacoma-pass', name: 'Tacoma Pass', distanceMi: 27.0 },
    { id: 'cc-stampede-pass', name: 'Stampede Pass', distanceMi: 34.5 },
    { id: 'cc-meadow-mtn', name: 'Meadow Mountain', distanceMi: 44.0 },
    { id: 'cc-mineral-creek', name: 'Mineral Creek', distanceMi: 53.0 },
    { id: 'cc-no-name', name: 'No Name Ridge', distanceMi: 63.5 },
    { id: 'cc-lemah-meadow', name: 'Lemah Meadow', distanceMi: 72.0 },
    { id: 'cc-pete-lake', name: 'Pete Lake', distanceMi: 79.5 },
    { id: 'cc-camp-1', name: 'Camp 1', distanceMi: 87.0 },
    { id: 'cc-cabin-creek', name: 'Cabin Creek', distanceMi: 93.0 },
  ],
  'tahoe-200': [
    { id: 't200-heavenly', name: 'Heavenly Village', distanceMi: 10.0 },
    { id: 't200-kingsbury', name: 'Kingsbury Grade', distanceMi: 22.5 },
    { id: 't200-spooner', name: 'Spooner Summit', distanceMi: 37.0 },
    { id: 't200-tunnel-creek', name: 'Tunnel Creek', distanceMi: 50.0 },
    { id: 't200-brockway', name: 'Brockway Summit', distanceMi: 67.0 },
    { id: 't200-tahoe-city', name: 'Tahoe City', distanceMi: 84.0 },
    { id: 't200-barker-pass', name: 'Barker Pass', distanceMi: 100.0 },
    { id: 't200-homewood', name: 'Homewood', distanceMi: 115.0 },
    { id: 't200-d-l-bliss', name: 'D.L. Bliss SP', distanceMi: 132.0 },
    { id: 't200-echo-summit', name: 'Echo Summit', distanceMi: 155.0 },
    { id: 't200-big-meadow', name: 'Big Meadow', distanceMi: 170.0 },
    { id: 't200-armstrong', name: 'Armstrong Pass', distanceMi: 185.0 },
  ],
}

// Age group helper
function ageToGroup(age: number): '18-29' | '30-39' | '40-49' | '50-59' | '60-69' | '70+' {
  if (age < 30) return '18-29'
  if (age < 40) return '30-39'
  if (age < 50) return '40-49'
  if (age < 60) return '50-59'
  if (age < 70) return '60-69'
  return '70+'
}

// Format seconds to HH:MM:SS
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Determine DNF rate by race
function getDnfRate(raceId: string): number {
  if (raceId === 'hardrock-100') return 0.25
  if (raceId === 'tahoe-200') return 0.30
  return 0.15
}

// ---------------------------------------------------------------------------
// Cached data
// ---------------------------------------------------------------------------

let cachedRunners: Runner[] | null = null
let cachedResults: Map<string, RaceResult[]> | null = null

// Internal runner data used during generation
type InternalRunner = Runner & { pi: number; age: number; genderCode: 'M' | 'F' }

let internalRunners: InternalRunner[] | null = null

// ---------------------------------------------------------------------------
// Generate runners
// ---------------------------------------------------------------------------

function buildRunners(): InternalRunner[] {
  const prng = createPRNG(MASTER_SEED)
  const runners: InternalRunner[] = []

  for (let i = 0; i < RUNNER_COUNT; i++) {
    const { firstName, lastName, gender } = generateRunnerName(prng)
    const age = generateAge(prng)
    const hometown = generateHometown(prng)
    const pi = Math.max(200, Math.min(900, Math.round(seededGaussian(prng, 450, 100))))
    const id = `runner-${String(i + 1).padStart(3, '0')}`

    runners.push({
      id,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      avatarUrl: undefined,
      bio: undefined,
      location: `${hometown.city}, ${hometown.state}`,
      country: hometown.country,
      gender: gender === 'male' ? 'M' : 'F',
      ageGroup: ageToGroup(age),
      birthYear: 2025 - age,
      performanceIndex: pi,
      totalRacesFinished: 0,
      totalDistanceMi: 0,
      createdAt: `${2025 - Math.floor(seededRandom(prng, 1, 8))}-01-15T00:00:00Z`,
      // internal extras
      pi,
      age,
      genderCode: gender === 'male' ? 'M' : 'F',
    })
  }
  return runners
}

// ---------------------------------------------------------------------------
// Generate race results for all races
// ---------------------------------------------------------------------------

function buildAllResults(runners: InternalRunner[]): Map<string, RaceResult[]> {
  const resultsMap = new Map<string, RaceResult[]>()
  const prng = createPRNG(MASTER_SEED + 1000)

  for (const race of races) {
    const fieldSize = FIELD_SIZES[race.id] ?? 100
    // Pick runners for this race from the pool (with wrap-around and shuffling)
    const shuffled = seededShuffle(prng, runners)
    const field: InternalRunner[] = []
    for (let i = 0; i < fieldSize; i++) {
      field.push(shuffled[i % shuffled.length])
    }

    const dnfRate = getDnfRate(race.id)
    const stations = AID_STATIONS[race.id] ?? []
    const distanceMi = race.distanceMi
    const elevGainFt = race.elevationGainFt
    const distanceKm = distanceMi * 1.60934
    const elevGainM = elevGainFt * 0.3048

    // Reference time for a PI=500 runner (in seconds)
    const refTimeHours = (distanceKm / 8) + (elevGainM / 400)
    const refTimeSeconds = refTimeHours * 3600

    // Generate raw results
    const rawResults: Array<{
      runner: InternalRunner
      status: 'finished' | 'dnf'
      finishTimeSeconds: number
      dnfStationId?: string
      dnfStationName?: string
      splits: Split[]
      bib: string
    }> = []

    const usedBibs = new Set<number>()

    for (const runner of field) {
      let bibNum: number
      do {
        bibNum = Math.floor(seededRandom(prng, 1, 1000))
      } while (usedBibs.has(bibNum))
      usedBibs.add(bibNum)

      // Determine finish time from PI
      // PI = (refTime / actualTime) * 500  =>  actualTime = refTime * 500 / PI
      const baseTimeSeconds = (refTimeSeconds * 500) / runner.pi
      // Add noise: gaussian with stddev 5% of base time
      const noise = seededGaussian(prng, 0, baseTimeSeconds * 0.05)
      let finishTimeSeconds = Math.max(baseTimeSeconds + noise, refTimeSeconds * 0.35)

      // Determine DNF
      const isDnf = prng() < dnfRate
      let status: 'finished' | 'dnf' = isDnf ? 'dnf' : 'finished'
      let dnfStationId: string | undefined
      let dnfStationName: string | undefined

      // Build splits
      const splits: Split[] = []
      let cumulativeSeconds = 0
      const prevDistanceMi = 0

      if (stations.length > 0) {
        // DNF station pick: weighted toward 30-60% through the race
        let dnfStationIndex = -1
        if (isDnf && stations.length > 1) {
          // Target 30-60% through, with gaussian distribution
          const targetFrac = Math.max(0.1, Math.min(0.9, seededGaussian(prng, 0.45, 0.12)))
          dnfStationIndex = Math.min(
            stations.length - 1,
            Math.max(0, Math.floor(targetFrac * stations.length))
          )
          dnfStationId = stations[dnfStationIndex].id
          dnfStationName = stations[dnfStationIndex].name
        }

        let lastDist = 0
        for (let si = 0; si < stations.length; si++) {
          const station = stations[si]
          const legDist = station.distanceMi - lastDist
          if (legDist <= 0) {
            lastDist = station.distanceMi
            continue
          }

          // Expected pace for this leg (seconds per mile)
          // Base pace = finishTimeSeconds / totalDistanceMi
          const basePacePerMi = finishTimeSeconds / distanceMi
          // Fatigue: pace degrades as fraction through race increases
          const fracThrough = station.distanceMi / distanceMi
          // Elite runners (PI>600) manage fatigue better
          const fatigueExponent = runner.pi > 600 ? 0.15 : 0.25
          const fatigueFactor = 1 + Math.pow(fracThrough, 1.5) * fatigueExponent
          const expectedLegSeconds = basePacePerMi * legDist * fatigueFactor
          // Add noise to this leg
          const legNoise = seededGaussian(prng, 0, expectedLegSeconds * 0.05)
          const legSeconds = Math.max(legDist * 3 * 60, expectedLegSeconds + legNoise) // min 3 min/mi

          // Aid station time: 3-15 min, better runners spend less
          const aidTimeBase = seededRandom(prng, 3, 15)
          const aidTimeFactor = 1 - (runner.pi - 200) / 1400 // higher PI = less time
          const aidTimeMinutes = aidTimeBase * (0.5 + aidTimeFactor * 0.5)
          const aidTimeSeconds = aidTimeMinutes * 60

          cumulativeSeconds += legSeconds + aidTimeSeconds
          const legPace = legSeconds / legDist / 60 // min per mile

          splits.push({
            aidStationId: station.id,
            aidStationName: station.name,
            distanceMi: station.distanceMi,
            elapsedTimeSeconds: Math.round(cumulativeSeconds),
            legTimeSeconds: Math.round(legSeconds),
            legPaceMinPerMi: Math.round(legPace * 100) / 100,
            overallPlaceAtSplit: 0, // filled in later
            genderPlaceAtSplit: 0, // filled in later
          })

          lastDist = station.distanceMi

          // If this is the DNF station, stop here
          if (isDnf && si === dnfStationIndex) break
        }

        // Scale cumulative times so that finished runners match their actual finish time
        if (!isDnf && splits.length > 0 && cumulativeSeconds > 0) {
          // Add the final leg from last station to finish
          const lastStationDist = stations[stations.length - 1].distanceMi
          const finalLegDist = distanceMi - lastStationDist
          if (finalLegDist > 0) {
            const finalLegSeconds = (finishTimeSeconds / distanceMi) * finalLegDist * 1.3
            cumulativeSeconds += finalLegSeconds
          }
          const scaleFactor = finishTimeSeconds / cumulativeSeconds
          let prevElapsed = 0
          for (const split of splits) {
            split.elapsedTimeSeconds = Math.round(split.elapsedTimeSeconds * scaleFactor)
            split.legTimeSeconds = Math.round(split.elapsedTimeSeconds - prevElapsed)
            if (split.legTimeSeconds > 0) {
              const legDistForSplit = split.distanceMi - (splits.indexOf(split) > 0 ? splits[splits.indexOf(split) - 1].distanceMi : 0)
              if (legDistForSplit > 0) {
                split.legPaceMinPerMi = Math.round((split.legTimeSeconds / legDistForSplit / 60) * 100) / 100
              }
            }
            prevElapsed = split.elapsedTimeSeconds
          }
        }
      }

      finishTimeSeconds = Math.round(finishTimeSeconds)

      rawResults.push({
        runner,
        status,
        finishTimeSeconds: isDnf ? 0 : finishTimeSeconds,
        dnfStationId,
        dnfStationName,
        splits,
        bib: String(bibNum),
      })
    }

    // Sort finishers by finish time, then DNFs
    const finishers = rawResults.filter((r) => r.status === 'finished').sort((a, b) => a.finishTimeSeconds - b.finishTimeSeconds)
    const dnfs = rawResults.filter((r) => r.status === 'dnf')

    // Assign places
    const winnerTime = finishers.length > 0 ? finishers[0].finishTimeSeconds : 0
    const raceResults: RaceResult[] = []

    // Overall places for finishers
    let mPlace = 0
    let fPlace = 0
    const ageGroupCounters: Record<string, number> = {}

    for (let i = 0; i < finishers.length; i++) {
      const r = finishers[i]
      const overallPlace = i + 1
      if (r.runner.genderCode === 'M') mPlace++
      else fPlace++
      const genderPlace = r.runner.genderCode === 'M' ? mPlace : fPlace
      const ag = ageToGroup(r.runner.age)
      ageGroupCounters[`${r.runner.genderCode}-${ag}`] = (ageGroupCounters[`${r.runner.genderCode}-${ag}`] ?? 0) + 1
      const ageGroupPlace = ageGroupCounters[`${r.runner.genderCode}-${ag}`]

      const earnedPI = calculatePI(r.finishTimeSeconds, distanceKm, elevGainM)

      raceResults.push({
        id: `${race.id}-${r.runner.id}`,
        raceId: race.id,
        editionId: race.editions[0]?.id ?? `${race.id}-2024`,
        runnerId: r.runner.id,
        runnerName: r.runner.displayName,
        bibNumber: r.bib,
        gender: r.runner.genderCode,
        ageGroup: ag,
        nationality: r.runner.country,
        status: 'finished',
        finishTimeSeconds: r.finishTimeSeconds,
        overallPlace,
        genderPlace,
        ageGroupPlace,
        performanceIndex: earnedPI,
        splits: r.splits,
      })
    }

    // DNFs get no place
    for (const r of dnfs) {
      const ag = ageToGroup(r.runner.age)
      raceResults.push({
        id: `${race.id}-${r.runner.id}`,
        raceId: race.id,
        editionId: race.editions[0]?.id ?? `${race.id}-2024`,
        runnerId: r.runner.id,
        runnerName: r.runner.displayName,
        bibNumber: r.bib,
        gender: r.runner.genderCode,
        ageGroup: ag,
        nationality: r.runner.country,
        status: 'dnf',
        dnfLocation: r.dnfStationName,
        performanceIndex: 0,
        splits: r.splits,
      })
    }

    // Fill in split places (overall and gender) for each station
    const stationIds = stations.map((s) => s.id)
    for (const stationId of stationIds) {
      // Get all results that have a split at this station, sorted by elapsed time
      const withSplit = raceResults
        .filter((r) => r.splits.some((s) => s.aidStationId === stationId))
        .sort((a, b) => {
          const sa = a.splits.find((s) => s.aidStationId === stationId)!
          const sb = b.splits.find((s) => s.aidStationId === stationId)!
          return sa.elapsedTimeSeconds - sb.elapsedTimeSeconds
        })

      let overallP = 0
      let mp = 0
      let fp = 0
      for (const result of withSplit) {
        overallP++
        if (result.gender === 'M') mp++
        else fp++
        const split = result.splits.find((s) => s.aidStationId === stationId)!
        split.overallPlaceAtSplit = overallP
        split.genderPlaceAtSplit = result.gender === 'M' ? mp : fp
      }
    }

    resultsMap.set(race.id, raceResults)
  }

  return resultsMap
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

function ensureGenerated(): { runners: InternalRunner[]; results: Map<string, RaceResult[]> } {
  if (!internalRunners || !cachedResults) {
    internalRunners = buildRunners()
    cachedResults = buildAllResults(internalRunners)

    // Update runner aggregate stats from results
    for (const runner of internalRunners) {
      let totalFinishes = 0
      let totalDistanceMi = 0
      for (const [raceId, results] of cachedResults) {
        const race = races.find((r) => r.id === raceId)
        for (const result of results) {
          if (result.runnerId === runner.id && result.status === 'finished') {
            totalFinishes++
            totalDistanceMi += race?.distanceMi ?? 0
          }
        }
      }
      runner.totalRacesFinished = totalFinishes
      runner.totalDistanceMi = Math.round(totalDistanceMi)
    }

    cachedRunners = internalRunners.map((r) => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      displayName: r.displayName,
      avatarUrl: r.avatarUrl,
      bio: r.bio,
      location: r.location,
      country: r.country,
      gender: r.gender,
      ageGroup: r.ageGroup,
      birthYear: r.birthYear,
      performanceIndex: r.performanceIndex,
      totalRacesFinished: r.totalRacesFinished,
      totalDistanceMi: r.totalDistanceMi,
      createdAt: r.createdAt,
    }))
  }
  return { runners: internalRunners, results: cachedResults }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getGeneratedRunners(): Runner[] {
  ensureGenerated()
  return cachedRunners!
}

export function getGeneratedResults(raceId: string): RaceResult[] {
  const { results } = ensureGenerated()
  return results.get(raceId) ?? []
}

export function getRunnerRaceHistory(runnerId: string): Array<{ raceId: string; raceName: string; result: RaceResult }> {
  const { results } = ensureGenerated()
  const history: Array<{ raceId: string; raceName: string; result: RaceResult }> = []

  for (const [raceId, raceResults] of results) {
    const race = races.find((r) => r.id === raceId)
    for (const result of raceResults) {
      if (result.runnerId === runnerId) {
        history.push({
          raceId,
          raceName: race?.name ?? raceId,
          result,
        })
      }
    }
  }

  return history
}

export function getInternalRunner(runnerId: string): InternalRunner | undefined {
  const { runners } = ensureGenerated()
  return runners.find((r) => r.id === runnerId)
}
