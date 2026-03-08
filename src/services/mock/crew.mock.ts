import type {
  ICrewService,
  CrewDashboard,
  RunnerETA,
  RunnerNeed,
  CrewAidStationInfo,
  CrewAssignment,
  ChecklistItem,
  CrewAccessLevel,
} from '../interfaces/crew.service'

function delay(): Promise<void> {
  return new Promise(r => setTimeout(r, 50 + Math.random() * 50))
}

// ---------------------------------------------------------------------------
// Static mock data
// ---------------------------------------------------------------------------

const MOCK_RUNNERS = [
  {
    runnerId: 'runner-042',
    runnerName: 'Alex Thompson',
    bibNumber: '142',
    currentStatus: 'racing' as const,
    currentDistanceMi: 47.3,
    lastKnownAidStation: 'twin-lakes-outbound',
    nextAidStation: 'hope-pass-summit',
    nextETA: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    overallPlace: 38,
  },
  {
    runnerId: 'runner-087',
    runnerName: 'Jordan Reyes',
    bibNumber: '287',
    currentStatus: 'at_aid_station' as const,
    currentDistanceMi: 39.5,
    lastKnownAidStation: 'twin-lakes-outbound',
    nextAidStation: 'winfield',
    nextETA: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    overallPlace: 94,
  },
]

const CREW_AID_STATIONS: Record<string, CrewAidStationInfo[]> = {
  'leadville-100': [
    {
      aidStationId: 'twin-lakes-outbound',
      aidStationName: 'Twin Lakes (Outbound)',
      distanceMi: 39.5,
      crewAccessLevel: 'crew_and_spectators' as CrewAccessLevel,
      parkingNotes: 'Large parking area on CR 24E. Arrive early — fills by 7am for lead runners.',
      directionsUrl: 'https://maps.google.com/?q=Twin+Lakes+Colorado',
      estimatedDriveMinutesFromPrevious: 45,
    },
    {
      aidStationId: 'winfield',
      aidStationName: 'Winfield',
      distanceMi: 50.0,
      crewAccessLevel: 'crew_only' as CrewAccessLevel,
      parkingNotes:
        'Dirt road access via CR 390. High clearance vehicle recommended. Shuttle available from Twin Lakes.',
      directionsUrl: 'https://maps.google.com/?q=Winfield+Colorado+ghost+town',
      estimatedDriveMinutesFromPrevious: 35,
    },
    {
      aidStationId: 'twin-lakes-inbound',
      aidStationName: 'Twin Lakes (Inbound)',
      distanceMi: 60.5,
      crewAccessLevel: 'crew_and_spectators' as CrewAccessLevel,
      parkingNotes: 'Same location as outbound. Parking usually available on inbound.',
      directionsUrl: 'https://maps.google.com/?q=Twin+Lakes+Colorado',
      estimatedDriveMinutesFromPrevious: 35,
    },
    {
      aidStationId: 'may-queen-inbound',
      aidStationName: 'May Queen (Inbound)',
      distanceMi: 86.5,
      crewAccessLevel: 'crew_and_spectators' as CrewAccessLevel,
      parkingNotes: 'Turquoise Lake Rd. Limited parking. Consider rideshare from Leadville.',
      directionsUrl: 'https://maps.google.com/?q=May+Queen+Campground+Leadville+CO',
      estimatedDriveMinutesFromPrevious: 30,
    },
  ],
  'western-states-100': [
    {
      aidStationId: 'robinson-flat',
      aidStationName: 'Robinson Flat',
      distanceMi: 30.3,
      crewAccessLevel: 'crew_and_spectators' as CrewAccessLevel,
      parkingNotes: 'Forest Service road 96, off Duncan Canyon Rd. May be dusty.',
      directionsUrl: 'https://maps.google.com/?q=Robinson+Flat+Aid+Station+Western+States',
      estimatedDriveMinutesFromPrevious: 60,
    },
    {
      aidStationId: 'foresthill',
      aidStationName: 'Foresthill',
      distanceMi: 62.0,
      crewAccessLevel: 'crew_and_spectators' as CrewAccessLevel,
      parkingNotes: 'Foresthill School parking lot and surrounding streets. Shuttle from Auburn recommended.',
      directionsUrl: 'https://maps.google.com/?q=Foresthill+School+Foresthill+CA',
      estimatedDriveMinutesFromPrevious: 90,
    },
  ],
}

