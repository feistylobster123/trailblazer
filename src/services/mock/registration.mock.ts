import type {
  IRegistrationService,
  Registration,
  RegistrationStep,
  RegistrationStatus,
  RegistrationStepData,
  RegistrationSummary,
  Waiver,
  DropBagLocation,
} from '../interfaces/registration.service'

const STORAGE_KEY = 'trailblazer_registrations'
const AUTH_STORAGE_KEY = 'trailblazer_user'

function delay(): Promise<void> {
  return new Promise(r => setTimeout(r, 50 + Math.random() * 50))
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'runner-042'
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return 'runner-042'
    const data = JSON.parse(stored) as { user: { id: string } }
    return data.user.id
  } catch {
    return 'runner-042'
  }
}

function getStoredRegistrations(): Map<string, Registration> {
  if (typeof window === 'undefined') return new Map()
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return new Map()
  try {
    const obj = JSON.parse(stored) as Record<string, Registration>
    return new Map(Object.entries(obj))
  } catch {
    return new Map()
  }
}

function saveStoredRegistrations(regs: Map<string, Registration>): void {
  if (typeof window === 'undefined') return
  const obj = Object.fromEntries(regs)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
}

function generateConfirmationCode(raceId: string, runnerId: string): string {
  const prefix = raceId.substring(0, 2).toUpperCase()
  const hash = (raceId + runnerId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return `${prefix}${(hash % 90000) + 10000}`
}

const RACE_NAMES: Record<string, string> = {
  'western-states-100': 'Western States 100',
  'utmb': 'UTMB Mont-Blanc',
  'hardrock-100': 'Hardrock 100',
  'leadville-100': 'Leadville Trail 100 Run',
  'cascade-crest-100': 'Cascade Crest 100',
  'tahoe-200': 'Tahoe 200',
}

const EDITION_YEARS: Record<string, number> = {
  'ws100-2025': 2025,
  'ws100-2024': 2024,
  'utmb-2025': 2025,
  'utmb-2024': 2024,
  'hr100-2025': 2025,
  'hr100-2024': 2024,
  'ltc100-2025': 2025,
  'ltc100-2024': 2024,
  'cc100-2025': 2025,
  'cc100-2024': 2024,
  't200-2025': 2025,
  't200-2024': 2024,
}

const EDITION_START_DATES: Record<string, string> = {
  'ws100-2025': '2025-06-28T05:00:00-07:00',
  'ws100-2024': '2024-06-29T05:00:00-07:00',
  'utmb-2025': '2025-08-29T18:00:00+02:00',
  'utmb-2024': '2024-08-30T18:00:00+02:00',
  'hr100-2025': '2025-07-11T06:00:00-06:00',
  'hr100-2024': '2024-07-12T06:00:00-06:00',
  'ltc100-2025': '2025-08-16T04:00:00-06:00',
  'ltc100-2024': '2024-08-17T04:00:00-06:00',
  'cc100-2025': '2025-08-23T10:00:00-07:00',
  'cc100-2024': '2024-08-24T10:00:00-07:00',
  't200-2025': '2025-07-25T06:00:00-07:00',
  't200-2024': '2024-07-26T06:00:00-07:00',
}

const ENTRY_FEES: Record<string, number> = {
  'western-states-100': 425,
  'utmb': 300,
  'hardrock-100': 350,
  'leadville-100': 385,
  'cascade-crest-100': 250,
  'tahoe-200': 699,
}

const DROP_BAG_OPTIONS: Record<string, DropBagLocation[]> = {
  'western-states-100': [
    {
      id: 'ws-db-robinson-flat',
      aidStationId: 'robinson-flat',
      aidStationName: 'Robinson Flat',
      distanceMi: 30.3,
      bagLimit: 1,
      weightLimitLb: 30,
      notes: 'First crew access point. Bags must be labeled with bib number.',
    },
    {
      id: 'ws-db-foresthill',
      aidStationId: 'foresthill',
      aidStationName: 'Foresthill',
      distanceMi: 62.0,
      bagLimit: 2,
      weightLimitLb: 40,
      notes: 'Major crew access point. Pacers allowed from here. Bags available for 2 hours after your arrival.',
    },
    {
      id: 'ws-db-rucky-chucky',
      aidStationId: 'rucky-chucky',
      aidStationName: 'Rucky Chucky (Far Side)',
      distanceMi: 78.0,
      bagLimit: 1,
      weightLimitLb: 25,
      notes: 'River crossing. Bags transported to far side. Waterproof bag recommended.',
    },
  ],
  'leadville-100': [
    {
      id: 'ltc-db-twin-lakes-out',
      aidStationId: 'twin-lakes-outbound',
      aidStationName: 'Twin Lakes (Outbound)',
      distanceMi: 39.5,
      bagLimit: 1,
      weightLimitLb: 35,
      notes: 'Before the Hope Pass climb. Great place for extra nutrition and a layer change.',
    },
    {
      id: 'ltc-db-winfield',
      aidStationId: 'winfield',
      aidStationName: 'Winfield',
      distanceMi: 50.0,
      bagLimit: 2,
      weightLimitLb: 50,
      notes: 'Turnaround point. Crew access. Drop bags stay here — picked up on return trip.',
    },
    {
      id: 'ltc-db-twin-lakes-in',
      aidStationId: 'twin-lakes-inbound',
      aidStationName: 'Twin Lakes (Inbound)',
      distanceMi: 60.5,
      bagLimit: 1,
      weightLimitLb: 35,
      notes: 'Same bag as outbound Twin Lakes if desired, or separate bag.',
    },
  ],
  'hardrock-100': [
    {
      id: 'hr-db-ouray',
      aidStationId: 'ouray',
      aidStationName: 'Ouray',
      distanceMi: 43.7,
      bagLimit: 1,
      weightLimitLb: 30,
      notes: 'Town aid station. Warm food available. Limited parking nearby.',
    },
    {
      id: 'hr-db-engineer',
      aidStationId: 'engineer',
      aidStationName: 'Engineer',
      distanceMi: 73.5,
      bagLimit: 1,
      weightLimitLb: 25,
      notes: 'High altitude (12,800 ft). Weather can change rapidly. Extra layers recommended.',
    },
  ],
  'utmb': [
    {
      id: 'utmb-db-courmayeur',
      aidStationId: 'courmayeur',
      aidStationName: 'Courmayeur',
      distanceMi: 50.4,
      bagLimit: 1,
      weightLimitLb: 33,
      notes: 'Italian side of Mont Blanc. Major life base. Hot food, beds available.',
    },
    {
      id: 'utmb-db-champex-lac',
      aidStationId: 'champex-lac',
      aidStationName: 'Champex-Lac',
      distanceMi: 72.3,
      bagLimit: 1,
      weightLimitLb: 33,
      notes: 'Swiss life base. Second bag option. Race organization transports from Chamonix.',
    },
  ],
  'cascade-crest-100': [
    {
      id: 'cc-db-hyak',
      aidStationId: 'hyak',
      aidStationName: 'Hyak',
      distanceMi: 19.0,
      bagLimit: 1,
      weightLimitLb: 25,
      notes: 'Near Snoqualmie Pass. Easy highway access for crew.',
    },
    {
      id: 'cc-db-stampede-pass',
      aidStationId: 'stampede-pass',
      aidStationName: 'Stampede Pass',
      distanceMi: 62.0,
      bagLimit: 1,
      weightLimitLb: 25,
      notes: 'Remote aid station. Bags transported by race volunteers. No crew access.',
    },
  ],
  'tahoe-200': [
    {
      id: 't200-db-spooner-summit',
      aidStationId: 'spooner-summit',
      aidStationName: 'Spooner Summit',
      distanceMi: 45.0,
      bagLimit: 2,
      weightLimitLb: 40,
      notes: 'First major drop bag. Night gear recommended for most runners.',
    },
    {
      id: 't200-db-tahoe-city',
      aidStationId: 'tahoe-city',
      aidStationName: 'Tahoe City',
      distanceMi: 105.0,
      bagLimit: 2,
      weightLimitLb: 50,
      notes: 'Midpoint of the race. Major life base. Sleep station available.',
    },
    {
      id: 't200-db-echo-summit',
      aidStationId: 'echo-summit',
      aidStationName: 'Echo Summit',
      distanceMi: 165.0,
      bagLimit: 2,
      weightLimitLb: 40,
      notes: 'Final bag drop. Most runners hit this in sleep deprivation territory.',
    },
  ],
}

const WAIVERS: Waiver[] = [
  {
    id: 'waiver-liability-v3',
    title: 'Liability Release and Assumption of Risk',
    version: '3.1',
    content: `RELEASE OF LIABILITY, WAIVER OF CLAIMS, ASSUMPTION OF RISKS AND INDEMNITY AGREEMENT

By entering this event, I acknowledge that trail running is an inherently dangerous sport and that I voluntarily participate with knowledge of the dangers involved.

I HEREBY RELEASE, WAIVE, DISCHARGE AND COVENANT NOT TO SUE the race organization, its officers, directors, employees, volunteers, sponsors, and agents (collectively "Released Parties") from any and all liability, claims, demands, actions, and causes of action whatsoever arising out of or related to any loss, damage, or injury, including death, that may be sustained by me or to any property belonging to me, whether caused by the negligence of the Released Parties or otherwise, while participating in the event, preparing for the event, or traveling to or from the event.

I am aware that trail running involves navigating technical terrain, extreme weather, high altitude, remote wilderness, river crossings, wildlife encounters, and other hazards. I voluntarily assume all risks associated with participation in this event.

I agree to indemnify and hold harmless the Released Parties from any loss, liability, damage, or cost they may incur due to my participation in this event.

This agreement shall be construed in accordance with the laws of the state in which the event takes place.`,
    required: true,
  },
  {
    id: 'waiver-medical-v2',
    title: 'Medical Authorization and Treatment Consent',
    version: '2.0',
    content: `MEDICAL AUTHORIZATION AND CONSENT TO TREATMENT

I authorize the medical staff at this event to provide emergency medical treatment if I am injured or incapacitated and unable to speak for myself. I understand that this treatment may include first aid, transportation to medical facilities, and other emergency procedures deemed necessary by medical personnel.

I certify that I have disclosed all known medical conditions, medications, and allergies in my registration form. I understand that this information will be available to medical personnel at aid stations and the finish line.

I authorize the release of my medical information to treating physicians and emergency responders as necessary for my care.

I understand that event medical staff are volunteers and may not be licensed physicians. I accept that emergency care in remote wilderness locations may be limited in scope.

By signing this waiver, I confirm that I am physically capable of participating in this event and have trained appropriately for the distance and terrain.`,
    required: true,
  },
  {
    id: 'waiver-photo-v1',
    title: 'Photography and Media Release',
    version: '1.0',
    content: `PHOTOGRAPHY, VIDEO, AND MEDIA RELEASE

I grant the race organization and its authorized representatives permission to photograph, film, and record me during the event and related activities.

I grant the race organization a royalty-free, perpetual, worldwide license to use these images and recordings in promotional materials, social media, websites, publications, and other media without compensation to me.

I waive any right to inspect or approve the final use of such materials. I release the race organization from any claims arising from the authorized use of these materials.

This release does not apply to uses that are defamatory, obscene, or that would constitute an invasion of privacy as defined by applicable law.

This waiver is optional. Opting out will not affect your ability to participate in the event.`,
    required: false,
  },
]

export class MockRegistrationService implements IRegistrationService {
  async startRegistration(raceId: string, editionId: string): Promise<Registration> {
    await delay()

    const runnerId = getCurrentUserId()
    const id = generateId('reg')
    const now = new Date().toISOString()

    const registration: Registration = {
      id,
      raceId,
      editionId,
      runnerId,
      status: 'draft' as RegistrationStatus,
      currentStep: 'personal_info' as RegistrationStep,
      completedSteps: [],
      data: {},
      entryFee: ENTRY_FEES[raceId] ?? 350,
      createdAt: now,
      updatedAt: now,
    }

    const regs = getStoredRegistrations()
    regs.set(id, registration)
    saveStoredRegistrations(regs)

    return registration
  }

  async saveStep(
    registrationId: string,
    step: RegistrationStep,
    data: RegistrationStepData,
  ): Promise<Registration> {
    await delay()

    const regs = getStoredRegistrations()
    const reg = regs.get(registrationId)

    if (!reg) {
      throw new Error(`Registration ${registrationId} not found`)
    }

    const stepOrder: RegistrationStep[] = [
      'personal_info',
      'emergency_contact',
      'medical',
      'waivers',
      'drop_bags',
      'crew',
      'payment',
      'confirmation',
    ]

    const currentIndex = stepOrder.indexOf(step)
    const nextStep = stepOrder[currentIndex + 1] ?? 'confirmation'

    reg.data = { ...reg.data, ...data }
    reg.currentStep = nextStep
    reg.updatedAt = new Date().toISOString()

    if (!reg.completedSteps.includes(step)) {
      reg.completedSteps = [...reg.completedSteps, step]
    }

    regs.set(registrationId, reg)
    saveStoredRegistrations(regs)

    return reg
  }

  async getRegistration(registrationId: string): Promise<Registration> {
    await delay()

    const regs = getStoredRegistrations()
    const reg = regs.get(registrationId)

    if (!reg) {
      throw new Error(`Registration ${registrationId} not found`)
    }

    return reg
  }

  async submitRegistration(registrationId: string): Promise<Registration> {
    await delay()

    const regs = getStoredRegistrations()
    const reg = regs.get(registrationId)

    if (!reg) {
      throw new Error(`Registration ${registrationId} not found`)
    }

    const now = new Date().toISOString()
    reg.status = 'confirmed'
    reg.currentStep = 'confirmation'
    reg.paidAt = now
    reg.updatedAt = now
    reg.confirmationCode = generateConfirmationCode(reg.raceId, reg.runnerId)

    if (!reg.completedSteps.includes('payment')) {
      reg.completedSteps = [...reg.completedSteps, 'payment', 'confirmation']
    }

    regs.set(registrationId, reg)
    saveStoredRegistrations(regs)

    return reg
  }

  async getWaivers(_raceId: string, _editionId: string): Promise<Waiver[]> {
    await delay()
    return WAIVERS
  }

  async getDropBagOptions(raceId: string, _editionId: string): Promise<DropBagLocation[]> {
    await delay()
    return DROP_BAG_OPTIONS[raceId] ?? []
  }

  async getMyRegistrations(): Promise<RegistrationSummary[]> {
    await delay()

    const runnerId = getCurrentUserId()
    const regs = getStoredRegistrations()
    const summaries: RegistrationSummary[] = []

    for (const reg of regs.values()) {
      if (reg.runnerId !== runnerId) continue

      summaries.push({
        id: reg.id,
        raceId: reg.raceId,
        raceName: RACE_NAMES[reg.raceId] ?? reg.raceId,
        editionId: reg.editionId,
        editionYear: EDITION_YEARS[reg.editionId] ?? new Date().getFullYear(),
        startDate: EDITION_START_DATES[reg.editionId] ?? new Date().toISOString(),
        status: reg.status,
        confirmationCode: reg.confirmationCode,
        createdAt: reg.createdAt,
      })
    }

    return summaries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }
}
