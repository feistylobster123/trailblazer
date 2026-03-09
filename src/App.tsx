import { createHashRouter, RouterProvider, Outlet, useLocation, useNavigationType, useRouteError } from 'react-router-dom'
import { useLayoutEffect, useEffect, useRef } from 'react'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'

/**
 * Custom scroll restoration that coordinates with view transitions.
 *
 * React Router's <ScrollRestoration /> restores scroll in a way that can
 * produce a visible frame of wrong scroll position during view transitions
 * (the browser captures the new snapshot before scroll is visually applied).
 *
 * This component saves scroll position continuously and restores it
 * synchronously via direct DOM writes inside useLayoutEffect, which fires
 * within the view transition's flushSync callback -- ensuring the new
 * snapshot is captured at the correct scroll offset.
 */
function ViewTransitionScroll() {
  const { pathname, key, hash } = useLocation()
  const navType = useNavigationType()
  const isFirst = useRef(true)

  // Take over scroll restoration from the browser
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  // Continuously save scroll position per pathname (throttled via rAF)
  useEffect(() => {
    let raf = 0
    const save = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(`__vts_${pathname}`, String(window.scrollY))
      })
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', save)
      // Save final position when leaving this route
      sessionStorage.setItem(`__vts_${pathname}`, String(window.scrollY))
    }
  }, [pathname])

  // Restore scroll synchronously during React commit (runs inside
  // startViewTransition's flushSync so the snapshot gets correct scroll)
  useLayoutEffect(() => {
    // Skip initial render -- browser handles first load scroll
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    // Hash links: scroll to target element
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }

    if (navType === 'POP') {
      // Back / forward: restore saved position
      const saved = parseInt(sessionStorage.getItem(`__vts_${pathname}`) || '0', 10)
      document.documentElement.scrollTop = saved
    } else {
      // Push / replace: scroll to top
      document.documentElement.scrollTop = 0
    }
  }, [pathname, key])

  return null
}

/**
 * iOS-style slide transitions for browser back/forward.
 *
 * React Router only wraps <Link viewTransition> clicks in startViewTransition,
 * NOT popstate-triggered navigations. This hook uses the Navigation API to:
 * 1. Detect traverse (back/forward) navigations
 * 2. Determine direction from history entry indices
 * 3. Wrap the navigation in document.startViewTransition so the existing
 *    lateral-slide CSS (data-nav-direction) animates the page change.
 *
 * Falls back to no animation in browsers without the Navigation API.
 */
function useBackForwardTransition() {
  useEffect(() => {
    const nav = (window as unknown as { navigation?: { currentEntry?: { index: number }; addEventListener: (type: string, handler: (e: NavigateEvent) => void) => void; removeEventListener: (type: string, handler: (e: NavigateEvent) => void) => void } }).navigation
    if (!nav || typeof document.startViewTransition !== 'function') return

    type NavigateEvent = {
      navigationType: string
      canIntercept: boolean
      destination: { index: number }
    }

    const handleNavigate = (e: NavigateEvent) => {
      if (e.navigationType !== 'traverse') return
      if (!e.canIntercept) return

      const fromIdx = nav.currentEntry?.index ?? 0
      const toIdx = e.destination?.index ?? 0
      const dir = toIdx < fromIdx ? 'back' : 'forward'

      document.documentElement.dataset.navDirection = dir

      // Wrap navigation in a view transition so the lateral-slide CSS kicks in.
      // React Router will process the popstate independently; we just need to
      // wait for its DOM update inside the transition callback.
      const transition = document.startViewTransition(async () => {
        await new Promise<void>((resolve) => {
          let settled = false
          const finish = () => {
            if (settled) return
            settled = true
            // One extra frame so React's commit is fully painted
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          }

          const root = document.querySelector('main') ?? document.getElementById('root')!
          const observer = new MutationObserver(() => {
            observer.disconnect()
            finish()
          })
          observer.observe(root, { childList: true, subtree: true })

          // Fallback: if the route doesn't change the DOM (same page), proceed
          setTimeout(() => { observer.disconnect(); finish() }, 500)
        })
      })

      transition.finished.then(() => {
        delete document.documentElement.dataset.navDirection
      }).catch(() => {
        delete document.documentElement.dataset.navDirection
      })
    }

    nav.addEventListener('navigate', handleNavigate as (e: NavigateEvent) => void)
    return () => nav.removeEventListener('navigate', handleNavigate as (e: NavigateEvent) => void)
  }, [])
}

