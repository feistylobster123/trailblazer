import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary, RouteErrorBoundary } from './components/ErrorBoundary'

const LandingPage = lazy(() => import('./features/landing/LandingPage'))
const RaceDetailPage = lazy(() => import('./features/race-detail/RaceDetailPage'))
const RegistrationPage = lazy(() => import('./features/registration/RegistrationPage'))
const RunnerProfilePage = lazy(() => import('./features/runner-profile/RunnerProfilePage'))
const LiveTrackingPage = lazy(() => import('./features/live-tracking/LiveTrackingPage'))
const LiveStreamPage = lazy(() => import('./features/live-stream/LiveStreamPage'))
const ResultsPage = lazy(() => import('./features/results/ResultsPage'))
const CrewPortalPage = lazy(() => import('./features/crew-portal/CrewPortalPage'))
const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-text-secondary text-sm">Loading...</p>
      </div>
    </div>
  )
}

function WrappedRoute({ element }: { element: React.ReactNode }) {
  return (
    <RouteErrorBoundary>
      {element}
    </RouteErrorBoundary>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppShell>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<WrappedRoute element={<LandingPage />} />} />
              <Route path="/races/:raceId" element={<WrappedRoute element={<RaceDetailPage />} />} />
              <Route path="/races/:raceId/register" element={<WrappedRoute element={<RegistrationPage />} />} />
              <Route path="/races/:raceId/results/:year" element={<WrappedRoute element={<ResultsPage />} />} />
              <Route path="/races/:raceId/live" element={<WrappedRoute element={<LiveTrackingPage />} />} />
              <Route path="/races/:raceId/stream" element={<WrappedRoute element={<LiveStreamPage />} />} />
              <Route path="/runners/:runnerId" element={<WrappedRoute element={<RunnerProfilePage />} />} />
              <Route path="/crew/:raceId" element={<WrappedRoute element={<CrewPortalPage />} />} />
              <Route path="/login" element={<WrappedRoute element={<LoginPage />} />} />
              <Route path="/register" element={<WrappedRoute element={<RegisterPage />} />} />
            </Routes>
          </Suspense>
        </AppShell>
      </HashRouter>
    </ErrorBoundary>
  )
}
