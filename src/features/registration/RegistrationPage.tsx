import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useRace } from '@/hooks/useRace'
import { useRegistration } from '@/hooks/useRegistration'
import { PageHeader } from '@/components/layout/PageHeader'
import { Stepper } from '@/components/ui/Stepper'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { label: 'Personal Info' },
  { label: 'Emergency Contact' },
  { label: 'Medical Info' },
  { label: 'Waivers' },
  { label: 'Drop Bags' },
  { label: 'Review & Pay' },
]

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const TSHIRT_OPTIONS = [
  { value: '', label: 'Select size' },
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' },
]

const BLOOD_TYPE_OPTIONS = [
  { value: '', label: 'Select blood type' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'unknown', label: 'Unknown' },
]

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select relationship' },
  { value: 'spouse', label: 'Spouse / Partner' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'child', label: 'Child' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' },
]

// ---------------------------------------------------------------------------
// Step forms
// ---------------------------------------------------------------------------

interface PersonalInfoData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  tshirtSize: string
  country: string
  cityState: string
}

interface EmergencyContactData {
  primaryName: string
  primaryPhone: string
  primaryRelationship: string
  secondaryName: string
  secondaryPhone: string
  secondaryRelationship: string
}

interface MedicalData {
  allergies: string
  medications: string
  conditions: string
  bloodType: string
}

interface WaiversData {
  accepted: Record<string, boolean>
}

interface DropBagsData {
  selectedStations: Record<string, boolean>
}

// ---------------------------------------------------------------------------
// Step 1: Personal Info
// ---------------------------------------------------------------------------

