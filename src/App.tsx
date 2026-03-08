import { Suspense, lazy } from 'react'
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
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

/** Layout route: AppShell wraps all pages, Outlet renders the matched child */
function Layout() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
    </AppShell>
  )
}

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <WrappedRoute element={<LandingPage />} /> },
      { path: '/races/:raceId', element: <WrappedRoute element={<RaceDetailPage />} /> },
      { path: '/races/:raceId/register', element: <WrappedRoute element={<RegistrationPage />} /> },
      { path: '/races/:raceId/results/:year', element: <WrappedRoute element={<ResultsPage />} /> },
      { path: '/races/:raceId/live', element: <WrappedRoute element={<LiveTrackingPage />} /> },
      { path: '/races/:raceId/stream', element: <WrappedRoute element={<LiveStreamPage />} /> },
      { path: '/runners/:runnerId', element: <WrappedRoute element={<RunnerProfilePage />} /> },
      { path: '/crew/:raceId', element: <WrappedRoute element={<CrewPortalPage />} /> },
      { path: '/login', element: <WrappedRoute element={<LoginPage />} /> },
      { path: '/register', element: <WrappedRoute element={<RegisterPage />} /> },
    ],
  },
])

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
