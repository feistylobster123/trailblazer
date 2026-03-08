import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary, RouteErrorBoundary } from './components/ErrorBoundary'

/** Layout route: AppShell wraps all pages, Outlet renders the matched child */
function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

/**
 * Routes use React Router's lazy() instead of React.lazy.
 * This ensures the chunk is fully loaded BEFORE view transitions start,
 * so container transform elements (viewTransitionName) are in the DOM
 * when the browser captures the new snapshot.
 */
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        lazy: async () => {
          const { LandingPage } = await import('./features/landing/LandingPage')
          return { element: <RouteErrorBoundary><LandingPage /></RouteErrorBoundary> }
        },
      },
      {
        path: '/races/:raceId',
        lazy: async () => {
          const { RaceDetailPage } = await import('./features/race-detail/RaceDetailPage')
          return { element: <RouteErrorBoundary><RaceDetailPage /></RouteErrorBoundary> }
        },
      },
      {
        path: '/races/:raceId/register',
        lazy: async () => {
          const m = await import('./features/registration/RegistrationPage')
          return { element: <RouteErrorBoundary><m.default /></RouteErrorBoundary> }
        },
      },
      {
        path: '/races/:raceId/results/:year',
        lazy: async () => {
          const m = await import('./features/results/ResultsPage')
          return { element: <RouteErrorBoundary><m.default /></RouteErrorBoundary> }
        },
      },
      {
        path: '/races/:raceId/live',
        lazy: async () => {
          const m = await import('./features/live-tracking/LiveTrackingPage')
          return { element: <RouteErrorBoundary><m.default /></RouteErrorBoundary> }
        },
      },
      {
        path: '/races/:raceId/stream',
        lazy: async () => {
          const m = await import('./features/live-stream/LiveStreamPage')
          return { element: <RouteErrorBoundary><m.default /></RouteErrorBoundary> }
        },
      },
      {
        path: '/runners/:runnerId',
        lazy: async () => {
          const m = await import('./features/runner-profile/RunnerProfilePage')
          return { element: <RouteErrorBoundary><m.default /></RouteErrorBoundary> }
        },
      },
      {
        path: '/crew/:raceId',
        lazy: async () => {
          const m = await import('./features/crew-portal/CrewPortalPage')
          return { element: <RouteErrorBoundary><m.default /></RouteErrorBoundary> }
        },
      },
      {
        path: '/login',
        lazy: async () => {
          const m = await import('./features/auth/LoginPage')
          return { element: <RouteErrorBoundary><m.default /></RouteErrorBoundary> }
        },
      },
      {
        path: '/register',
        lazy: async () => {
          const m = await import('./features/auth/RegisterPage')
          return { element: <RouteErrorBoundary><m.default /></RouteErrorBoundary> }
        },
      },
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