const RUNNER_NEEDS: Record<string, RunnerNeed[]> = {
  'runner-042': [
    {
      id: 'need-001',
      runnerId: 'runner-042',
      aidStationId: 'winfield',
      category: 'nutrition',
      description: 'Gels (5x Maurten 100), 2x PB&J quarters, salt tabs (20)',
      priority: 'high',
      completed: false,
      notes: 'Alex prefers Maurten over GU at this point in the race. Avoid caffeinated gels until mile 60.',
    },
    {
      id: 'need-002',
      runnerId: 'runner-042',
      aidStationId: 'winfield',
      category: 'hydration',
      description: 'Refill both 500ml soft flasks with Tailwind (lemon)',
      priority: 'high',
      completed: false,
    },
    {
      id: 'need-003',
      runnerId: 'runner-042',
      aidStationId: 'winfield',
      category: 'gear',
      description: 'Fresh socks (Drymax, size M) — blister check on left heel',
      priority: 'medium',
      completed: false,
      notes: 'Check for hotspots. Have Leukotape ready.',
    },
    {
      id: 'need-004',
      runnerId: 'runner-042',
      aidStationId: 'winfield',
      category: 'clothing',
      description: 'Windshell (orange Arc\'teryx) — weather may turn on return over Hope Pass',
      priority: 'medium',
      completed: false,
    },
    {
      id: 'need-005',
      runnerId: 'runner-042',
      aidStationId: 'twin-lakes-inbound',
      category: 'nutrition',
      description: 'Hot broth + noodles if available. Caffeinated gels from here (4x Maurten 160 CAF)',
      priority: 'high',
      completed: false,
    },
    {
      id: 'need-006',
      runnerId: 'runner-042',
      aidStationId: 'twin-lakes-inbound',
      category: 'medical',
      description: 'Ibuprofen 400mg if requested — confirm with Alex first',
      priority: 'low',
      completed: false,
      notes: 'Only give if Alex asks. Check stomach is handling food OK.',
    },
  ],
  'runner-087': [
    {
      id: 'need-007',
      runnerId: 'runner-087',
      aidStationId: 'winfield',
      category: 'nutrition',
      description: 'Boiled potatoes with salt, 4x SiS gels',
      priority: 'high',
      completed: false,
    },
    {
      id: 'need-008',
      runnerId: 'runner-087',
      aidStationId: 'winfield',
      category: 'hydration',
      description: '1L plain water + electrolyte capsules (4x)',
      priority: 'high',
      completed: false,
    },
  ],
}

const CREW_ASSIGNMENTS: CrewAssignment[] = [
  {
    id: 'assign-001',
    runnerId: 'runner-042',
    crewMemberId: 'crew-001',
    crewMemberName: 'Sam Thompson',
    role: 'crew_chief',
    aidStations: ['twin-lakes-outbound', 'winfield', 'twin-lakes-inbound', 'may-queen-inbound'],
    notes: 'Primary crew contact. Has all drop bags. Knows Alex\'s race plan.',
  },
  {
    id: 'assign-002',
    runnerId: 'runner-042',
    crewMemberId: 'crew-002',
    crewMemberName: 'Maya Patel',
    role: 'pacer',
    aidStations: ['twin-lakes-inbound', 'may-queen-inbound'],
    startFrom: 'twin-lakes-inbound',
    notes: 'Pacer from mile 60.5. Has run Leadville before. Bring headlamp and emergency bivvy.',
  },
  {
    id: 'assign-003',
    runnerId: 'runner-042',
    crewMemberId: 'crew-003',
    crewMemberName: 'Carlos Mendez',
    role: 'driver',
    aidStations: ['twin-lakes-outbound', 'winfield', 'twin-lakes-inbound'],
    notes: 'Has the high-clearance truck for Winfield road. Knows alternate routes to avoid race traffic.',
  },
]

const CHECKLIST_STORAGE_KEY = 'trailblazer_crew_checklist'

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'check-001',
    label: 'Pack drop bags (labeled with bib #142)',
    completed: false,
    aidStationId: 'twin-lakes-outbound',
    category: 'gear',
  },
  {
    id: 'check-002',
    label: 'Confirm pacer Maya\'s ETA for Twin Lakes inbound',
    completed: false,
    aidStationId: 'twin-lakes-inbound',
    category: 'logistics',
  },
  {
    id: 'check-003',
    label: 'Print race tracking page (backup if cell service is out)',
    completed: false,
    category: 'logistics',
  },
  {
    id: 'check-004',
    label: 'Charge all phones and portable battery packs',
    completed: false,
    category: 'gear',
  },
  {
    id: 'check-005',
    label: 'Download offline maps for Winfield road',
    completed: false,
    category: 'logistics',
  },
  {
    id: 'check-006',
    label: 'Prepare hot food options for inbound Twin Lakes (broth, noodles)',
    completed: false,
    aidStationId: 'twin-lakes-inbound',
    category: 'nutrition',
  },
  {
    id: 'check-007',
    label: 'Blister kit ready: Leukotape, scissors, Vaseline, gauze',
    completed: false,
    category: 'medical',
  },
  {
    id: 'check-008',
    label: 'Confirm hotel/lodging in Leadville for post-race',
    completed: false,
    category: 'logistics',
  },
]

