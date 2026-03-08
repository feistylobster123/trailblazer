import { useRegistrationStore } from '@/stores/registration.store'

export function useRegistration(raceId?: string) {
  const store = useRegistrationStore()

  return {
    currentStep: store.currentStep,
    stepData: store.stepData,
    registrationId: store.registrationId,
    isSubmitting: store.isSubmitting,
    error: store.error,

    startRegistration: () => raceId ? store.startRegistration(raceId) : Promise.resolve(),
    saveStep: store.saveStep,
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    goToStep: store.goToStep,
    submit: store.submitRegistration,
    reset: store.reset,
  }
}
