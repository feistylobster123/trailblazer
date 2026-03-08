export type RegistrationStep =
  | 'runner_info'
  | 'medical'
  | 'waivers'
  | 'crew_pacer'
  | 'drop_bags'
  | 'payment'
  | 'confirmation'

export type CrewMember = {
  name: string
  phone: string
  email: string
  relationship: string
  vehicleDescription: string
}

export type PacerInfo = {
  name: string
  phone: string
  email: string
  experience: string
  startStation: string
}

export type DropBag = {
  stationId: string
  stationName: string
  items: string[]
  notes: string
}

export type RegistrationData = {
  id: string
  raceId: string
  runnerId: string
  currentStep: RegistrationStep
  completedSteps: RegistrationStep[]
  runnerInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    gender: string
    city: string
    state: string
    country: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelationship: string
  }
  medical: {
    bloodType: string
    allergies: string[]
    medications: string[]
    conditions: string[]
    insuranceProvider: string
    insurancePolicyNumber: string
  }
  waivers: {
    accepted: Record<string, boolean>
    signatureDataUrl: string
    signedAt: string
  }
  crewPacer: {
    crew: CrewMember[]
    pacer: PacerInfo | null
  }
  dropBags: {
    bags: DropBag[]
  }
  payment: {
    method: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    transactionId: string | null
    amount: number
  }
}

export type RegistrationStatus = {
  registrationId: string
  raceId: string
  raceName: string
  runnerId: string
  status: 'draft' | 'submitted' | 'confirmed' | 'waitlisted' | 'cancelled'
  submittedAt: string | null
  bibNumber: string | null
}

export type WaiverDocument = {
  id: string
  title: string
  content: string
  required: boolean
}

export type DropBagConfig = {
  stations: Array<{
    stationId: string
    stationName: string
    distanceKm: number
    allowedCount: number
    weightLimitKg: number | null
  }>
  instructions: string
}