/** Layout route: AppShell wraps all pages, Outlet renders the matched child */
function Layout() {
  useBackForwardTransition()

  return (
    <AppShell>
      <ViewTransitionScroll />
      <Outlet />
    </AppShell>
  )
}

/**
 * When a lazy chunk import fails (usually because the browser cached old
 * index.html pointing to chunk filenames that no longer exist after a
 * redeploy), do one automatic reload to pick up the new assets.
 * A sessionStorage flag prevents infinite reload loops.
 */
async function resilientImport<T>(importFn: () => Promise<T>): Promise<T> {
  try {
    return await importFn()
  } catch (err) {
    const key = 'trailblazer-chunk-retry'
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1')
      window.location.reload()
    } else {
      sessionStorage.removeItem(key)
    }
    throw err
  }
}

/** Error UI for route-level failures (shows inside the AppShell layout) */
function RouteError() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : 'Something went wrong loading this page.'
  const isChunkError = message.includes('module') || message.includes('import') || message.includes('chunk')

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-sm">
        <h3 className="text-lg font-bold text-text mb-2">
          {isChunkError ? 'Page failed to load' : 'Something went wrong'}
        </h3>
        <p className="text-text-secondary text-sm mb-4">
          {isChunkError
            ? 'A new version may have been deployed. Try refreshing.'
            : message}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer"
          >
            Refresh
          </button>
          <button
            onClick={() => { window.location.hash = '#/' }}
            className="px-4 py-2 border border-border text-text rounded-lg text-sm font-medium hover:bg-bg transition-colors cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
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
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        errorElement: <RouteError />,
        lazy: async () => {
          const { LandingPage } = await resilientImport(() => import('./features/landing/LandingPage'))
          return { Component: LandingPage }
        },
      },
      {
        path: '/races/:raceId',
        errorElement: <RouteError />,
        lazy: async () => {
          const [{ RaceDetailPage }, { useRaceStore }] = await Promise.all([
            resilientImport(() => import('./features/race-detail/RaceDetailPage')),
            import('./stores/race.store'),
          ])
          return {
            Component: RaceDetailPage,
            // Route loader runs BEFORE the view transition starts, so
            // race data is in the store when the new snapshot is captured.
            // This eliminates skeleton flash during the container transform.
            loader: async ({ params }: { params: Record<string, string | undefined> }) => {
              const raceId = params.raceId
              if (raceId) {
                await useRaceStore.getState().fetchRace(raceId)
                // Course data can load in background (map/elevation below fold)
                useRaceStore.getState().fetchCourseData(raceId)
              }
              return null
            },
          }
        },
      },
      {
        path: '/races/:raceId/register',
        errorElement: <RouteError />,
        lazy: async () => {
          const m = await resilientImport(() => import('./features/registration/RegistrationPage'))
          return { Component: m.default }
        },
      },
      {
        path: '/races/:raceId/results/:year',
        errorElement: <RouteError />,
        lazy: async () => {
          const m = await resilientImport(() => import('./features/results/ResultsPage'))
          return { Component: m.default }
        },
      },
      {
        path: '/races/:raceId/live',
        errorElement: <RouteError />,
        lazy: async () => {
          const m = await resilientImport(() => import('./features/live-tracking/LiveTrackingPage'))
          return { Component: m.default }
        },
      },
      {
        path: '/races/:raceId/stream',
        errorElement: <RouteError />,
        lazy: async () => {
          const m = await resilientImport(() => import('./features/live-stream/LiveStreamPage'))
          return { Component: m.default }
        },
      },
      {
        path: '/runners/:runnerId',
        errorElement: <RouteError />,
        lazy: async () => {
          const m = await resilientImport(() => import('./features/runner-profile/RunnerProfilePage'))
          return { Component: m.default }
        },
      },
      {
        path: '/crew/:raceId',
        errorElement: <RouteError />,
        lazy: async () => {
          const m = await resilientImport(() => import('./features/crew-portal/CrewPortalPage'))
          return { Component: m.default }
        },
      },
      {
        path: '/login',
        errorElement: <RouteError />,
        lazy: async () => {
          const m = await resilientImport(() => import('./features/auth/LoginPage'))
          return { Component: m.default }
        },
      },
      {
        path: '/register',
        errorElement: <RouteError />,
        lazy: async () => {
          const m = await resilientImport(() => import('./features/auth/RegisterPage'))
          return { Component: m.default }
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
