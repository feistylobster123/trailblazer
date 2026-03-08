// Service registry - dependency injection container
// Components never import mock implementations directly

import type { IAuthService } from './interfaces/auth.service'
import type { IRaceService } from './interfaces/race.service'
import type { IRunnerService } from './interfaces/runner.service'
import type { IRegistrationService } from './interfaces/registration.service'
import type { ITrackingService } from './interfaces/tracking.service'
import type { IResultsService } from './interfaces/results.service'
import type { ICrewService } from './interfaces/crew.service'
import type { IStreamingService } from './interfaces/streaming.service'

export interface ServiceMap {
  auth: IAuthService
  race: IRaceService
  runner: IRunnerService
  registration: IRegistrationService
  tracking: ITrackingService
  results: IResultsService
  crew: ICrewService
  streaming: IStreamingService
}

const registry = new Map<string, unknown>()

export function registerService<K extends keyof ServiceMap>(
  key: K,
  implementation: ServiceMap[K]
): void {
  registry.set(key, implementation)
}

export function getService<K extends keyof ServiceMap>(key: K): ServiceMap[K] {
  const service = registry.get(key)
  if (!service) throw new Error(`Service "${key}" not registered. Did you call initMockServices()?`)
  return service as ServiceMap[K]
}
