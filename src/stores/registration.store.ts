import { create } from 'zustand'
import { getService } from '@/services/index'
import type { RegistrationStep, RegistrationStepData } from '@/services/interfaces/registration.service'

// The multi-step registration flow operates against a single Registration
// document identified by registrationId. editionId is stored alongside
// raceId because the service requires both.

interface RegistrationState {
  registrationId: string | null
  raceId: string | null
  editionId: string | null
  currentStep: number
  stepData: Record<string, unknown>
  completedSteps: RegistrationStep[]
  isSubmitting: boolean
  error: string | null

  startRegistration: (raceId: string, editionId: string) => Promise<void>
  saveStep: (step: number, data: unknown) => Promise<void>
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  submitRegistration: () => Promise<boolean>
  reset: () => void
}

// Ordered step keys that map index -> service RegistrationStep name
const STEP_KEYS: RegistrationStep[] = [
  'personal_info',
  'emergency_contact',
  'medical',
  'waivers',
  'drop_bags',
  'crew',
  'payment',
  'confirmation',
]

const INITIAL_STATE = {
  registrationId: null,
  raceId: null,
  editionId: null,
  currentStep: 0,
  stepData: {},
  completedSteps: [] as RegistrationStep[],
  isSubmitting: false,
  error: null,
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  ...INITIAL_STATE,

  startRegistration: async (raceId, editionId) => {
    set({ isSubmitting: true, error: null })
    try {
      const registration = getService('registration')
      const result = await registration.startRegistration(raceId, editionId)
      const stepIndex = STEP_KEYS.indexOf(result.currentStep)
      set({
        registrationId: result.id,
        raceId,
        editionId,
        currentStep: stepIndex >= 0 ? stepIndex : 0,
        completedSteps: result.completedSteps,
        stepData: result.data as Record<string, unknown>,
        isSubmitting: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start registration'
      set({ error: message, isSubmitting: false })
    }
  },

  saveStep: async (step, data) => {
    const { registrationId } = get()
    if (!registrationId) return
    set({ isSubmitting: true, error: null })
    try {
      const registration = getService('registration')
      const stepKey = STEP_KEYS[step]
      if (!stepKey) throw new Error(`Invalid step index: ${step}`)
      const result = await registration.saveStep(
        registrationId,
        stepKey,
        data as RegistrationStepData
      )
      set((s) => ({
        stepData: { ...s.stepData, [stepKey]: data },
        completedSteps: result.completedSteps,
        isSubmitting: false,
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save step'
      set({ error: message, isSubmitting: false })
    }
  },

  nextStep: () =>
    set((s) => ({ currentStep: Math.min(s.currentStep + 1, STEP_KEYS.length - 1) })),

  prevStep: () =>
    set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

  goToStep: (step) =>
    set({ currentStep: Math.max(0, Math.min(step, STEP_KEYS.length - 1)) }),

  submitRegistration: async () => {
    const { registrationId } = get()
    if (!registrationId) return false
    set({ isSubmitting: true, error: null })
    try {
      const registration = getService('registration')
      await registration.submitRegistration(registrationId)
      set({ isSubmitting: false })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed'
      set({ error: message, isSubmitting: false })
      return false
    }
  },

  reset: () => set({ ...INITIAL_STATE }),
}))