function getChecklist(): ChecklistItem[] {
  if (typeof window === 'undefined') return DEFAULT_CHECKLIST
  const stored = localStorage.getItem(CHECKLIST_STORAGE_KEY)
  if (!stored) return DEFAULT_CHECKLIST
  try {
    return JSON.parse(stored) as ChecklistItem[]
  } catch {
    return DEFAULT_CHECKLIST
  }
}

function saveChecklist(items: ChecklistItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(items))
}

export class MockCrewService implements ICrewService {
  async getCrewDashboard(
    raceId: string,
    editionId: string,
    runnerIds: string[],
  ): Promise<CrewDashboard> {
    await delay()

    const runners = runnerIds.length > 0
      ? MOCK_RUNNERS.filter(r => runnerIds.includes(r.runnerId))
      : MOCK_RUNNERS

    const upcomingCrewPoints = CREW_AID_STATIONS[raceId] ?? CREW_AID_STATIONS['leadville-100']

    return {
      raceId,
      editionId,
      runners,
      upcomingCrewPoints,
      checklist: getChecklist(),
      lastUpdatedAt: new Date().toISOString(),
    }
  }

  async getRunnerETAs(raceId: string, editionId: string, runnerId: string): Promise<RunnerETA[]> {
    await delay()

    const runner = MOCK_RUNNERS.find(r => r.runnerId === runnerId)
    const runnerName = runner?.runnerName ?? 'Unknown Runner'
    const bibNumber = runner?.bibNumber ?? '000'

    const stations = CREW_AID_STATIONS[raceId] ?? CREW_AID_STATIONS['leadville-100']
    const currentDist = runner?.currentDistanceMi ?? 0

    const upcomingStations = stations.filter(s => s.distanceMi > currentDist)

    const now = Date.now()
    const paceMinPerMile = 18 // approximate pace in tough terrain

    return upcomingStations.map((station, i) => {
      const distRemaining = station.distanceMi - currentDist
      const etaMs = now + distRemaining * paceMinPerMile * 60 * 1000
      const bufferMs = (15 + i * 10) * 60 * 1000

      return {
        runnerId,
        runnerName,
        bibNumber,
        aidStationId: station.aidStationId,
        aidStationName: station.aidStationName,
        distanceMi: station.distanceMi,
        estimatedArrivalTime: new Date(etaMs).toISOString(),
        earliestArrivalTime: new Date(etaMs - bufferMs).toISOString(),
        latestArrivalTime: new Date(etaMs + bufferMs * 1.5).toISOString(),
        confidenceLevel: distRemaining < 15 ? 'high' : distRemaining < 35 ? 'medium' : 'low',
        lastKnownDistanceMi: currentDist,
        lastKnownTime: new Date(now - 25 * 60 * 1000).toISOString(),
      }
    })
  }

  async getRunnerNeeds(
    runnerId: string,
    _raceId: string,
    _editionId: string,
  ): Promise<RunnerNeed[]> {
    await delay()
    return RUNNER_NEEDS[runnerId] ?? []
  }

  async getAidStationDirections(
    raceId: string,
    _editionId: string,
    aidStationId: string,
  ): Promise<CrewAidStationInfo> {
    await delay()

    const stations = CREW_AID_STATIONS[raceId] ?? CREW_AID_STATIONS['leadville-100']
    const station = stations.find(s => s.aidStationId === aidStationId)

    if (!station) {
      throw new Error(`Aid station ${aidStationId} not found for race ${raceId}`)
    }

    return station
  }

  async getCrewAssignments(
    runnerId: string,
    _raceId: string,
    _editionId: string,
  ): Promise<CrewAssignment[]> {
    await delay()
    return CREW_ASSIGNMENTS.filter(a => a.runnerId === runnerId)
  }

  async updateChecklist(
    _raceId: string,
    _editionId: string,
    itemId: string,
    completed: boolean,
  ): Promise<ChecklistItem> {
    await delay()

    const items = getChecklist()
    const item = items.find(i => i.id === itemId)

    if (!item) {
      throw new Error(`Checklist item ${itemId} not found`)
    }

    item.completed = completed
    item.completedAt = completed ? new Date().toISOString() : undefined

    saveChecklist(items)

    return item
  }
}