function StepPersonalInfo({
  data,
  onChange,
  errors,
}: {
  data: PersonalInfoData
  onChange: (data: PersonalInfoData) => void
  errors: Partial<Record<keyof PersonalInfoData, string>>
}) {
  const set = (key: keyof PersonalInfoData, val: string) =>
    onChange({ ...data, [key]: val })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          required
          value={data.firstName}
          onChange={(e) => set('firstName', e.target.value)}
          error={errors.firstName}
          placeholder="Jane"
        />
        <Input
          label="Last Name"
          required
          value={data.lastName}
          onChange={(e) => set('lastName', e.target.value)}
          error={errors.lastName}
          placeholder="Smith"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          required
          value={data.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          placeholder="jane@example.com"
        />
        <Input
          label="Phone"
          type="tel"
          required
          value={data.phone}
          onChange={(e) => set('phone', e.target.value)}
          error={errors.phone}
          placeholder="+1 555 000 0000"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          required
          value={data.dateOfBirth}
          onChange={(e) => set('dateOfBirth', e.target.value)}
          error={errors.dateOfBirth}
        />
        <Select
          label="Gender"
          required
          options={GENDER_OPTIONS}
          value={data.gender}
          onChange={(e) => set('gender', e.target.value)}
          error={errors.gender}
        />
      </div>
      <Select
        label="T-Shirt Size"
        options={TSHIRT_OPTIONS}
        value={data.tshirtSize}
        onChange={(e) => set('tshirtSize', e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Country"
          required
          value={data.country}
          onChange={(e) => set('country', e.target.value)}
          error={errors.country}
          placeholder="United States"
        />
        <Input
          label="City / State"
          required
          value={data.cityState}
          onChange={(e) => set('cityState', e.target.value)}
          error={errors.cityState}
          placeholder="Boulder, CO"
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2: Emergency Contact
// ---------------------------------------------------------------------------

function StepEmergencyContact({
  data,
  onChange,
  errors,
}: {
  data: EmergencyContactData
  onChange: (data: EmergencyContactData) => void
  errors: Partial<Record<keyof EmergencyContactData, string>>
}) {
  const set = (key: keyof EmergencyContactData, val: string) =>
    onChange({ ...data, [key]: val })

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold text-text mb-4">Primary Emergency Contact</h3>
        <div className="space-y-4">
          <Input
            label="Full Name"
            required
            value={data.primaryName}
            onChange={(e) => set('primaryName', e.target.value)}
            error={errors.primaryName}
            placeholder="John Smith"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              required
              value={data.primaryPhone}
              onChange={(e) => set('primaryPhone', e.target.value)}
              error={errors.primaryPhone}
              placeholder="+1 555 000 0000"
            />
            <Select
              label="Relationship"
              required
              options={RELATIONSHIP_OPTIONS}
              value={data.primaryRelationship}
              onChange={(e) => set('primaryRelationship', e.target.value)}
              error={errors.primaryRelationship}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-text mb-1">Secondary Emergency Contact</h3>
        <p className="text-sm text-text-secondary mb-4">Optional</p>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={data.secondaryName}
            onChange={(e) => set('secondaryName', e.target.value)}
            placeholder="Alex Johnson"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              value={data.secondaryPhone}
              onChange={(e) => set('secondaryPhone', e.target.value)}
              placeholder="+1 555 000 0000"
            />
            <Select
              label="Relationship"
              options={RELATIONSHIP_OPTIONS}
              value={data.secondaryRelationship}
              onChange={(e) => set('secondaryRelationship', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3: Medical Info
// ---------------------------------------------------------------------------

function StepMedicalInfo({
  data,
  onChange,
}: {
  data: MedicalData
  onChange: (data: MedicalData) => void
}) {
  const set = (key: keyof MedicalData, val: string) =>
    onChange({ ...data, [key]: val })

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Known Allergies
        </label>
        <textarea
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
            placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20
            focus:border-primary transition-colors resize-y min-h-[80px]"
          value={data.allergies}
          onChange={(e) => set('allergies', e.target.value)}
          placeholder="List any known allergies (food, medication, environmental)..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Current Medications
        </label>
        <textarea
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
            placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20
            focus:border-primary transition-colors resize-y min-h-[80px]"
          value={data.medications}
          onChange={(e) => set('medications', e.target.value)}
          placeholder="List any medications you regularly take..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">
          Medical Conditions
        </label>
        <textarea
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text
            placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20
            focus:border-primary transition-colors resize-y min-h-[80px]"
          value={data.conditions}
          onChange={(e) => set('conditions', e.target.value)}
          placeholder="List any medical conditions race staff should know about..."
        />
      </div>
      <Select
        label="Blood Type"
        options={BLOOD_TYPE_OPTIONS}
        value={data.bloodType}
        onChange={(e) => set('bloodType', e.target.value)}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4: Waivers
// ---------------------------------------------------------------------------

const MOCK_WAIVERS = [
  {
    id: 'liability',
    title: 'Liability Waiver',
    required: true,
    content:
      'I understand that trail running and ultramarathon events involve inherent risks including but not limited to bodily injury, property damage, and death. I voluntarily assume all such risks associated with participating in this event. I release the race organizers, sponsors, volunteers, and all associated parties from any and all liability arising from my participation.',
  },
  {
    id: 'medical',
    title: 'Medical Release',
    required: true,
    content:
      'I authorize race medical staff to provide emergency medical treatment as deemed necessary. I consent to the use of my medical information for the purpose of providing care during the event. I acknowledge that medical staff decisions regarding my fitness to continue are final.',
  },
  {
    id: 'photo',
    title: 'Photo & Media Release',
    required: false,
    content:
      'I grant the race organizers permission to use photographs, video recordings, and other media captured during the event for promotional and educational purposes without compensation.',
  },
]

function StepWaivers({
  data,
  onChange,
  errors,
}: {
  data: WaiversData
  onChange: (data: WaiversData) => void
  errors: { waivers?: string }
}) {
  const toggle = (id: string, checked: boolean) =>
    onChange({ accepted: { ...data.accepted, [id]: checked } })

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Please read and accept the following documents. Required waivers must be signed to complete registration.
      </p>
      {MOCK_WAIVERS.map((waiver) => (
        <Card key={waiver.id} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text">{waiver.title}</h3>
            {waiver.required && (
              <span className="text-xs font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                Required
              </span>
            )}
          </div>
          <div className="max-h-36 overflow-y-auto rounded-lg bg-bg border border-border p-3 text-sm text-text-secondary leading-relaxed">
            {waiver.content}
          </div>
          <Checkbox
            id={`waiver-${waiver.id}`}
            label={
              waiver.required
                ? `I have read and accept the ${waiver.title}`
                : `I accept the ${waiver.title} (optional)`
            }
            checked={!!data.accepted[waiver.id]}
            onChange={(e) => toggle(waiver.id, e.target.checked)}
          />
        </Card>
      ))}
      {errors.waivers && (
        <p className="text-sm text-danger">{errors.waivers}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 5: Drop Bags
// ---------------------------------------------------------------------------

const MOCK_DROP_BAG_STATIONS = [
  { id: 'mile-30', name: 'Foresthill (Mile 30)', distance: 30 },
  { id: 'mile-55', name: 'Rucky Chucky (Mile 55)', distance: 55 },
  { id: 'mile-78', name: 'Green Gate (Mile 78)', distance: 78 },
  { id: 'mile-93', name: 'No Hands Bridge (Mile 93)', distance: 93 },
]

function StepDropBags({
  data,
  onChange,
}: {
  data: DropBagsData
  onChange: (data: DropBagsData) => void
}) {
  const toggle = (id: string, checked: boolean) =>
    onChange({ selectedStations: { ...data.selectedStations, [id]: checked } })

  return (
    <div className="space-y-5">
      <p className="text-sm text-text-secondary">
        Select the aid stations where you want to send drop bags. This step is optional.
      </p>
      <div className="space-y-3">
        {MOCK_DROP_BAG_STATIONS.map((station) => (
          <Card key={station.id} padding="sm">
            <Checkbox
              id={`dropbag-${station.id}`}
              label={station.name}
              description={`Mile ${station.distance}`}
              checked={!!data.selectedStations[station.id]}
              onChange={(e) => toggle(station.id, e.target.checked)}
            />
          </Card>
        ))}
      </div>
      <p className="text-xs text-text-secondary">
        Drop bag instructions and weight limits will be provided after registration is confirmed.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 6: Review & Pay
// ---------------------------------------------------------------------------

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary sm:w-40 shrink-0">{label}</span>
      <span className="text-sm text-text font-medium">{value || 'Not provided'}</span>
    </div>
  )
}

function StepReviewAndPay({
  personalInfo,
  emergencyContact,
  medical,
  dropBags,
  entryFee,
  currency,
  onSubmit,
  isSubmitting,
}: {
  personalInfo: PersonalInfoData
  emergencyContact: EmergencyContactData
  medical: MedicalData
  dropBags: DropBagsData
  entryFee: number
  currency: string
  onSubmit: () => void
  isSubmitting: boolean
}) {
  const selectedBagCount = Object.values(dropBags.selectedStations).filter(Boolean).length
  const selectedStationNames = MOCK_DROP_BAG_STATIONS.filter(
    (s) => dropBags.selectedStations[s.id]
  )
    .map((s) => s.name)
    .join(', ')

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Personal Information</h3>
        <ReviewRow label="Name" value={`${personalInfo.firstName} ${personalInfo.lastName}`} />
        <ReviewRow label="Email" value={personalInfo.email} />
        <ReviewRow label="Phone" value={personalInfo.phone} />
        <ReviewRow label="Date of Birth" value={personalInfo.dateOfBirth} />
        <ReviewRow label="Gender" value={personalInfo.gender} />
        <ReviewRow label="Location" value={personalInfo.cityState ? `${personalInfo.cityState}, ${personalInfo.country}` : personalInfo.country} />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Emergency Contact</h3>
        <ReviewRow label="Name" value={emergencyContact.primaryName} />
        <ReviewRow label="Phone" value={emergencyContact.primaryPhone} />
        <ReviewRow label="Relationship" value={emergencyContact.primaryRelationship} />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Medical Info</h3>
        <ReviewRow label="Blood Type" value={medical.bloodType} />
        <ReviewRow label="Allergies" value={medical.allergies || 'None'} />
        <ReviewRow label="Medications" value={medical.medications || 'None'} />
        <ReviewRow label="Conditions" value={medical.conditions || 'None'} />
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-text mb-3">Drop Bags</h3>
        <ReviewRow
          label="Stations"
          value={selectedBagCount > 0 ? selectedStationNames : 'None selected'}
        />
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text">Entry Fee</p>
            <p className="text-xs text-text-secondary mt-0.5">Payment processed securely</p>
          </div>
          <p className="text-2xl font-extrabold text-primary">
            {currency} {entryFee.toFixed(2)}
          </p>
        </div>
      </Card>

      <Button
        variant="accent"
        size="lg"
        className="w-full"
        onClick={onSubmit}
        loading={isSubmitting}
      >
        Submit Registration
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Confirmation screen
// ---------------------------------------------------------------------------

function ConfirmationScreen({
  confirmationCode,
  raceName,
  onDone,
}: {
  confirmationCode: string
  raceName: string
  onDone: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center py-8 space-y-6">
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
          <path d="M6 16l8 8 12-12" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-text">Registration Submitted!</h2>
        <p className="text-text-secondary mt-2">
          You're registered for {raceName}. Check your email for confirmation.
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <p className="text-xs text-text-secondary uppercase tracking-wide mb-1">Confirmation Number</p>
        <p className="text-xl font-extrabold text-primary font-mono tracking-widest">
          {confirmationCode}
        </p>
      </Card>
      <Button variant="primary" onClick={onDone}>
        Back to Race
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validatePersonalInfo(data: PersonalInfoData): Partial<Record<keyof PersonalInfoData, string>> {
  const errors: Partial<Record<keyof PersonalInfoData, string>> = {}
  if (!data.firstName.trim()) errors.firstName = 'Required'
  if (!data.lastName.trim()) errors.lastName = 'Required'
  if (!data.email.trim()) errors.email = 'Required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Invalid email'
  if (!data.phone.trim()) errors.phone = 'Required'
  if (!data.dateOfBirth) errors.dateOfBirth = 'Required'
  if (!data.gender) errors.gender = 'Required'
  if (!data.country.trim()) errors.country = 'Required'
  if (!data.cityState.trim()) errors.cityState = 'Required'
  return errors
}

function validateEmergencyContact(data: EmergencyContactData): Partial<Record<keyof EmergencyContactData, string>> {
  const errors: Partial<Record<keyof EmergencyContactData, string>> = {}
  if (!data.primaryName.trim()) errors.primaryName = 'Required'
  if (!data.primaryPhone.trim()) errors.primaryPhone = 'Required'
  if (!data.primaryRelationship) errors.primaryRelationship = 'Required'
  return errors
}

function validateWaivers(data: WaiversData): { waivers?: string } {
  const allRequired = MOCK_WAIVERS.filter((w) => w.required).every((w) => data.accepted[w.id])
  if (!allRequired) return { waivers: 'You must accept all required waivers to continue.' }
  return {}
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function RegistrationPage() {
  const { raceId } = useParams<{ raceId: string }>()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { race } = useRace(raceId)
  const { currentStep, isSubmitting, startRegistration, saveStep, nextStep, prevStep, submit } =
    useRegistration(raceId)

  const [started, setStarted] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState('')

  // Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '', tshirtSize: '', country: '', cityState: '',
  })
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContactData>({
    primaryName: '', primaryPhone: '', primaryRelationship: '',
    secondaryName: '', secondaryPhone: '', secondaryRelationship: '',
  })
  const [medical, setMedical] = useState<MedicalData>({
    allergies: '', medications: '', conditions: '', bloodType: '',
  })
  const [waivers, setWaivers] = useState<WaiversData>({ accepted: {} })
  const [dropBags, setDropBags] = useState<DropBagsData>({ selectedStations: {} })

  // Validation errors
  const [personalErrors, setPersonalErrors] = useState<Partial<Record<keyof PersonalInfoData, string>>>({})
  const [emergencyErrors, setEmergencyErrors] = useState<Partial<Record<keyof EmergencyContactData, string>>>({})
  const [waiverErrors, setWaiverErrors] = useState<{ waivers?: string }>({})

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
    }
  }, [isLoggedIn, navigate])

  // Start registration on mount
  useEffect(() => {
    if (raceId && isLoggedIn && !started) {
      setStarted(true)
      startRegistration(raceId)
    }
  }, [raceId, isLoggedIn, started, startRegistration])

  if (!isLoggedIn) return null

  const raceName = race?.name ?? 'Race Registration'

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async function handleNext() {
    if (currentStep === 0) {
      const errors = validatePersonalInfo(personalInfo)
      if (Object.keys(errors).length > 0) { setPersonalErrors(errors); return }
      setPersonalErrors({})
      await saveStep(0, {
        personalInfo: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          dateOfBirth: personalInfo.dateOfBirth,
          gender: personalInfo.gender,
          city: personalInfo.cityState,
          country: personalInfo.country,
        },
      })
      nextStep()
    } else if (currentStep === 1) {
      const errors = validateEmergencyContact(emergencyContact)
      if (Object.keys(errors).length > 0) { setEmergencyErrors(errors); return }
      setEmergencyErrors({})
      await saveStep(1, {
        emergencyContact: {
          name: emergencyContact.primaryName,
          phone: emergencyContact.primaryPhone,
          relationship: emergencyContact.primaryRelationship,
        },
      })
      nextStep()
    } else if (currentStep === 2) {
      await saveStep(2, {
        medical: {
          bloodType: medical.bloodType,
          allergies: medical.allergies,
          medications: medical.medications,
          medicalConditions: medical.conditions,
        },
      })
      nextStep()
    } else if (currentStep === 3) {
      const errors = validateWaivers(waivers)
      if (errors.waivers) { setWaiverErrors(errors); return }
      setWaiverErrors({})
      await saveStep(3, { waivers: waivers.accepted })
      nextStep()
    } else if (currentStep === 4) {
      const selected = Object.entries(dropBags.selectedStations)
        .filter(([, checked]) => checked)
        .map(([id]) => ({ aidStationId: id, bagCount: 1 }))
      await saveStep(4, { dropBags: selected })
      nextStep()
    }
  }

  async function handleSubmit() {
    const success = await submit()
    if (success) {
      const code = `TB-${Math.random().toString(36).toUpperCase().slice(2, 8)}`
      setConfirmationCode(code)
      setConfirmed(true)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ConfirmationScreen
          confirmationCode={confirmationCode}
          raceName={raceName}
          onDone={() => navigate(`/races/${raceId}`)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <PageHeader
        title="Register"
        subtitle={raceName}
        backLink={`/races/${raceId}`}
        backLabel="Back to race"
      />

      <Stepper steps={STEPS} currentStep={currentStep} className="mb-8" />

      <Card className="mb-6">
        {currentStep === 0 && (
          <StepPersonalInfo data={personalInfo} onChange={setPersonalInfo} errors={personalErrors} />
        )}
        {currentStep === 1 && (
          <StepEmergencyContact data={emergencyContact} onChange={setEmergencyContact} errors={emergencyErrors} />
        )}
        {currentStep === 2 && (
          <StepMedicalInfo data={medical} onChange={setMedical} />
        )}
        {currentStep === 3 && (
          <StepWaivers data={waivers} onChange={setWaivers} errors={waiverErrors} />
        )}
        {currentStep === 4 && (
          <StepDropBags data={dropBags} onChange={setDropBags} />
        )}
        {currentStep === 5 && (
          <StepReviewAndPay
            personalInfo={personalInfo}
            emergencyContact={emergencyContact}
            medical={medical}
            dropBags={dropBags}
            entryFee={race?.currentEdition?.entryFee ?? 395}
            currency={'USD'}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </Card>

      {currentStep < 5 && (
        <div className="flex justify-between pb-8">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            loading={isSubmitting}
          >
            {currentStep === 4 ? 'Continue to Review' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default RegistrationPage
