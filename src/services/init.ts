import { registerService } from './index'
import { MockAuthService } from './mock/auth.mock'
import { MockRaceService } from './mock/race.mock'
import { MockRunnerService } from './mock/runner.mock'
import { MockResultsService } from './mock/results.mock'
import { MockRegistrationService } from './mock/registration.mock'
import { MockTrackingService } from './mock/tracking.mock'
import { MockCrewService } from './mock/crew.mock'
import { MockStreamingService } from './mock/streaming.mock'

export function initMockServices() {
  registerService('auth', new MockAuthService())
  registerService('race', new MockRaceService())
  registerService('runner', new MockRunnerService())
  registerService('results', new MockResultsService())
  registerService('registration', new MockRegistrationService())
  registerService('tracking', new MockTrackingService())
  registerService('crew', new MockCrewService())
  registerService('streaming', new MockStreamingService())
}
